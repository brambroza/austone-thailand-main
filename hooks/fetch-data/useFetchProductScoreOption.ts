import { apiGet } from "@/lib/utils/api-client.util";
import { ProductScoreOption } from "@/models/product-score-option.model";
import { useQuery } from "@tanstack/react-query";

const DEFAULT_PRODUCT_SCORE_OPTION_ID = 1;

export function useFetchProductScoreOption(id: number = DEFAULT_PRODUCT_SCORE_OPTION_ID) {
  return useQuery({
    queryKey: ["fetch product score option", id],
    queryFn: () => apiGet<ProductScoreOption>(`/api/product-score-options/${id}`),
    enabled: Boolean(id),
    refetchOnWindowFocus: false,
  });
}
