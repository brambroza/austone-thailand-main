import { apiGet } from "@/lib/utils/api-client.util";
import { useQuery } from "@tanstack/react-query";
import {
  UserPointAccumulateHistory,
  UserPointHistory,
} from "../../types/user-point-history.type";

/** แปลงช่วงวันที่เป็น query string ของรายงานคะแนน */
function toDateParams(startDate: Date, endDate: Date) {
  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}

export function useFetchUserPointHistories({
  startDate,
  endDate,
}: {
  startDate: Date;
  endDate: Date;
}) {
  return useQuery({
    queryKey: ["user-point-histories", startDate, endDate],
    queryFn: () =>
      apiGet<UserPointHistory[]>("/api/admin/point-histories", {
        report: "redeemed",
        ...toDateParams(startDate, endDate),
      }),
    refetchOnWindowFocus: false,
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
    queryFn: () =>
      apiGet<UserPointAccumulateHistory[]>("/api/admin/point-histories", {
        report: "accumulated",
        ...toDateParams(startDate, endDate),
      }),
    refetchOnWindowFocus: false,
  });
}
