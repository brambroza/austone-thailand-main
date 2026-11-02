import { ClaimedRewardHistory } from "@/models/reward.model";

export function searchClaimedRewardHistoriesWithFilterMode(
  searchQuery: string,
  claimedRewardHistories: ClaimedRewardHistory[],
  filterBy: "email" | "address" | "all",
  sortOrder: "asc" | "desc"
) {
  let result = [...claimedRewardHistories];

  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase();
    result = result.filter((history) => {
      if (filterBy === "email" && history.email) {
        return history.email.toLowerCase().includes(searchLower);
      }

      if (filterBy === "address" && history.shipping_address) {
        return history.shipping_address.toLowerCase().includes(searchLower);
      }

      return (
        history.user_id.toLowerCase().includes(searchLower) ||
        (history.email?.toLowerCase().includes(searchLower) ?? false) ||
        (history.shipping_address?.toLowerCase().includes(searchLower) ??
          false) ||
        history.users.agent_store_name?.toLowerCase().includes(searchLower) ||
        history.users.full_name?.toLowerCase().includes(searchLower)
      );
    });
  }

  // Sort
  result.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  return result;
}

export function searchClaimedRewardHistories(
  searchQuery: string,
  claimedRewardHistories: ClaimedRewardHistory[]
) {
  return claimedRewardHistories?.filter((claimedRewardHistory) =>
    Object.values(claimedRewardHistory).some((value) => {
      return (
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        claimedRewardHistory.users.store_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        claimedRewardHistory.users.agent_store_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        claimedRewardHistory.rewards.title
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        claimedRewardHistory.users.full_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
    })
  );
}

export function formatClaimedRewardHistories(
  claimedRewardHistories: ClaimedRewardHistory[]
) {
  const map = new Map<string, number>();

  claimedRewardHistories.forEach((claimedRewardHistory) => {
    const date = new Date(claimedRewardHistory.created_at).toLocaleDateString(
      "th-TH",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
    map.set(date, (map.get(date) || 0) + claimedRewardHistory.quantity);
  });
  return Array.from(map.entries()).map(([date, quantity]) => ({
    date,
    rewards: quantity,
  }));
}

export function sortClaimedRewardHistories(
  claimedRewardHistories: {
    date: string;
    rewards: number;
  }[]
) {
  return claimedRewardHistories.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}
