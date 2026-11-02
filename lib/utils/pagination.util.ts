export const PAGE_SIZE_ALL = "all";

export const PAGE_SIZE_OPTIONS = [10, 20, 30, PAGE_SIZE_ALL] as const;

export const DEFAULT_PAGE_SIZE = 10;

/** จำนวนแถวสูงสุดที่ตัวเลือก "ทั้งหมด" ของตารางที่แบ่งหน้าฝั่ง server จะแสดง */
export const MAX_ALL_ROWS = 2000;

export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export interface PaginationInfo {
  /** หน้าปัจจุบันหลังปรับให้อยู่ในช่วงที่มีข้อมูล */
  page: number;
  totalPages: number;
  totalItems: number;
  /** ลำดับแถวแรกของหน้านี้ เริ่มจาก 1 และเป็น 0 เมื่อไม่มีข้อมูล */
  startItem: number;
  /** ลำดับแถวสุดท้ายของหน้านี้ */
  endItem: number;
}

/**
 * คำนวณข้อมูลของหน้าปัจจุบัน
 * หน้าที่เกินจำนวนจริงจะถูกปรับเป็นหน้าสุดท้าย เช่น หลังลบแถวสุดท้ายของหน้า
 *
 * @param totalItems - จำนวนแถวทั้งหมด
 * @param page - หน้าที่ต้องการ เริ่มจาก 1
 * @param pageSize - จำนวนแถวต่อหน้า หรือ "all"
 * @returns ข้อมูลของหน้าปัจจุบัน
 */
export function getPaginationInfo(
  totalItems: number,
  page: number,
  pageSize: PageSize
): PaginationInfo {
  if (totalItems === 0) {
    return { page: 1, totalPages: 1, totalItems, startItem: 0, endItem: 0 };
  }

  if (pageSize === PAGE_SIZE_ALL) {
    return { page: 1, totalPages: 1, totalItems, startItem: 1, endItem: totalItems };
  }

  const totalPages = Math.ceil(totalItems / pageSize);
  const safePage = Math.min(Math.max(page, 1), totalPages);

  return {
    page: safePage,
    totalPages,
    totalItems,
    startItem: (safePage - 1) * pageSize + 1,
    endItem: Math.min(safePage * pageSize, totalItems),
  };
}

/**
 * ตัดแถวเฉพาะของหน้าปัจจุบัน
 *
 * @param rows - แถวทั้งหมด
 * @param page - หน้าที่ต้องการ เริ่มจาก 1
 * @param pageSize - จำนวนแถวต่อหน้า หรือ "all"
 * @returns แถวของหน้านั้น
 */
export function paginateRows<T>(rows: T[], page: number, pageSize: PageSize): T[] {
  if (pageSize === PAGE_SIZE_ALL) return rows;

  const { startItem, endItem } = getPaginationInfo(rows.length, page, pageSize);

  return startItem === 0 ? [] : rows.slice(startItem - 1, endItem);
}

/**
 * สร้างค่าสำหรับเงื่อนไข ilike ภายใน or() ของ PostgREST
 * ครอบด้วย double quote เพื่อให้ , ( ) ในคำค้นไม่ถูกตีความเป็น syntax ของ filter
 *
 * @param search - ข้อความจากผู้ใช้
 * @returns ค่าที่พร้อมต่อท้าย "column.ilike."
 */
export function toOrIlikeValue(search: string): string {
  const pattern = `%${escapeLikePattern(search)}%`;

  return `"${pattern.replace(/[\\"]/g, "\\$&")}"`;
}

/**
 * แบ่ง array เป็นชุดย่อยตามขนาดที่กำหนด
 *
 * @param items - ข้อมูลทั้งหมด
 * @param size - จำนวนสูงสุดต่อชุด
 * @returns ชุดข้อมูลตามลำดับเดิม
 */
export function chunkItems<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

/**
 * ทำให้ข้อความค้นหาปลอดภัยสำหรับ ILIKE โดย %, _ และ \ จะถูกค้นตามตัวอักษร
 *
 * @param search - ข้อความจากผู้ใช้
 * @returns ข้อความที่ escape แล้ว
 */
export function escapeLikePattern(search: string): string {
  return search.replace(/[\\%_]/g, "\\$&");
}
