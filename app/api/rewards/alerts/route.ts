import { getRewardAvailableNew } from "@/actions/queries/reward.action";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** คืนรายการของรางวัลที่เปิดแจ้งเตือนสำหรับ popup */
export async function GET() {
  return NextResponse.json(await getRewardAvailableNew());
}
