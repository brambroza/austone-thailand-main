import { Alert } from "@/components/ui/alert-message-dialog";
import { apiGet } from "@/lib/utils/api-client.util";
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
        const {
          data: userClaimedRewardHistories,
          isError,
          error,
        } = await apiGet<ServerActionResponse<ClaimedRewardHistory[]>>(
          `/api/users/${encodeURIComponent(params.user_id)}/claimed-rewards`,
          { from: params.filter?.from, to: params.filter?.to }
        );

        if (isError) throw new Error(error);

        return userClaimedRewardHistories;
      } catch (error: any) {
        Alert.error(error.message);

        return null;
      }
    },
  });
}
