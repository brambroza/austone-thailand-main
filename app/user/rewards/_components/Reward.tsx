"use client";

import { claimReward } from "@/actions/queries/claimed_reward_histories.action";
import { getRewardImageById } from "@/actions/storage/reward-storage.action";
import { Alert } from "@/components/ui/alert-message-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import type { Reward as RewardType } from "@/models/reward.model";
import { useEffect, useState } from "react";
import ClaimRewardModal from "./ClaimRewardModal";

interface RewardProps {
  reward: RewardType;
  userId: string;
  totalUserScores: number;
  onRefreshData: () => void;
}

export default function Reward({
  reward,
  userId,
  totalUserScores,
  onRefreshData,
}: RewardProps) {
  const [image, setImage] = useState<string | null>(null);

  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    async function loadImage() {
      try {
        const result = await getRewardImageById({ id: reward.id });
        const imageUrl = SafeActionUtil.getData<string>(result);
        setImage(imageUrl);
      } catch (error) {
        console.error(`Failed to load image for reward ${reward.id}:`, error);
      }
    }
    loadImage();
  }, [reward.id]);

  async function handleClaimReward(email: string, shippingAddress: string) {
    try {
      setIsClaiming(true);

      const result = await claimReward({
        reward_id: reward.id,
        user_id: userId,
        email,
        shipping_address: shippingAddress,
      });

      if (!result?.data)
        throw new Error(result?.serverError ?? "ไม่สามารถแลกรางวัลได้");

      const { isError, error } = result.data;

      if (isError) throw new Error(error);

      Alert.success("แลกรางวัลสำเร็จ");

      onRefreshData();
    } catch (error: any) {
      Alert.error(error.message);
    } finally {
      setIsClaiming(false);
    }
  }

  return (
    <>
      <Card className="overflow-hidden bg-white">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Image Container */}
            <div className="w-full sm:w-32 h-32 flex-shrink-0">
              {image ? (
                <img
                  src={image}
                  alt={reward.title}
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="w-full h-full bg-muted rounded-lg" />
              )}
            </div>

            {/* Content Container */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium mb-1 line-clamp-1">
                {reward.title}
              </h3>
              {reward.description && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {reward.description}
                </p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span>
                  ใช้แต้ม: {reward.required_score.toLocaleString("th-TH")}
                </span>
                <span>เหลือ: {reward.quantity.toLocaleString("th-TH")}</span>
              </div>
            </div>

            {/* Button Container */}
            <div className="mt-4 sm:mt-0 sm:flex sm:items-center">
              <Button
                className="w-full sm:w-auto bg-[#FFE14D] text-black"
                disabled={
                  reward.quantity === 0 ||
                  totalUserScores < reward.required_score ||
                  isClaiming
                }
                onClick={() => setIsClaimModalOpen(true)}
              >
                แลกรางวัล
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <ClaimRewardModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onConfirm={handleClaimReward}
        reward={reward}
      />
    </>
  );
}
