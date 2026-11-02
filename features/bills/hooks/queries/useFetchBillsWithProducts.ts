import type { BillsQuery, PageResult } from "@/features/admin/admin.queries";
import { BillWithProductAndProductTypeAndProductTypeConstraint } from "@/features/bills/types/bill.type";
import { apiGet } from "@/lib/utils/api-client.util";
import { fetchAllPages } from "@/lib/utils/fetch-all-pages.util";
import { PAGE_SIZE_ALL, PageSize } from "@/lib/utils/pagination.util";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

type BillRow = BillWithProductAndProductTypeAndProductTypeConstraint;
type BillFilters = Omit<BillsQuery, "page" | "pageSize">;

/** อ่านบิลหนึ่งหน้าจาก API */
function fetchBillPage(filters: BillFilters, page: number, pageSize: number) {
  return apiGet<PageResult<BillRow>>("/api/admin/bills", {
    ...filters,
    page: String(page),
    pageSize: String(pageSize),
  });
}

export function useFetchBillsWithProductsAndProductTypesAndProductTypeConstraints(
  filters: BillFilters,
  page: number,
  pageSize: PageSize
) {
  return useQuery({
    queryKey: ["bills", filters, page, pageSize],
    queryFn: () =>
      pageSize === PAGE_SIZE_ALL
        ? fetchAllPages((batchPage, batchSize) =>
            fetchBillPage(filters, batchPage, batchSize)
          )
        : fetchBillPage(filters, page, pageSize),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}
