import { Reward as RewardModel } from "@/models/reward.model";
import { Reward } from "./_components/types";

export function serializeRewards(rewards: RewardModel[]) {
  return rewards.map((reward) => ({
    id: reward.id,
    name: reward.title,
    description: reward.description || "",
    points: reward.required_score,
    image: null,
    isActive: reward.is_visible,
    expirationDate: new Date(reward.expired_at),
    availableAt: new Date(reward.available_at),
    amount: reward.quantity,
    isAlertEnabled: reward.is_alert_enable,
  }));
}

export function filterRewards(rewards: Reward[], searchQuery: string) {
  return rewards.filter(
    (reward) =>
      reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reward.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
}
