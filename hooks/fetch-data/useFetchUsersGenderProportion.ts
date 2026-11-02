import { useQuery } from "@tanstack/react-query";

import { getUsersGenderProportion } from "@/actions/queries/users.action";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { ServerActionResponse } from "@/models/api.model";
import { UserGenderProportion } from "@/models/user.model";

export function useFetchUsersGenderProportion() {
  return useQuery({
    queryKey: ["fetch users gender proportion"],
    queryFn: async () => {
      const { data, isError, error } = SafeActionUtil.getData<
        ServerActionResponse<UserGenderProportion>
      >(await getUsersGenderProportion());

      if (isError) throw new Error(error);


      return data;
    },
  });
}
