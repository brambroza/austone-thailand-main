import { fetchPointReport } from "@/features/admin/admin.queries";
import { createAdminReadHandler } from "@/lib/route-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const REPORT_FUNCTIONS = {
  redeemed: "get_user_point_histories",
  accumulated: "get_user_point_accumelate_histories",
} as const;

const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const PointReportQuerySchema = z.object({
  report: z.enum(["redeemed", "accumulated"]),
  startDate: DateSchema,
  endDate: DateSchema,
});

/** คืนรายงานคะแนนตามช่วงวันที่ เฉพาะ admin */
export const GET = createAdminReadHandler(async (request) => {
  const query = PointReportQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );

  if (!query.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { report, startDate, endDate } = query.data;

  return fetchPointReport(REPORT_FUNCTIONS[report], startDate, endDate);
});
