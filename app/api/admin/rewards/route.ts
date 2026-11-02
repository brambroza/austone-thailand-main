import { fetchRewards } from "@/features/admin/admin.queries";
import { createAdminReadHandler } from "@/lib/route-auth";

export const dynamic = "force-dynamic";

/** คืนของรางวัลทั้งหมด เฉพาะ admin */
export const GET = createAdminReadHandler(fetchRewards);
