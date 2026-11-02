import { fetchProductTypePromotions } from "@/features/admin/admin.queries";
import { createAdminReadHandler } from "@/lib/route-auth";

export const dynamic = "force-dynamic";

/** คืนโปรโมชันของประเภทสินค้าทั้งหมด เฉพาะทีมงาน */
export const GET = createAdminReadHandler(fetchProductTypePromotions, [
  "ADMIN",
  "BILL_MANAGEMENT",
]);
