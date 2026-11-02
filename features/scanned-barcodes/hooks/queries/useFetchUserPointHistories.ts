import { useQuery } from "@tanstack/react-query";
import { getUserPointAccumelateHistories, getUserPointHistories } from "../../actions/get-user-point-histories.action";

export function useFetchUserPointHistories({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) {
  return useQuery({
    queryKey: ["user-point-histories", startDate, endDate],
    queryFn: async () => {
      const userPointHistories = await getUserPointHistories(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );

      return userPointHistories;
    },
  });
}


export function useFetchUserPointAccumulateHistories({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) {
  return useQuery({
    queryKey: ["user-point-accumulate-histories", startDate, endDate],
    queryFn: async () => {
      const userPointHistories = await getUserPointAccumelateHistories(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0]
      );

      return userPointHistories;
    },
  });
}

