import { getScannedBarcodeHistoriesByUserId } from "@/actions/queries/scanned-barcodes.action";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
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
      const { data, isError, error } = await getScannedBarcodeHistoriesByUserId(
        params
      );

      if (isError) {
        throw new Error(error);
      }

      return data;
    },
  });
}
