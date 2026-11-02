import { Button } from "@/components/ui/button";
import { BarcodeIcon } from "lucide-react";
import { usePointsPageStore } from "../_store";

type Props = {
  isDisabled: Boolean;
  disabledMessage?: string;
};

const BarcodeScannerButton = ({ isDisabled, disabledMessage }: Props) => {
  const showScanner = usePointsPageStore((state) => state.showScanner);

  return (
    <div className="flex flex-col items-center">
      <Button
        onClick={showScanner}
        disabled={Boolean(isDisabled)}
        className="w-full bg-background hover:bg-background/90 text-foreground"
      >
        <BarcodeIcon className="mr-2 h-4 w-4" />
        สแกนบาร์โค้ด เพิ่ม
      </Button>
      {disabledMessage && (
        <p className="text-sm text-red-600 mt-2">{disabledMessage}</p>
      )}
    </div>
  );
};

export default BarcodeScannerButton;
