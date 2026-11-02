import { describe, expect, it, jest } from "@jest/globals";
import { fetchAllPages } from "@/lib/utils/fetch-all-pages.util";
import { MAX_ALL_ROWS } from "@/lib/utils/pagination.util";

/** จำลอง API ที่มีข้อมูลตามจำนวนที่กำหนด */
function createFetchPage(total: number) {
  return jest.fn(async (page: number, pageSize: number) => {
    const from = (page - 1) * pageSize;
    const count = Math.max(Math.min(pageSize, total - from), 0);

    return { rows: Array.from({ length: count }, (_, i) => from + i), total };
  });
}

describe("fetchAllPages", () => {
  it("reads every batch until all rows are loaded", async () => {
    const fetchPage = createFetchPage(1500);

    const { rows, total } = await fetchAllPages(fetchPage);

    expect(rows).toHaveLength(1500);
    expect(total).toBe(1500);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it("stops at the row limit but reports the real total", async () => {
    const fetchPage = createFetchPage(432770);

    const { rows, total } = await fetchAllPages(fetchPage);

    expect(rows).toHaveLength(MAX_ALL_ROWS);
    expect(total).toBe(432770);
  });

  it("stops when a batch comes back empty", async () => {
    const fetchPage = jest.fn(async () => ({ rows: [], total: 5 }));

    await fetchAllPages(fetchPage);

    expect(fetchPage).toHaveBeenCalledTimes(1);
  });
});
