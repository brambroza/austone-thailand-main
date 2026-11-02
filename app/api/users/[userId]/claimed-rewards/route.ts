import { getClaimedRewardHistoriesByUserId } from "@/actions/queries/claimed_reward_histories.action";
import { createUserReadHandler } from "@/lib/route-auth";
import { parseDateFilter } from "@/lib/utils/route-access.util";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** คืนประวัติการแลกของรางวัลของผู้ใช้ กรองตามช่วงวันที่ได้ด้วย from และ to */
export const GET = createUserReadHandler(async (userId, request) => {
  const filter = parseDateFilter(request.nextUrl.searchParams);

  if (!filter) {
    return NextResponse.json({ error: "Invalid date filter" }, { status: 400 });
  }

  const actionResult = await getClaimedRewardHistoriesByUserId({
    user_id: userId,
    filter: { from: filter.from ?? "", to: filter.to ?? "" },
  });

  return actionResult?.data ?? null;
});
