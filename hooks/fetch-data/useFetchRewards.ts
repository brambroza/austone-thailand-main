import { getRewardsNew } from "@/actions/queries/reward.action";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { Reward } from "@/models/reward.model";
import { useQuery } from "@tanstack/react-query";

export function useFetchRewards() {
  const query = useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const actionResult = await getRewardsNew();

      SafeActionUtil.validateErrors(actionResult);

      const rewards = SafeActionUtil.getData<Reward[]>(actionResult);

      return rewards;
    },
    staleTime: 0, // Consider the data stale immediately
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  return query;
}
