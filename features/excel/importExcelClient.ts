"use client";

import { supabaseAnonClient } from "@/lib/anon-supabase";
import { ADD_PRODUCT_METHOD } from "@/models/enums/product.enum";
import { chunkItems } from "@/lib/utils/pagination.util";
import {
    createExcelImportUpload,
    saveImportBatch,
} from "./actions/import-excel.action";
import {
    Product
} from "@/models/product.model";

const IMPORT_BATCH_SIZE = 1000;

export type ImportProgress = {
    savedRows: number;
    totalRows: number;
};

type ImportRow = {
    product_id: string;
    user_id?: string;
    product_type_id?: number | null;
    bill_id?: number | null;
    method?: string | null;
    product_score_option_id?: number | null;
    expire_years?: number | null;
    point_multiplier?: number | null;
};

function toInt(v: any): number | null {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

function asString(v: any) {
    return String(v ?? "").trim();
}

/**
 * นำเข้าไฟล์ Excel: ตรวจไฟล์ เก็บไฟล์ต้นฉบับ แล้วบันทึกทีละชุด
 *
 * @param file - ไฟล์ .xlsx
 * @param onProgress - เรียกทุกครั้งที่บันทึกเสร็จหนึ่งชุด
 * @returns path ของไฟล์ที่เก็บไว้และจำนวนแถวที่นำเข้า
 * @throws Error เมื่อไฟล์ไม่ถูกต้องหรือบันทึกไม่สำเร็จ โดยข้อความบอกจำนวนแถวที่บันทึกไปแล้ว
 */
export async function importExcelToSupabaseClientOnly(
    file: File,
    onProgress?: (progress: ImportProgress) => void
) {
    const buffer = await file.arrayBuffer();

    // 1) parse excel ก่อนอัปโหลด ไฟล์ผิด template จะได้ไม่ต้องรออัปโหลด
    // โหลด exceljs ตอนใช้งาน เพราะ library ใหญ่และทำให้หน้าผู้ใช้เปิดช้า
    const { default: ExcelJS } = await import("exceljs");
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);

    const ws = wb.worksheets[0];
    if (!ws) throw new Error("ไฟล์ Excel ไม่มีชีท");

    const header = ws.getRow(1).values as any[];
    const colIndex: Record<string, number> = {};
    header.forEach((v, i) => {
        const key = asString(v);
        if (key) colIndex[key] = i;
    });

    if (!colIndex["product_id"]) {
        throw new Error("Template ไม่ถูกต้อง: ต้องมีคอลัมน์ product_id");
    }

    const rows: ImportRow[] = [];

    ws.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        const product_id = asString(row.getCell(colIndex["product_id"]).value);
        if (!product_id) return;

        const user_id = asString(row.getCell(colIndex["user_id"])?.value) || undefined;

        rows.push({
            product_id,
            user_id,
            product_type_id: toInt(row.getCell(colIndex["product_type_id"])?.value),
            bill_id: toInt(row.getCell(colIndex["bill_id"])?.value),
            method: asString(row.getCell(colIndex["method"])?.value) || null,
            product_score_option_id: toInt(row.getCell(colIndex["product_score_option_id"])?.value) ?? 1,
            expire_years: toInt(row.getCell(colIndex["expire_years"])?.value) ?? 2,
            point_multiplier: toInt(row.getCell(colIndex["point_multiplier"])?.value),
        });
    });

    if (!rows.length) throw new Error("ไม่มีข้อมูลให้ import");

    // 2) ขอ signed URL จาก Server Action ซึ่งยืนยันได้ทั้ง LINE และอีเมล
    const bucket = "excel-imports";
    const path = `users_import/${Date.now()}_${file.name}`;
    const signedUpload = await createExcelImportUpload({ path });

    if (!signedUpload?.data) {
        throw new Error(signedUpload?.serverError ?? "ไม่สามารถเตรียมการอัปโหลดไฟล์ได้");
    }

    const uploadRes = await supabaseAnonClient.storage.from(bucket).uploadToSignedUrl(
        path,
        signedUpload.data.token,
        buffer,
        {
        contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        upsert: false,
        }
    );

    if (uploadRes.error) {
        throw new Error(`อัปโหลดไฟล์ไม่สำเร็จ: ${uploadRes.error.message}`);
    }

    // 3) บันทึกทีละชุด เพื่อไม่ให้ request เดียวชนเพดานขนาดและเวลาของ Vercel
    const nowIso = new Date().toISOString();
    let savedRows = 0;

    for (const batch of chunkItems(rows, IMPORT_BATCH_SIZE)) {
        const products: Omit<Product, "created_at" | "updated_at">[] = batch.map((r) => ({
            id: r.product_id,
            method: ADD_PRODUCT_METHOD.EXCEL,
            product_type_id: r.product_type_id ?? null,
            bill_id: r.bill_id != null ? String(r.bill_id) : null, // ✅ number -> string
            updated_by_user_id: r.user_id ?? null,
        }));

        // **ตาม schema ของคุณ unique(product_id)** → ใช้ onConflict: "product_id"
        const scannedBarcodes = batch.map((r) => {
            const years = r.expire_years ?? 2;
            const expired = new Date();
            expired.setFullYear(expired.getFullYear() + years);

            return {
                product_id: r.product_id,
                user_id: r.user_id ?? null,
                created_date: nowIso,
                expired_date: expired.toISOString().slice(0, 10), // date
                product_score_option_id: r.product_score_option_id ?? 1,
                point_multiplier: r.point_multiplier ?? null,
            };
        });

        const result = await saveImportBatch({ products, scannedBarcodes });

        if (!result || result.serverError || result.validationErrors) {
            throw new Error(
                `บันทึกไปแล้ว ${savedRows} จาก ${rows.length} แถว แล้วเกิดข้อผิดพลาด: ${
                    result?.serverError ?? "ข้อมูลในไฟล์ไม่ถูกต้อง"
                } (นำเข้าไฟล์เดิมซ้ำได้ แถวที่บันทึกแล้วจะถูกข้าม)`
            );
        }

        savedRows += batch.length;
        onProgress?.({ savedRows, totalRows: rows.length });
    }

    return {
        uploadedPath: path,
        imported: rows.length,
    };
}
