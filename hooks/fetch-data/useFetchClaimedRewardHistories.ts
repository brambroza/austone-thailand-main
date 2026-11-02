import { apiGet } from "@/lib/utils/api-client.util";
import { ClaimedRewardHistory, GetClaimedRewardHistoriesParams } from "@/models/reward.model";
import { useQuery } from "@tanstack/react-query";

export function useFetchClaimedRewardHistories(
  filter?: GetClaimedRewardHistoriesParams
) {
  const query = useQuery({
    queryKey: ["fetch claimed reward histories", filter?.month, filter?.year],
    queryFn: () =>
      apiGet<ClaimedRewardHistory[]>("/api/admin/claimed-rewards", {
        month: filter?.month.toString(),
        year: filter?.year.toString(),
      }),
    refetchOnWindowFocus: false,
  });

  return query;
}
