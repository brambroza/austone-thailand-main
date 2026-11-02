import {
  DEFAULT_PAGE_SIZE,
  PageSize,
  PaginationInfo,
  getPaginationInfo,
  paginateRows,
} from "@/lib/utils/pagination.util";
import { useEffect, useMemo, useState } from "react";

export interface TablePaginationState extends PaginationInfo {
  pageSize: PageSize;
  setPage: (page: number) => void;
  setPageSize: (pageSize: PageSize) => void;
}

/**
 * เก็บหน้าปัจจุบันและจำนวนแถวต่อหน้า ใช้ตรง ๆ กับตารางที่แบ่งหน้าฝั่ง server
 *
 * @param resetKey - เมื่อค่าเปลี่ยน เช่น คำค้นหรือการเรียงลำดับ จะกลับไปหน้าแรก
 * @returns หน้าที่เลือก จำนวนแถวต่อหน้า และฟังก์ชันเปลี่ยนค่า
 */
export function usePageControls(resetKey?: string) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState<PageSize>(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const setPageSize = (nextPageSize: PageSize) => {
    setPageSizeState(nextPageSize);
    setPage(1);
  };

  return { page, pageSize, setPage, setPageSize };
}

/**
 * แบ่งหน้าข้อมูลที่อยู่ฝั่ง browser แล้ว
 *
 * @param rows - แถวทั้งหมดหลังกรองและเรียงลำดับ
 * @param resetKey - เมื่อค่าเปลี่ยนจะกลับไปหน้าแรก
 * @returns แถวของหน้าปัจจุบันและ state สำหรับ TablePagination
 */
export function useTablePagination<T>(rows: T[], resetKey?: string) {
  const { page, pageSize, setPage, setPageSize } = usePageControls(resetKey);

  const pageRows = useMemo(
    () => paginateRows(rows, page, pageSize),
    [rows, page, pageSize]
  );

  const pagination: TablePaginationState = {
    ...getPaginationInfo(rows.length, page, pageSize),
    pageSize,
    setPage,
    setPageSize,
  };

  return { pageRows, pagination };
}
