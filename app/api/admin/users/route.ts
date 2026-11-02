import { fetchAllUserInfos } from "@/features/dashboard/dashboard.queries";
import { createAdminReadHandler } from "@/lib/route-auth";

export const dynamic = "force-dynamic";

/** คืนรายชื่อผู้ใช้ทั้งหมด เฉพาะ admin */
export const GET = createAdminReadHandler(fetchAllUserInfos);
