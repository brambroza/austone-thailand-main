import { useQuery } from "@tanstack/react-query";

import { fetchAllUsers } from "@/actions/queries/users.action";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { ServerActionResponse } from "@/models/api.model";
import { User } from "@/models/user.model";

export function useFetchAllUsers() {
  return useQuery({
    queryKey: ["fetch all users"],
    queryFn: async () => {
      const { data, isError, error } = SafeActionUtil.getData<
        ServerActionResponse<User[]>
      >(await fetchAllUsers());

      if (isError) throw new Error(error);

      return data;
    },
  });
}
