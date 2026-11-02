import { apiGet } from "@/lib/utils/api-client.util";
import { ServerActionResponse } from "@/models/api.model";
import { WithProductScoreOption } from "@/models/product-score-option.model";
import {
  GetScannedBarcodeHistoriesByUserIdParams,
  ScannedBarcode,
} from "@/models/scanned-barcodes.model";
import { WithUser } from "@/models/user.model";
import { useQuery } from "@tanstack/react-query";

export function useFetchScannedBarcodeHistoriesByUserId(
  params: GetScannedBarcodeHistoriesByUserIdParams
) {
  return useQuery({
    queryKey: [
      "scanned-barcode-histories",
      params.user_id,
      params.filter?.from,
      params.filter?.to,
    ],
    queryFn: async () => {
      const { data, isError, error } = await apiGet<
        ServerActionResponse<WithUser<WithProductScoreOption<ScannedBarcode>>[]>
      >(`/api/users/${encodeURIComponent(params.user_id)}/scanned-barcodes`, {
        from: params.filter?.from,
        to: params.filter?.to,
      });

      if (isError) {
        throw new Error(error);
      }

      return data;
    },
  });
}
