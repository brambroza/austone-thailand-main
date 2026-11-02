import { getAvailableRewardsNew } from "@/actions/queries/reward.action";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { Reward } from "@/models/reward.model";
import { useQuery } from "@tanstack/react-query";

export function useFetchAvailableRewards() {
  const query = useQuery({
    queryKey: ["fetch available rewards"],
    queryFn: async () => {
      const actionResult = await getAvailableRewardsNew();
 
      SafeActionUtil.validateErrors(actionResult);

      const rewards = SafeActionUtil.getData<Reward[]>(actionResult);

      return rewards;
    },
    refetchOnWindowFocus: false,
  });

  return query;
}
