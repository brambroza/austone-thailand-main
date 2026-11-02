import { useQuery } from "@tanstack/react-query";
import { fetchAllProductsByBillIdAction } from "../../actions/products.action";

export function useFetchAllProductsByBillId(billId: number) {
  return useQuery({
    queryKey: ["products by bill id", billId],
    queryFn: async () => {
      const {
        data: products,
        isError,
        error,
      } = await fetchAllProductsByBillIdAction(billId);

      if (isError) throw new Error(error);

      return products;
    },
  });
}
