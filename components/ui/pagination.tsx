import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TablePaginationState } from "@/hooks/useTablePagination";
import {
  PAGE_SIZE_ALL,
  PAGE_SIZE_OPTIONS,
  PageSize,
} from "@/lib/utils/pagination.util";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm">
        หน้า {currentPage} จาก {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface TablePaginationProps {
  pagination: TablePaginationState;
  /** ปิดตัวเลือก "ทั้งหมด" เมื่อแถวเยอะเกินกว่าที่ browser จะแสดงไหว */
  allowAll?: boolean;
}

/** แถบควบคุมท้ายตาราง: เลือกจำนวนแถวต่อหน้าและเปลี่ยนหน้า */
export function TablePagination({ pagination, allowAll = true }: TablePaginationProps) {
  const {
    page,
    pageSize,
    setPage,
    setPageSize,
    startItem,
    endItem,
    totalItems,
    totalPages,
  } = pagination;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span>แสดงต่อหน้า</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) =>
            setPageSize(
              value === PAGE_SIZE_ALL ? PAGE_SIZE_ALL : (Number(value) as PageSize)
            )
          }
        >
          <SelectTrigger className="h-8 w-[100px] bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.filter(
              (option) => allowAll || option !== PAGE_SIZE_ALL
            ).map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option === PAGE_SIZE_ALL ? "ทั้งหมด" : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>
          {startItem.toLocaleString("th-TH")}-{endItem.toLocaleString("th-TH")} จาก{" "}
          {totalItems.toLocaleString("th-TH")} รายการ
        </span>
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
