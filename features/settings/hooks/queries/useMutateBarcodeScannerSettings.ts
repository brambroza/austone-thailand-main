import { useQuery } from "@tanstack/react-query";
import { getBarcodeScannerSetting } from "../../actions/barcode-scanner-settings.action";

export function useFetchBarcodeScannerSettings() {
  return useQuery({
    queryKey: ["barcode-scanner-settings"],
    queryFn: async () => {
      const { data, isError, error } = await getBarcodeScannerSetting();

      if (isError) throw new Error(error);

      return data;
    },
  });
}
