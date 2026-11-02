import { getClaimedRewardHistoriesByUserId } from "@/actions/queries/claimed_reward_histories.action";
import { Alert } from "@/components/ui/alert-message-dialog";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { ServerActionResponse } from "@/models/api.model";
import {
  ClaimedRewardHistory,
  GetClaimedRewardHistoriesByUserIdParams,
} from "@/models/reward.model";
import { useQuery } from "@tanstack/react-query";

export function useFetchClaimedRewardHistoriesByUserId(
  params: GetClaimedRewardHistoriesByUserIdParams
) {
  return useQuery({
    queryKey: ["claimed-reward-histories", params.user_id, params.filter],
    queryFn: async () => {
      try {
        const result = await getClaimedRewardHistoriesByUserId({
          user_id: params.user_id,
          filter: params.filter ?? undefined,
        });

        const {
          data: userClaimedRewardHistories,
          isError,
          error,
        } = SafeActionUtil.getData<
          ServerActionResponse<ClaimedRewardHistory[]>
        >(result);

        if (isError) throw new Error(error);

        return userClaimedRewardHistories;
      } catch (error: any) {
        Alert.error(error.message);

        return null;
      }
    },
  });
}
