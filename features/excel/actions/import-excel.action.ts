"use server";

import { authSafeActionClient } from "@/lib/safe-action";
import { supabaseAdminClient } from "@/lib/supabase";
import { z } from "zod";

const EXCEL_IMPORT_BUCKET = "excel-imports";

const ScannedBarcodeSchema = z.object({
  product_id: z.string().min(1),
  user_id: z.string().nullable(),
  created_date: z.string().datetime(),
  expired_date: z.string(),
  product_score_option_id: z.number().int(),
  point_multiplier: z.number().nullable(),
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

export const saveImportedScannedBarcodes = authSafeActionClient
  .schema(z.object({ rows: z.array(ScannedBarcodeSchema).min(1) }))
  .action(async ({ ctx, parsedInput: { rows } }) => {
    await requireAdmin(ctx.user.id);

    for (let index = 0; index < rows.length; index += 1000) {
      const { error } = await supabaseAdminClient
        .from("scanned_barcodes")
        .upsert(rows.slice(index, index + 1000), {
          onConflict: "product_id",
          ignoreDuplicates: true,
        });

      if (error) throw new Error(error.message);
    }
  });
