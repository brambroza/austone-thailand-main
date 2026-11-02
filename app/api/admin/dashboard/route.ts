import { getDashboardData } from "@/features/dashboard/dashboard.queries";
import { createAdminReadHandler } from "@/lib/route-auth";

export const dynamic = "force-dynamic";

/** คืนข้อมูลหน้า dashboard เฉพาะ admin */
export const GET = createAdminReadHandler(getDashboardData);
