import { getTotalUsersNumber } from "@/actions/queries/users.action";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { useQuery } from "@tanstack/react-query";

export function useFetchTotalUsersNumber() {
  const query = useQuery({
    queryKey: ["fetch total users number"],
    queryFn: async () => {
      return SafeActionUtil.getData<number>(await getTotalUsersNumber());
    },
  });

  return query;
}
