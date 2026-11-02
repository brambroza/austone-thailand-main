/**
 * Validates product ID format based on factory rules
 * - PCR (半钢) format: 8 digits, starting with '9'
 * - TBR (全钢) format: 10 digits, starting with '88'
 * @param productId The product ID to validate
 * @returns boolean indicating if the product ID is valid
 */

import { BarcodeScannerSetting } from "@/features/settings/types/barcode-scanner-setting.type";
import { containsOnlyNumber, getDayOfWeek } from "@/lib/utils";
import { ProductScoreOption } from "@/models/product-score-option.model";
import { ScannedBarcode } from "@/models/scanned-barcodes.model";
import { UserInfoView } from "@/models/user.model";

export function isBarcodeValid(productId: string): boolean {
  const cleanId = productId.trim();

  if (!containsOnlyNumber(cleanId)) {
    return false;
  }

  if (cleanId.startsWith("9")) {
    return cleanId.length === 8;
  }

  if (cleanId.startsWith("88")) {
    return cleanId.length === 10;
  }

  if (
    cleanId.startsWith("01") ||
    cleanId.startsWith("03") ||
    cleanId.startsWith("04")
  ) {
    return cleanId.length === 11;
  }

  return false;
}

export function getBarcodeDisabledMessage({
  userInfo,
  barcodeScannerSettings,
}: {
  userInfo: UserInfoView | null | undefined;
  barcodeScannerSettings: BarcodeScannerSetting | null | undefined;
}) {
  if (!userInfo?.enabled_barcode_scan_at) {
    return "อยู่ระหว่างการตรวจสอบคะแนน ไม่สามารถสะสมได้";
  }

  if (!barcodeScannerSettings?.is_enabled) {
    return barcodeScannerSettings?.message ?? "";
  }

  return "";
}

export function isBarcodeEnabled({
  productScoreOption,
  userInfo,
  barcodeScannerSettings,
}: {
  productScoreOption: ProductScoreOption | null | undefined;
  userInfo: UserInfoView | null | undefined;
  barcodeScannerSettings: BarcodeScannerSetting | null | undefined;
}) {
  return (
    productScoreOption === undefined ||
    !Boolean(userInfo?.enabled_barcode_scan_at) ||
    !barcodeScannerSettings?.is_enabled
  );
}

export function formatDailyScannedBarcodeData(data: ScannedBarcode[]) {
  let dailyScannedBarcode = {
    อาทิตย์: 0,
    จันทร์: 0,
    อังคาร: 0,
    พุธ: 0,
    พฤหัสบดี: 0,
    ศุกร์: 0,
    เสาร์: 0,
  };

  data.forEach((scannedBarcode) => {
    const dayOfWeek = getDayOfWeek(scannedBarcode.created_date);
    dailyScannedBarcode[dayOfWeek as keyof typeof dailyScannedBarcode]++;
  });

  return Object.entries(dailyScannedBarcode).map(([day, count]) => ({
    date: day,
    จำนวนการสะสมแต้ม: count,
  }));
}
