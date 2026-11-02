import React from "react";
import { CLAIMED_REWARD_HISTORY_STATUS } from "../types/claimed-reward-history.type";
import { cn } from "@/lib/utils";

interface IClaimedRewardHistoryStatusTagProps {
  status: CLAIMED_REWARD_HISTORY_STATUS;
}

const ClaimedRewardHistoryStatusTag = ({
  status,
}: IClaimedRewardHistoryStatusTagProps) => {
  return (
    <div
      className={cn(
        status === CLAIMED_REWARD_HISTORY_STATUS.INSPECTING && "bg-yellow-500",
        status === CLAIMED_REWARD_HISTORY_STATUS.DELIVERED && "bg-green-600",
        status === CLAIMED_REWARD_HISTORY_STATUS.CANCELLED && "bg-gray-500",
        "w-full px-3 py-1 rounded-full"
      )}
    >
      <p className="text-white text-sm">{status}</p>
    </div>
  );
};

export default ClaimedRewardHistoryStatusTag;
