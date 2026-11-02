import { getClaimedRewardHistoriesNew } from "@/actions/queries/claimed_reward_histories.action";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { ClaimedRewardHistory, GetClaimedRewardHistoriesParams } from "@/models/reward.model";
import { useQuery } from "@tanstack/react-query";

export function useFetchClaimedRewardHistories(
  filter?: GetClaimedRewardHistoriesParams
) {
  const query = useQuery({
    queryKey: ["fetch claimed reward histories", filter?.month, filter?.year],
    queryFn: async () => {
      const actionResult = await getClaimedRewardHistoriesNew(filter);
      SafeActionUtil.validateErrors(actionResult);
      return SafeActionUtil.getData<ClaimedRewardHistory[]>(actionResult);
    },
  });

  return query;
}
