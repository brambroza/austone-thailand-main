"use client";
import { getRewardImageUrl } from "@/lib/utils/reward-image.util";
import { Alert } from "@/components/ui/alert-message-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingModal } from "@/components/ui/loading-modal";
import { useFetchRewards } from "@/hooks/fetch-data/useFetchRewards";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RewardsForm } from "./_components/rewards-form";
import { RewardsTable } from "./_components/rewards-table";
import type { Reward } from "./_components/types";
import { filterRewards, serializeRewards } from "./_helper";
import { useManageRewardAction } from "./_hooks";
import { TablePagination } from "@/components/ui/pagination";
import { useTablePagination } from "@/hooks/useTablePagination";

export default function RewardsPage() {
  const {
    data: fetchedRewards,
    refetch: onRefreshRewards,
    isLoading: isLoadingRewards,
    isError,
  } = useFetchRewards();

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("กำลังบันทึกข้อมูล...");

  const { handleToggleStatus, handleSubmit, handleToggleAlertEnable } = useManageRewardAction({
    onSetLoadingMessage: setLoadingMessage,
    onRefreshRewards: () => {
      onRefreshRewards();
    },
    onSetIsLoading: setIsLoading,
    onSetIsFormOpen: setIsFormOpen,
    onSetEditingReward: setEditingReward,
    editingReward,
  });

  useEffect(() => {
    if (fetchedRewards) {
      setRewards(serializeRewards(fetchedRewards));
    }
  }, [fetchedRewards]);

  useEffect(() => {
    if (isError) {
      Alert.error("ไม่สามารถโหลดข้อมูลของรางวัลได้");
    }
  }, [isError]);

  const filteredRewards = useMemo(
    () => filterRewards(rewards, searchQuery),
    [rewards, searchQuery]
  );

  const { pageRows, pagination } = useTablePagination(filteredRewards, searchQuery);

  const handleEdit = async (reward: Reward) => {
    try {
      setIsLoading(true);

      const imageUrl = getRewardImageUrl(reward.id, Date.now());

      setEditingReward({
        ...reward,
        image: imageUrl,
      });

      setIsFormOpen(true);
    } catch (error) {
      Alert.error("ไม่สามารถแก้ไขข้อมูลของรางวัลได้");
      // Still open the form even if image fetch fails
      setEditingReward(reward);
      setIsFormOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาของรางวัล"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-white"
          />
        </div>
        <Button
          className="bg-[#FFE14D] hover:bg-[#FFE14D]/90 text-black"
          onClick={() => setIsFormOpen(true)}
        >
          เพิ่มของรางวัล
        </Button>
      </div>

      <div>
        <RewardsTable
          rewards={pageRows}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onToggleAlertEnable={handleToggleAlertEnable}
        />
        <TablePagination pagination={pagination} />
      </div>

      <RewardsForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingReward(null);
        }}
        onSubmit={handleSubmit}
        editingReward={editingReward}
        isLoading={isLoading}
        loadingMessage={loadingMessage}
      />

      <LoadingModal isOpen={isLoadingRewards} message="กำลังโหลดข้อมูล..." />
    </div>
  );
}
