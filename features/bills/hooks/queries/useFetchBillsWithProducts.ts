import { getBillsWithProductsAndProductTypesAndProductTypeConstraints } from "@/features/bills/actions/bills.action";
import { useQuery } from "@tanstack/react-query";

export function useFetchBillsWithProductsAndProductTypesAndProductTypeConstraints() {
  return useQuery({
    queryKey: ["bills", "product-types", "product-type-constraints"],
    queryFn: async () => {
      const response =
        await getBillsWithProductsAndProductTypesAndProductTypeConstraints();

      if (response?.isError) throw new Error(response?.error);

      return response?.data;
    },
    refetchOnWindowFocus: false,
  });
}
