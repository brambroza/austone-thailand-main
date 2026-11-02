import { fetchUserInfo } from "@/actions/queries/users.action";
import { useQuery } from "@tanstack/react-query";

export function useFetchUserInfo(userId: string) {
  return useQuery({
    queryKey: ["fetch user info", userId],
    queryFn: async () => {
      const actionResult = await fetchUserInfo({ user_id: userId });

      const data = actionResult?.data;

      if (!data) return null;

      const { isError, error, data: user } = data;

      if (isError || !user) throw new Error(error);

      return user;
    },
    enabled: Boolean(userId),
    refetchOnWindowFocus: false,
  });
}
