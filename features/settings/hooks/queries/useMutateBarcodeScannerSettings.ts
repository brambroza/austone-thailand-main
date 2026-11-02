import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/utils/api-client.util";
import { ServerActionResponse } from "@/models/api.model";
import { BarcodeScannerSetting } from "../../types/barcode-scanner-setting.type";

export function useFetchBarcodeScannerSettings() {
  return useQuery({
    queryKey: ["barcode-scanner-settings"],
    queryFn: async () => {
      const { data, isError, error } = await apiGet<
        ServerActionResponse<BarcodeScannerSetting>
      >("/api/settings/barcode-scanner");

      if (isError) throw new Error(error);

      return data;
    },
  });
}
