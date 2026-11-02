import { getTotalNumberOfClaimedRewards } from "@/actions/queries/claimed_reward_histories.action";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { useQuery } from "@tanstack/react-query";

export const useFetchTotalNumberOfClaimedRewards = () => {
  const query = useQuery({
    queryKey: ["totalClaimedRewards"],
    queryFn: async () => {
      return SafeActionUtil.getData<number>(
        await getTotalNumberOfClaimedRewards()
      );
    },
  });

  return query;
};
