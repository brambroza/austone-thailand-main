"use client";

import {
  cancelClaimedReward,
  updateClaimedRewardStatus,
} from "@/actions/queries/claimed_reward_histories.action";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert } from "@/components/ui/alert-message-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/components/ui/pagination";
import { useTablePagination } from "@/hooks/useTablePagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { searchClaimedRewardHistoriesWithFilterMode } from "@/features/claimed-reward-history/helpers/claimed-reward-histories.helper";
import { CLAIMED_REWARD_HISTORY_STATUS } from "@/features/claimed-reward-history/types/claimed-reward-history.type";
import { cn } from "@/lib/utils";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { ServerActionResponse } from "@/models/api.model";
import { ClaimedRewardHistory } from "@/models/reward.model";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { ArrowDownIcon, ArrowUpIcon, Search } from "lucide-react";
import { useMemo, useState } from "react";

interface ClaimedRewardsTableProps {
  histories: ClaimedRewardHistory[];
  onRefresh?: () => void;
}

type SortOrder = "asc" | "desc";

export default function ClaimedRewardsTable({
  histories,
  onRefresh,
}: ClaimedRewardsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const [filterBy, setFilterBy] = useState<"all" | "email" | "address">("all");

  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [bulkStatus, setBulkStatus] = useState<CLAIMED_REWARD_HISTORY_STATUS>(
    CLAIMED_REWARD_HISTORY_STATUS.INSPECTING
  );

  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const [historyToCancel, setHistoryToCancel] =
    useState<ClaimedRewardHistory | null>(null);

  const [isCancelling, setIsCancelling] = useState(false);

  const filteredAndSortedHistories = useMemo(() => {
    return searchClaimedRewardHistoriesWithFilterMode(
      searchQuery,
      histories,
      filterBy,
      sortOrder
    );
  }, [histories, searchQuery, filterBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const { pageRows, pagination } = useTablePagination(
    filteredAndSortedHistories,
    [searchQuery, filterBy, sortOrder].join("|")
  );

  // รายการที่ยกเลิกไปแล้วห้ามแก้สถานะซ้ำ จึงไม่ให้เลือกเพื่ออัปเดตแบบกลุ่ม
  // เลือกทั้งหมดมีผลเฉพาะหน้าที่เห็น เพื่อไม่ให้อัปเดตแถวที่ผู้ใช้ไม่เห็นโดยไม่ตั้งใจ
  const selectableHistories = useMemo(
    () =>
      pageRows.filter(
        (history) =>
          history.status !== CLAIMED_REWARD_HISTORY_STATUS.CANCELLED
      ),
    [pageRows]
  );

  const isAllSelected =
    selectableHistories.length > 0 &&
    selectableHistories.every((history) => selectedIds.includes(history.id));

  const toggleSelectAll = () => {
    const pageIds = selectableHistories.map((history) => history.id);

    setSelectedIds((prev) =>
      isAllSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : Array.from(new Set([...prev, ...pageIds]))
    );
  };

  const toggleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const handleStatusChange = async (
    id: number,
    status: CLAIMED_REWARD_HISTORY_STATUS
  ) => {
    try {
      setUpdatingStatus(id);

      const result = await updateClaimedRewardStatus({
        id,
        status,
      });

      const { isError, error } =
        SafeActionUtil.getData<ServerActionResponse<null>>(result);

      if (isError) throw new Error(error);

      Alert.success("อัพเดทสถานะสำเร็จ");

      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      Alert.error(error.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleBulkStatusChange = async () => {
    if (selectedIds.length === 0) return;

    try {
      setIsBulkUpdating(true);

      const results = await Promise.all(
        selectedIds.map((id) =>
          updateClaimedRewardStatus({ id, status: bulkStatus })
        )
      );

      const hasError = results.some(
        (result) =>
          SafeActionUtil.getData<ServerActionResponse<null>>(result).isError
      );

      if (hasError) throw new Error("อัพเดทสถานะบางรายการไม่สำเร็จ");

      Alert.success(`อัพเดทสถานะสำเร็จ ${selectedIds.length} รายการ`);

      setSelectedIds([]);

      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      Alert.error(error.message);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  /**
   * ยกเลิกการแลกของรางวัล — คืนแต้มให้ลูกค้าและคืน stock ของรางวัล
   */
  const handleCancelClaimedReward = async () => {
    if (!historyToCancel) return;

    try {
      setIsCancelling(true);

      const result = await cancelClaimedReward({ id: historyToCancel.id });

      const { data: refundedScore, isError, error } =
        SafeActionUtil.getData<ServerActionResponse<number>>(result);

      if (isError) throw new Error(error);

      Alert.success(
        `ยกเลิกการแลกของรางวัลสำเร็จ คืนคะแนนให้ลูกค้า ${
          refundedScore ?? 0
        } คะแนน`
      );

      setSelectedIds((prev) =>
        prev.filter((selectedId) => selectedId !== historyToCancel.id)
      );

      setHistoryToCancel(null);

      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      Alert.error(error.message);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="ค้นหา..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-white"
          />
        </div>
        <Select
          value={filterBy}
          onValueChange={(value: "all" | "email" | "address") =>
            setFilterBy(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="ค้นหาจาก..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            <SelectItem value="email">อีเมล</SelectItem>
            <SelectItem value="address">ที่อยู่</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 rounded-md border bg-muted/50 p-3">
          <span className="text-sm font-medium">
            เลือกแล้ว {selectedIds.length} รายการ
          </span>

          <Select
            value={bulkStatus}
            onValueChange={(value: CLAIMED_REWARD_HISTORY_STATUS) =>
              setBulkStatus(value)
            }
            disabled={isBulkUpdating}
          >
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CLAIMED_REWARD_HISTORY_STATUS.INSPECTING}>
                กำลังตรวจสอบ
              </SelectItem>
              <SelectItem value={CLAIMED_REWARD_HISTORY_STATUS.DELIVERED}>
                จัดส่งแล้ว
              </SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleBulkStatusChange} disabled={isBulkUpdating}>
            {isBulkUpdating ? "กำลังอัพเดท..." : "อัปเดตสถานะ"}
          </Button>

          <Button
            variant="ghost"
            onClick={() => setSelectedIds([])}
            disabled={isBulkUpdating}
          >
            ยกเลิกการเลือก
          </Button>
        </div>
      )}

      <div>
        <Table className="min-w-[1000px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[44px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="เลือกทั้งหมดในหน้านี้"
                />
              </TableHead>
              <TableHead className="min-w-[180px]">ของรางวัล</TableHead>
              <TableHead className="min-w-[200px]">ผู้แลก</TableHead>
              <TableHead className="min-w-[240px]">การจัดส่ง</TableHead>
              <TableHead className="w-[160px]">สถานะ</TableHead>
              <TableHead className="w-[130px]">
                <Button
                  variant="ghost"
                  className="h-8 p-0 text-xs font-medium text-gray-500 hover:bg-transparent"
                  onClick={toggleSortOrder}
                >
                  วันที่แลก
                  {sortOrder === "asc" ? (
                    <ArrowUpIcon className="ml-2 h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="ml-2 h-4 w-4" />
                  )}
                </Button>
              </TableHead>
              <TableHead className="w-[130px] text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-gray-500"
                >
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((history) => (
                <TableRow
                  key={history.id}
                  data-state={
                    selectedIds.includes(history.id) ? "selected" : undefined
                  }
                  className={cn({
                    "bg-gray-50/60 opacity-60":
                      history.status ===
                      CLAIMED_REWARD_HISTORY_STATUS.CANCELLED,
                  })}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(history.id)}
                      onCheckedChange={() => toggleSelectRow(history.id)}
                      disabled={
                        history.status ===
                        CLAIMED_REWARD_HISTORY_STATUS.CANCELLED
                      }
                      aria-label={`เลือกรายการ ${history.rewards.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{history.rewards.title}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      จำนวน {history.quantity.toLocaleString("th-TH")} ชิ้น
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{history.users.full_name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      ร้าน: {history.users.store_name || "ไม่ระบุ"}
                    </p>
                    <p className="text-xs text-gray-500">
                      ตัวแทน: {history.users.agent_store_name || "ไม่ระบุ"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-[280px] truncate">
                      {history.email || "-"}
                    </p>
                    <p
                      className="mt-0.5 line-clamp-2 max-w-[280px] text-xs text-gray-500"
                      title={history.shipping_address || undefined}
                    >
                      {history.shipping_address || "ไม่มีที่อยู่จัดส่ง"}
                    </p>
                  </TableCell>
                  <TableCell>
                    {history.status ===
                    CLAIMED_REWARD_HISTORY_STATUS.CANCELLED ? (
                      <span className="inline-flex h-8 w-[140px] items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-500">
                        {CLAIMED_REWARD_HISTORY_STATUS.CANCELLED}
                      </span>
                    ) : (
                      <Select
                        value={history.status}
                        onValueChange={(value: CLAIMED_REWARD_HISTORY_STATUS) =>
                          handleStatusChange(history.id, value)
                        }
                        disabled={updatingStatus === history.id}
                      >
                        <SelectTrigger
                          className={cn(
                            "h-8 w-[140px] rounded-full border-0 text-sm font-medium",
                            {
                              "bg-amber-100 text-amber-700":
                                history.status ===
                                CLAIMED_REWARD_HISTORY_STATUS.INSPECTING,
                              "bg-green-100 text-green-700":
                                history.status ===
                                CLAIMED_REWARD_HISTORY_STATUS.DELIVERED,
                            }
                          )}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem
                            value={CLAIMED_REWARD_HISTORY_STATUS.INSPECTING}
                          >
                            กำลังตรวจสอบ
                          </SelectItem>
                          <SelectItem
                            value={CLAIMED_REWARD_HISTORY_STATUS.DELIVERED}
                          >
                            จัดส่งแล้ว
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <p>
                      {format(new Date(history.created_at), "d MMM yyyy", {
                        locale: th,
                      })}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {format(new Date(history.created_at), "HH:mm น.", {
                        locale: th,
                      })}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    {history.status ===
                      CLAIMED_REWARD_HISTORY_STATUS.INSPECTING && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => setHistoryToCancel(history)}
                        disabled={updatingStatus === history.id}
                      >
                        ยกเลิกการแลก
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination pagination={pagination} />

      <AlertDialog
        open={Boolean(historyToCancel)}
        onOpenChange={(open) => {
          if (!open && !isCancelling) setHistoryToCancel(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการยกเลิกการแลกของรางวัล</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  ยกเลิกการแลก{" "}
                  <span className="font-semibold">
                    {historyToCancel?.rewards.title}
                  </span>{" "}
                  ของ{" "}
                  <span className="font-semibold">
                    {historyToCancel?.users.full_name}
                  </span>
                </p>
                <p>
                  ระบบจะคืนคะแนนให้ลูกค้า{" "}
                  <span className="font-semibold">
                    {(historyToCancel?.rewards.required_score ?? 0) *
                      (historyToCancel?.quantity ?? 1)}
                  </span>{" "}
                  คะแนน และคืนจำนวนของรางวัลเข้าสต๊อก
                </p>
                <p className="text-red-500">
                  การยกเลิกไม่สามารถย้อนกลับได้
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              ปิด
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCancelClaimedReward();
              }}
              disabled={isCancelling}
              className="bg-red-500 hover:bg-red-600"
            >
              {isCancelling ? "กำลังยกเลิก..." : "ยืนยันยกเลิก"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
