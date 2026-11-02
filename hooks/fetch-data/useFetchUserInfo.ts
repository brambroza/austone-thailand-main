import { apiGet } from "@/lib/utils/api-client.util";
import { ServerActionResponse } from "@/models/api.model";
import { UserInfoView } from "@/models/user.model";
import { useQuery } from "@tanstack/react-query";

export function useFetchUserInfo(userId: string) {
  return useQuery({
    queryKey: ["fetch user info", userId],
    queryFn: async () => {
      const data = await apiGet<ServerActionResponse<UserInfoView> | null>(
        `/api/users/${encodeURIComponent(userId)}`
      );

      if (!data) return null;

      const { isError, error, data: user } = data;

      if (isError || !user) throw new Error(error);

      return user;
    },
    enabled: Boolean(userId),
    refetchOnWindowFocus: false,
  });
}
