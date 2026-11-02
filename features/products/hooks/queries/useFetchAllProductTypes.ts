import { apiGet } from "@/lib/utils/api-client.util";
import { useQuery } from "@tanstack/react-query";
import { ProductType, ProductTypePromotion } from "../../types/product.type";

export function useFetchAllProductTypes() {
  return useQuery({
    queryKey: ["fetch-all-product-types"],
    queryFn: () => apiGet<ProductType[]>("/api/admin/product-types"),
    refetchOnWindowFocus: false,
  });
}

export function useFetchAllProductTypesPromotions() {
  return useQuery({
    queryKey: ["fetch-all-product-types-promotions"],
    queryFn: () =>
      apiGet<ProductTypePromotion[]>("/api/admin/product-type-promotions"),
    refetchOnWindowFocus: false,
  });
}
