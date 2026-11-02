import { apiGet } from "@/lib/utils/api-client.util";
import { Reward } from "@/models/reward.model";
import { useQuery } from "@tanstack/react-query";

export function useFetchRewards() {
  const query = useQuery({
    queryKey: ["rewards"],
    queryFn: () => apiGet<Reward[]>("/api/admin/rewards"),
    staleTime: 0, // Consider the data stale immediately
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  return query;
}
