import { getAllScannedBarcodes } from "@/actions/queries/scanned-barcodes.action";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { ServerActionResponse } from "@/models/api.model";
import { ScannedBarcode } from "@/models/scanned-barcodes.model";
import { useQuery } from "@tanstack/react-query";

export function useFetchAllScannedBarcodes() {
  const query = useQuery({
    queryKey: ["fetch all scanned barcodes"],
    queryFn: async () => {
      const actionResult = await getAllScannedBarcodes();
      SafeActionUtil.validateErrors(actionResult);
      const { data } =
        SafeActionUtil.getData<ServerActionResponse<ScannedBarcode[]>>(
          actionResult
        );

      return data;
    },
  });

  return query;
}
