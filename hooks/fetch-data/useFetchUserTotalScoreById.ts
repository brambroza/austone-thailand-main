import { getUserPointsExpiringSoon, getUserTotalScoreById } from "@/actions/queries/score.action";
import { Alert } from "@/components/ui/alert-message-dialog";
import { useQuery } from "@tanstack/react-query";

export function useFetchUserTotalScoreById(user_id: string) {
  const query = useQuery({
    queryKey: ["fetch user total score by id", user_id],
    queryFn: async () => {
      try {
        const {
          data: scores,
          isError,
          error,
        } = await getUserTotalScoreById({ user_id });
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
        } = await getUserPointsExpiringSoon({ user_id });
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
