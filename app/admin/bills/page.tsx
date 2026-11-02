"use client";
import Loading from "@/app/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BillRow from "@/features/bills/components/BillRow";
import CreateNewBillModal from "@/features/bills/components/CreateNewBillModal";
import { BILL_STATUS } from "@/features/bills/enums/bill.enum";
import { useFetchBillsWithProductsAndProductTypesAndProductTypeConstraints } from "@/features/bills/hooks/queries/useFetchBillsWithProducts";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Filter,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ITEMS_PER_PAGE = 10;

type SortDirection = "asc" | "desc" | null;
type StatusFilterType = BILL_STATUS | "ALL";
type SortField = "document_date" | "created_at" | null;

export default function BillsPage() {
  const {
    data: bills,
    isFetching: isFetchingBills,
    refetch: onRefreshBillData,
  } = useFetchBillsWithProductsAndProductTypesAndProductTypeConstraints();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [sortField, setSortField] = useState<SortField>("document_date");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("ALL");

  const [isOpenCreateNewBillModal, setIsOpenCreateNewBillModal] =
    useState(false);

  // Filter bills by search query and status
  const filteredBills = bills?.filter(
    (bill) =>
      (statusFilter === "ALL" || bill.status === statusFilter) &&
      (bill.bill_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.customer_fullname
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (bill.customer_email &&
          bill.customer_email
            .toLowerCase()
            .includes(searchQuery.toLowerCase())))
  );

  // Sort bills by selected field and direction
  const sortedBills = [...(filteredBills || [])].sort((a, b) => {
    if (!sortDirection || !sortField) return 0;

    if (sortField === "document_date") {
      const dateA = new Date(a.document_date).getTime();
      const dateB = new Date(b.document_date).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    } else if (sortField === "created_at") {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }

    return 0;
  });

  const totalPages = Math.ceil((sortedBills?.length || 0) / ITEMS_PER_PAGE);
  const paginatedBills = sortedBills?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Toggle sort direction or change sort field
  const handleSort = (field: SortField) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection("desc"); // Default to descending for newly selected field
    } else {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortDirection, sortField]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      // Show both arrows in muted color when not sorting by this field
      return (
        <div
          className="ml-1.5 flex flex-col"
          aria-hidden="true"
          title="คลิกเพื่อเรียงลำดับ"
        >
          <ArrowUp className="h-2.5 w-2.5 text-gray-300" />
          <ArrowDown className="h-2.5 w-2.5 text-gray-300" />
        </div>
      );
    }

    if (sortDirection === "asc") {
      return (
        <div className="ml-1.5" title="เรียงจากเก่าไปใหม่">
          <ArrowUp className="h-4 w-4 text-primary" />
        </div>
      );
    }

    return (
      <div className="ml-1.5" title="เรียงจากใหม่ไปเก่า">
        <ArrowDown className="h-4 w-4 text-primary" />
      </div>
    );
  };

  if (isFetchingBills) {
    return <Loading />;
  }

  return (
    <div className="space-y-4">
      <CreateNewBillModal
        isOpen={isOpenCreateNewBillModal}
        onClose={() => setIsOpenCreateNewBillModal(false)}
        onRefreshBillData={onRefreshBillData}
      />
      <h1 className="text-xl font-bold">ระบบจัดการบิล</h1>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาบิล..."
            className="pl-8 bg-white"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Filter className="h-4 w-4" />
                สถานะ
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={statusFilter}
                onValueChange={(value: string) =>
                  setStatusFilter(value as StatusFilterType)
                }
              >
                <DropdownMenuRadioItem value="ALL">
                  ทั้งหมด
                </DropdownMenuRadioItem>
                {Object.values(BILL_STATUS).map((status) => (
                  <DropdownMenuRadioItem key={status} value={status}>
                    {status}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            className="bg-[#FFE14D] hover:bg-[#FFE14D]/90 text-black"
            onClick={() => setIsOpenCreateNewBillModal(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            สร้างบิลใหม่
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-medium">เลขที่บิล</TableHead>
              <TableHead className="font-medium">ชื่อลูกค้า</TableHead>
              <TableHead className="font-medium">จำนวนการสแกน</TableHead>
              <TableHead
                className={`cursor-pointer hover:bg-muted/30 transition-colors rounded-sm font-medium ${
                  sortField === "created_at" ? "bg-muted/20" : ""
                }`}
                onClick={() => handleSort("created_at")}
              >
                <div className="flex items-center">
                  <span>วันที่สร้าง</span>
                  {renderSortIcon("created_at")}
                </div>
              </TableHead>
              <TableHead
                className={`cursor-pointer hover:bg-muted/30 transition-colors rounded-sm font-medium ${
                  sortField === "document_date" ? "bg-muted/20" : ""
                }`}
                onClick={() => handleSort("document_date")}
              >
                <div className="flex items-center">
                  <span>วันที่บิล</span>
                  {renderSortIcon("document_date")}
                </div>
              </TableHead>
              <TableHead className="font-medium">สถานะ</TableHead>
              <TableHead className="text-right font-medium">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBills?.map((bill) => (
              <BillRow key={bill.id} bill={bill} />
            ))}
            {(paginatedBills?.length === 0 || !paginatedBills) && (
              <TableRow>
                <TableHead
                  colSpan={7}
                  className="text-center py-10 text-gray-500"
                >
                  ไม่พบข้อมูลบิล
                </TableHead>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
