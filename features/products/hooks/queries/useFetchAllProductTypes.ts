import { useQuery } from "@tanstack/react-query";
import { getAllProductTypesAction, getAllProductTypesPromotionsAction } from "../../actions/product-types.action";

export function useFetchAllProductTypes() {
  return useQuery({
    queryKey: ["fetch-all-product-types"],
    queryFn: async () => {
      const {
        data: productTypes,
        isError,
        error,
      } = await getAllProductTypesAction();

      if (isError) throw new Error(error);

      return productTypes;
    },
    refetchOnWindowFocus: false,
  });
}



export function useFetchAllProductTypesPromotions() {
  return useQuery({
    queryKey: ["fetch-all-product-types-promotions"],
    queryFn: async () => {
      const {
        data: producttypespromotions,
        isError,
        error,
      } = await getAllProductTypesPromotionsAction();

      if (isError) throw new Error(error);

      return producttypespromotions;
    },
    refetchOnWindowFocus: false,
  });
}