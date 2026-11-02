import { Alert } from "@/components/ui/alert-message-dialog";
import { apiGet } from "@/lib/utils/api-client.util";
import { ServerActionResponse } from "@/models/api.model";
import { useQuery } from "@tanstack/react-query";

type ExpiringPoints = {
  expired_date: string;
  total_score_soon_expire: number;
  expire_message: string;
};

export function useFetchUserTotalScoreById(user_id: string) {
  const query = useQuery({
    queryKey: ["fetch user total score by id", user_id],
    queryFn: async () => {
      try {
        const {
          data: scores,
          isError,
          error,
        } = await apiGet<ServerActionResponse<number>>(
          `/api/users/${encodeURIComponent(user_id)}/score`
        );
        if (isError) throw new Error(error);
        return scores;
      } catch (error: any) {
        Alert.error(error.message);
        return 0;
      }
    },
    refetchOnWindowFocus: false,
  });

  return query;
}



export function useFetchUserExpiringSoonById(user_id: string) {
  const query = useQuery({
    queryKey: ["fetch user total score Expiring Soon by id", user_id],
    queryFn: async () => {
      try {
        const {
          data: scores,
          isError,
          error,
        } = await apiGet<ServerActionResponse<ExpiringPoints | null>>(
          `/api/users/${encodeURIComponent(user_id)}/expiring-points`
        );
        if (isError) throw new Error(error);
        return scores;
      } catch (error: any) {
        Alert.error(error.message);
        return 0;
      }
    },
    refetchOnWindowFocus: false,
  });

  return query;
}
