"use client";

import { TablePagination } from "@/components/ui/pagination";
import { useTablePagination } from "@/hooks/useTablePagination";
import { LoadingModal } from "@/components/ui/loading-modal";
import { useFetchUserInfo } from "@/hooks/fetch-data/useFetchUserInfo";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowLeft, ArrowUp } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { useMemo, useState } from "react";
import { useFetchScannedBarcodeHistoriesByUserId } from "@/hooks/fetch-data/useFetchScannedBarcodeHistories";
import DeleteScannedBarcodeButton from "@/features/scanned-barcodes/components/DeleteScannedBarcodeButton";
type SortOrder = "asc" | "desc";

export default function UserScannedBarcodesPage() {
  const { userId } = useParams();

  const { data: userInfo, isLoading: isLoadingUser } = useFetchUserInfo(
    userId as string
  );

  const {
    data: scannedBarcodeHistories,
    isLoading: isLoadingScannedBarcodeHistories,
    refetch: onRefreshScannedBarcodes,
  } = useFetchScannedBarcodeHistoriesByUserId({
    user_id: userId as string,
  });

  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sortedRewards = useMemo(
    () =>
      [...(scannedBarcodeHistories ?? [])].sort((a, b) => {
        const dateA = new Date(a.created_date).getTime();
        const dateB = new Date(b.created_date).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }),
    [scannedBarcodeHistories, sortOrder]
  );

  const { pageRows, pagination } = useTablePagination(sortedRewards, sortOrder);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            ย้อนกลับ
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">
          ประวัติการสะสมคะแนน: {userInfo?.full_name}
        </h1>
      </div>

      <div>
        {sortedRewards.length > 0 ? (
          <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัสสินค้า</TableHead>
                <TableHead>คะแนน</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    className="h-8 p-0 text-xs font-medium text-gray-500 hover:bg-transparent"
                    onClick={toggleSortOrder}
                  >
                    วันที่สะสม
                    {sortOrder === "asc" ? (
                      <ArrowUp className="ml-2 h-4 w-4" />
                    ) : (
                      <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((history) => (
                <TableRow key={history.id}>
                  <TableCell>{history.product_id}</TableCell>
                  <TableCell>{history.product_score_option.score}</TableCell>
                  <TableCell>
                    {format(
                      new Date(history.created_date),
                      "d MMM yyyy HH:mm",
                      {
                        locale: th,
                      }
                    )}
                  </TableCell>
                  <TableCell>
                    <DeleteScannedBarcodeButton
                      id={history.id}
                      onRefreshScannedBarcodes={onRefreshScannedBarcodes}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination pagination={pagination} />
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            ไม่พบประวัติการสะสมคะแนน
          </div>
        )}
      </div>

      <LoadingModal
        isOpen={isLoadingUser || isLoadingScannedBarcodeHistories}
        message="กำลังโหลดข้อมูล..."
      />
    </div>
  );
}
