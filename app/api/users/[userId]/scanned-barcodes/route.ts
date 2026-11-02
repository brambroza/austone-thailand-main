import { getScannedBarcodeHistoriesByUserId } from "@/actions/queries/scanned-barcodes.action";
import { createUserReadHandler } from "@/lib/route-auth";
import { parseDateFilter } from "@/lib/utils/route-access.util";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** คืนประวัติการสแกนของผู้ใช้ กรองตามช่วงวันที่ได้ด้วย from และ to */
export const GET = createUserReadHandler(async (userId, request) => {
  const filter = parseDateFilter(request.nextUrl.searchParams);

  if (!filter) {
    return NextResponse.json({ error: "Invalid date filter" }, { status: 400 });
  }

  return getScannedBarcodeHistoriesByUserId({ user_id: userId, filter });
});
