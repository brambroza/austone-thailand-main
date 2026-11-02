"use server";

import { authSafeActionClient } from "@/lib/safe-action";
import { supabaseAdminClient } from "@/lib/supabase";
import { ADD_PRODUCT_METHOD } from "@/models/enums/product.enum";
import { z } from "zod";

const EXCEL_IMPORT_BUCKET = "excel-imports";
const MAX_ROWS_PER_BATCH = 1000;

const ProductRowSchema = z.object({
  id: z.string().min(1),
  method: z.nativeEnum(ADD_PRODUCT_METHOD),
  product_type_id: z.number().nullable(),
  bill_id: z.string().nullable(),
  updated_by_user_id: z.string().nullable(),
});

const ScannedBarcodeSchema = z.object({
  product_id: z.string().min(1),
  user_id: z.string().nullable(),
  created_date: z.string().datetime(),
  expired_date: z.string(),
  product_score_option_id: z.number().int(),
  point_multiplier: z.number().nullable(),
});

const ImportBatchSchema = z.object({
  products: z.array(ProductRowSchema).min(1).max(MAX_ROWS_PER_BATCH),
  scannedBarcodes: z.array(ScannedBarcodeSchema).min(1).max(MAX_ROWS_PER_BATCH),
});

async function requireAdmin(userId: string) {
  const { data, error } = await supabaseAdminClient
    .from("user_info_view")
    .select("role_title")
    .eq("user_id", userId)
    .single();

  if (error || data?.role_title !== "ADMIN") {
    throw new Error("คุณไม่มีสิทธิในการนำเข้าไฟล์");
  }
}

export const createExcelImportUpload = authSafeActionClient
  .schema(z.object({ path: z.string().min(1) }))
  .action(async ({ ctx, parsedInput: { path } }) => {
    await requireAdmin(ctx.user.id);

    const { data, error } = await supabaseAdminClient.storage
      .from(EXCEL_IMPORT_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data) {
      throw new Error(error?.message ?? "ไม่สามารถเตรียมการอัปโหลดไฟล์ได้");
    }

    return data;
  });

/**
 * บันทึกสินค้าและประวัติการสแกนหนึ่งชุด
 * ผู้เรียกต้องแบ่งไฟล์เป็นชุด เพราะ request เดียวบน Vercel มีเพดานขนาดและเวลา
 * แถวที่มีอยู่แล้วจะถูกข้าม จึงนำเข้าไฟล์เดิมซ้ำได้เมื่อล้มเหลวกลางทาง
 */
export const saveImportBatch = authSafeActionClient
  .schema(ImportBatchSchema)
  .action(async ({ ctx, parsedInput: { products, scannedBarcodes } }) => {
    await requireAdmin(ctx.user.id);

    const { error: productsError } = await supabaseAdminClient
      .from("products")
      .upsert(products, { onConflict: "id", ignoreDuplicates: true });

    if (productsError) throw new Error(productsError.message);

    const { error: scannedError } = await supabaseAdminClient
      .from("scanned_barcodes")
      .upsert(scannedBarcodes, {
        onConflict: "product_id",
        ignoreDuplicates: true,
      });

    if (scannedError) throw new Error(scannedError.message);
  });
