import { fetchBillsPage } from "@/features/admin/admin.queries";
import { BILL_STATUS } from "@/features/bills/enums/bill.enum";
import { createAdminReadHandler } from "@/lib/route-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const BillsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).default(10),
  search: z.string().trim().max(100).default(""),
  status: z.nativeEnum(BILL_STATUS).optional(),
  sortField: z.enum(["document_date", "created_at"]).default("document_date"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
});

/** คืนบิลทีละหน้า เฉพาะทีมงาน */
export const GET = createAdminReadHandler(
  async (request) => {
    const query = BillsQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams)
    );

    if (!query.success) {
      return NextResponse.json({ error: "Invalid query" }, { status: 400 });
    }

    return fetchBillsPage(query.data);
  },
  ["ADMIN", "BILL_MANAGEMENT"]
);
