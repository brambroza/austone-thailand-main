import { useQuery } from "@tanstack/react-query";
import { getBillById } from "../../actions/bills.action";

export function useFetchBillById(id: string) {
  return useQuery({
    queryKey: ["bill by id", id],
    queryFn: async () => {
      const { data: billInfo, error } = await getBillById(id);

      if (error) throw new Error(error);

      return billInfo;
    },
    refetchOnWindowFocus: false,
  });
}
