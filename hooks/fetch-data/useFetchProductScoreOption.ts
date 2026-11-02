import { getProductScoreOptionById } from "@/actions/queries/product-score-option.action";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { ProductScoreOption } from "@/models/product-score-option.model";
import { useQuery } from "@tanstack/react-query";

const DEFAULT_PRODUCT_SCORE_OPTION_ID = 1;

export function useFetchProductScoreOption(id: number = DEFAULT_PRODUCT_SCORE_OPTION_ID) {
  return useQuery({
    queryKey: ["fetch product score option", id],
    queryFn: async () => {
      const actionResult = await getProductScoreOptionById({ id });
      const data = SafeActionUtil.getData<ProductScoreOption>(actionResult);
      return data;
    },
    enabled: Boolean(id),
    refetchOnWindowFocus: false,
  });
}
