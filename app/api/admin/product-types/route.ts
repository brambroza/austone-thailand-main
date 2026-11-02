import { fetchProductTypes } from "@/features/admin/admin.queries";
import { createAdminReadHandler } from "@/lib/route-auth";

export const dynamic = "force-dynamic";

/** คืนประเภทสินค้าทั้งหมด เฉพาะทีมงาน */
export const GET = createAdminReadHandler(fetchProductTypes, [
  "ADMIN",
  "BILL_MANAGEMENT",
]);
