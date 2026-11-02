"use client";
import { Button } from "@/components/ui/button";
import { Scanner } from "@yudiel/react-qr-scanner";
import { buildOpenInChromeUrl } from "@/lib/utils/open-in-browser.util";
import { X } from "lucide-react";
import { useState } from "react";

interface IBarcodeScannerProps {
  onScan: (data: string) => void;
  onCancel?: () => void;
}

const BarcodeScanner = ({ onScan, onCancel }: IBarcodeScannerProps) => {
  const [isCameraFailed, setIsCameraFailed] = useState(false);

  function openChrome() {
    window.location.assign(
      buildOpenInChromeUrl(window.location.href, navigator.userAgent)
    );
  }

  return (
    <div className="absolute top-0 left-0 w-full h-screen bg-black/90 flex items-center justify-center z-[100] overflow-y-hidden">
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {isCameraFailed && (
          <div className="mx-6 mb-4 rounded-xl bg-white p-4 text-center space-y-3">
            <p className="text-sm text-gray-700">
              เปิดกล้องไม่ได้ กรุณาอนุญาตการใช้กล้อง เปิดด้วย Chrome
              หรือพิมพ์รหัสสินค้าแทน
            </p>
            <Button onClick={openChrome}>เปิดด้วย Chrome</Button>
          </div>
        )}
        <div>
          <Scanner
            formats={[
              "code_128",
              "code_39",
              "ean_13",
              "code_93",
              "qr_code",
              "rm_qr_code",
              "micro_qr_code",
            ]}
            onScan={(results) => {
              const latestResult = results[results.length - 1];
              onScan(latestResult.rawValue);
            }}
            onError={() => setIsCameraFailed(true)}
            allowMultiple
          />
        </div>
        <div className="mx-5 rounded-2xl overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-5 top-5 text-white bg-white/20 w-10 h-10 rounded-full hover:bg-white/20"
            onClick={onCancel}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
