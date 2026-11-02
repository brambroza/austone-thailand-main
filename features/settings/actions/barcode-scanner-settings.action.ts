"use server";
import { supabaseAdminClient } from "@/lib/supabase";
import { ServerActionResponse } from "@/models/api.model";
import { BarcodeScannerSetting } from "../types/barcode-scanner-setting.type";
import { User } from "@/models/user.model";

const DB_SCHEMA = "settings";
const TABLE_NAME = "barcode_scanner";
const STATIC_BARCODE_SCANNER_SETTINGS_ID = 1;

export async function getBarcodeScannerSetting(): Promise<
  ServerActionResponse<BarcodeScannerSetting>
> {
  try {
    const { data, error } = await supabaseAdminClient
      .schema(DB_SCHEMA)
      .from(TABLE_NAME)
      .select("*")
      .eq("id", STATIC_BARCODE_SCANNER_SETTINGS_ID)
      .single();

    if (error) throw new Error(error.message);

    console.log(`[INFO] : ดึงข้อมูลตั้งค่าการสแกนบาร์โค้ดสำเร็จ!`);

    return {
      data,
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.error(
      `[ERROR] : ล้มเหลวในการดึงข้อมูลตั้งค่าการสแกนบาร์โค้ด -> ${error.message}`
    );
    return {
      data: null,
      isError: true,
      error: error.message,
    };
  }
}

export async function toggleBarcodeScannerSetting(
  userId: User["user_id"],
  message: string
): Promise<ServerActionResponse<BarcodeScannerSetting>> {
  try {
    const { data: barcodeScannerSetting } = await getBarcodeScannerSetting();

    if (!barcodeScannerSetting)
      throw new Error("ไม่พบข้อมูลตั้งค่าการสแกนบาร์โค้ด");

    const { data, error } = await supabaseAdminClient
      .schema(DB_SCHEMA)
      .from(TABLE_NAME)
      .update({
        is_enabled: !barcodeScannerSetting.is_enabled,
        message: message,
        updated_by_user_id: userId,
      })
      .eq("id", STATIC_BARCODE_SCANNER_SETTINGS_ID)
      .single();

    if (error) throw new Error(error.message);

    console.log(`[INFO] : บันทึกตั้งค่าการสแกนบาร์โค้ดสำเร็จ!`);

    return {
      data,
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.error(
      `[ERROR] : ล้มเหลวในการบันทึกตั้งค่าการสแกนบาร์โค้ด : ${error.message}`
    );
    return {
      data: null,
      isError: true,
      error: error.message,
    };
  }
}

export async function updateBarcodeScannerMessage(
  userId: User["user_id"],
  message: string
): Promise<ServerActionResponse<BarcodeScannerSetting>> {
  try {
    const { data: barcodeScannerSetting } = await getBarcodeScannerSetting();

    if (!barcodeScannerSetting)
      throw new Error("ไม่พบข้อมูลตั้งค่าการสแกนบาร์โค้ด");

    const { data, error } = await supabaseAdminClient
      .schema(DB_SCHEMA)
      .from(TABLE_NAME)
      .update({
        message: message,
        updated_by_user_id: userId,
      })
      .eq("id", STATIC_BARCODE_SCANNER_SETTINGS_ID)
      .single();

    if (error) throw new Error(error.message);

    console.log(`[INFO] : บันทึกข้อความตั้งค่าการสแกนบาร์โค้ดสำเร็จ!`);

    return {
      data,
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.error(
      `[ERROR] : ล้มเหลวในการบันทึกข้อความตั้งค่าการสแกนบาร์โค้ด : ${error.message}`
    );
    return {
      data: null,
      isError: true,
      error: error.message,
    };
  }
}
