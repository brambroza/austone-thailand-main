import { getBarcodeScannerSetting } from "@/features/settings/actions/barcode-scanner-settings.action";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** คืนค่าตั้งค่าการเปิดปิดเครื่องสแกนบาร์โค้ด */
export async function GET() {
  return NextResponse.json(await getBarcodeScannerSetting());
}
