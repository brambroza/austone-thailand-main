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

  // รายการที่ยกเลิกไปแล้วห้ามแก้สถานะซ้ำ จึงไม่ให้เลือกเพื่ออัปเดตแบบกลุ่ม
  const selectableHistories = useMemo(
    () =>
      filteredAndSortedHistories.filter(
        (history) =>
          history.status !== CLAIMED_REWARD_HISTORY_STATUS.CANCELLED
      ),
    [filteredAndSortedHistories]
  );

  const isAllSelected =
    selectableHistories.length > 0 &&
    selectableHistories.every((history) => selectedIds.includes(history.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(selectableHistories.map((history) => history.id));
    }
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
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="เลือกทั้งหมด"
                />
              </TableHead>
              <TableHead>ชื่อรางวัล</TableHead>
              <TableHead>ชื่อผู้แลก</TableHead>
              <TableHead>ชื่อร้านค้า</TableHead>
              <TableHead>ชื่อร้านค้าตัวแทนจำหน่าย</TableHead>
              <TableHead>อีเมล</TableHead>
              <TableHead className="max-w-[300px]">ที่อยู่จัดส่ง</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-8 p-0 hover:bg-transparent"
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
              <TableHead className="text-center">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedHistories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="h-24 text-center text-muted-foreground"
                >
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedHistories.map((history) => (
                <TableRow key={history.id}>
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
                  <TableCell className="font-medium">
                    {history.rewards.title}
                  </TableCell>
                  <TableCell>{history.users.full_name}</TableCell>
                  <TableCell>{history.users.store_name ?? "ไม่ระบุ"}</TableCell>
                  <TableCell>
                    {Boolean(history.users.agent_store_name)
                      ? history.users.agent_store_name
                      : "ไม่ระบุ"}
                  </TableCell>
                  <TableCell>{history.email || "-"}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {history.shipping_address || "-"}
                  </TableCell>
                  <TableCell>
                    {history.status ===
                    CLAIMED_REWARD_HISTORY_STATUS.CANCELLED ? (
                      <span className="inline-flex w-[140px] justify-center rounded-md border px-3 py-2 text-sm font-bold text-gray-500">
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
                        className={cn("w-[140px] font-bold", {
                          "text-red-500":
                            history.status ===
                            CLAIMED_REWARD_HISTORY_STATUS.INSPECTING,
                          "text-green-500":
                            history.status ===
                            CLAIMED_REWARD_HISTORY_STATUS.DELIVERED,
                        })}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value={CLAIMED_REWARD_HISTORY_STATUS.INSPECTING}
                          className="font-bold text-red-500"
                        >
                          กำลังตรวจสอบ
                        </SelectItem>
                        <SelectItem
                          value={CLAIMED_REWARD_HISTORY_STATUS.DELIVERED}
                          className="font-bold text-green-500"
                        >
                          จัดส่งแล้ว
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(history.created_at), "d MMM yyyy HH:mm", {
                      locale: th,
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    {history.status ===
                    CLAIMED_REWARD_HISTORY_STATUS.INSPECTING ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => setHistoryToCancel(history)}
                        disabled={updatingStatus === history.id}
                      >
                        ยกเลิกการแลก
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
