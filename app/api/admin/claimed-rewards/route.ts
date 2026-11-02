import { fetchClaimedRewardHistories } from "@/features/admin/admin.queries";
import { createAdminReadHandler } from "@/lib/route-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const PeriodSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});

/** คืนประวัติการแลกของรางวัล จะกรองด้วย month และ year ก็ได้ เฉพาะ admin */
export const GET = createAdminReadHandler(async (request) => {
  const { searchParams } = request.nextUrl;

  if (!searchParams.has("month") && !searchParams.has("year")) {
    return fetchClaimedRewardHistories();
  }

  const period = PeriodSchema.safeParse(Object.fromEntries(searchParams));

  if (!period.success) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  return fetchClaimedRewardHistories(period.data);
});
