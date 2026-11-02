"use client";
import { useEffect, useState } from "react";
import ScanbotSDK from "scanbot-web-sdk/ui";
import { toast } from "sonner";

export function useBarcodeScanner(scanDelay: number = 1000) {
  const [scanResult, setScanResult] = useState<string[] | null>(null);

  const [isScanning, setIsScanning] = useState(false);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initializeScanBot = async () => {
      try {
        await ScanbotSDK.initialize({
          licenseKey: "",
        });
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize ScanBot:", error);
      }
    };

    initializeScanBot();
  }, []);

  const onStartScan = async () => {
    if (typeof window === "undefined" || !isInitialized) return;

    setIsScanning(true);

    try {
      const config = new ScanbotSDK.UI.Config.BarcodeScannerConfiguration();

      config.userGuidance.title.text = "วางกรอบหน้ากล้องไว้บนบาร์โค้ด";
      config.topBar.title.text = "สแกนบาร์โค้ด";
      config.timeouts.initialScanDelay = scanDelay;

      const result = await ScanbotSDK.UI.createBarcodeScanner(config);

      const isResultEmpty = result && result?.items.length === 0;

      if (!isResultEmpty) {
        setScanResult(result!.items.map((item) => item.text));
      }
    } catch (error) {
      console.error("Failed to scan barcode:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const onResetScanResult = () => {
    setScanResult(null);
  };

  return { scanResult, isScanning, onStartScan, onResetScanResult };
}
