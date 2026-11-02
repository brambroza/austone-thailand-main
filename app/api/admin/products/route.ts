import { fetchProductsPage } from "@/features/admin/admin.queries";
import { createAdminReadHandler } from "@/lib/route-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const STAFF_ROLES = ["ADMIN", "BILL_MANAGEMENT"];

const ProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).default(10),
  search: z.string().trim().max(100).default(""),
});

/** คืนสินค้าทีละหน้า เฉพาะทีมงาน */
export const GET = createAdminReadHandler(async (request) => {
  const query = ProductsQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );

  if (!query.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const { page, pageSize, search } = query.data;

  return fetchProductsPage(page, pageSize, search);
}, STAFF_ROLES);
