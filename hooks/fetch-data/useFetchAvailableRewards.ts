import { apiGet } from "@/lib/utils/api-client.util";
import { ServerActionResponse } from "@/models/api.model";
import { Reward } from "@/models/reward.model";
import { useQuery } from "@tanstack/react-query";

export function useFetchAvailableRewards() {
  const query = useQuery({
    queryKey: ["fetch available rewards"],
    queryFn: async () => {
      const actionResult = await apiGet<ServerActionResponse<Reward[]>>(
        "/api/rewards/available"
      );

      if (actionResult.isError) throw new Error(actionResult.error);

      return actionResult.data ?? [];
    },
    refetchOnWindowFocus: false,
  });

  return query;
}
