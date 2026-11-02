import { MAX_ALL_ROWS } from "@/lib/utils/pagination.util";

const FETCH_ALL_BATCH_SIZE = 1000;

interface Page<T> {
  rows: T[];
  total: number;
}

/**
 * โหลดข้อมูลทีละชุดจนครบ ใช้กับตัวเลือก "ทั้งหมด"
 * แบ่ง request เพราะ response เดียวบน Vercel มีเพดานขนาด
 * และหยุดที่ MAX_ALL_ROWS เพราะแสดงแถวมากกว่านี้แล้ว browser จะค้าง
 *
 * @param fetchPage - ฟังก์ชันอ่านหนึ่งชุด รับหน้าและขนาดชุด
 * @returns แถวที่โหลดได้และจำนวนทั้งหมดจริง
 */
export async function fetchAllPages<T>(
  fetchPage: (page: number, pageSize: number) => Promise<Page<T>>
): Promise<Page<T>> {
  const rows: T[] = [];
  let total = 0;
  let page = 1;

  do {
    const result = await fetchPage(page, FETCH_ALL_BATCH_SIZE);

    total = result.total;
    rows.push(...result.rows);
    page += 1;

    if (result.rows.length === 0) break;
  } while (rows.length < Math.min(total, MAX_ALL_ROWS));

  return { rows, total };
}
