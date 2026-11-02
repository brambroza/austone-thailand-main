import { getAvailableRewardsNew } from "@/actions/queries/reward.action";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** คืนรายการของรางวัลที่แลกได้ในขณะนี้ */
export async function GET() {
  return NextResponse.json(await getAvailableRewardsNew());
}
