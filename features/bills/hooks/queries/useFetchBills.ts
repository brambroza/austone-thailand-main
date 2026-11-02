import { getBills } from "@/features/bills/actions/bills.action";
import { useQuery } from "@tanstack/react-query";

export function useFetchBills() {
  return useQuery({
    queryKey: ["all bills"],
    queryFn: async () => {
      const response = await getBills();

      if (response?.isError) throw new Error(response?.error);

      return response?.data;
    },
    refetchOnWindowFocus: false,
  });
}
