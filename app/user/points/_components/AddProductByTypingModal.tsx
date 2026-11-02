import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useHandleScanBarcode } from "@/features/scanned-barcodes/hooks/useHandleScanBarcode";
import { ProductScoreOption } from "@/models/product-score-option.model";
import { useState } from "react";
import { usePointsPageStore } from "../_store";

interface IAddProductByTypingModalProps {
  isOpen: boolean;
  onClose: () => void;
  productScoreOption: ProductScoreOption;
  point_multiplier?: number;
}

const AddProductByTypingModal = ({
  isOpen,
  onClose,
  productScoreOption,
  point_multiplier,
}: IAddProductByTypingModalProps) => {
  const [productId, setProductId] = useState("");

  const addProduct = usePointsPageStore((state) => state.addProduct);

  const { handleScanProduct } = useHandleScanBarcode({
    productScoreOption: productScoreOption
      ? {
        ...productScoreOption,
        score: (productScoreOption.score ?? 0) * (point_multiplier ?? 1),
      }
      : undefined,
    onAddProduct: addProduct,
    onCloseScanner: onClose,
  });

  function handleAddProduct() {
    if (!productId) return;

    handleScanProduct(productId);

    setProductId("");
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90%]">
        <DialogHeader>
          <DialogTitle>เพิ่มสินค้าโดยการพิมพ์</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <Input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="ระบุรหัสสินค้า"
          />
        </DialogDescription>
        <DialogFooter>
          <footer className="flex gap-x-4">
            <Button className="w-full" variant="outline" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button
              className="w-full"
              variant="default"
              onClick={handleAddProduct}
            >
              เพิ่มสินค้า
            </Button>
          </footer>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductByTypingModal;
