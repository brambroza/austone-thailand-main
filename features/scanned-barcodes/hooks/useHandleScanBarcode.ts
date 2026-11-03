import { Alert } from "@/components/ui/alert-message-dialog";
import { doesProductIdExistAction } from "@/features/products/actions/products.action";
import { ProductScoreOption } from "@/models/product-score-option.model";
import { Product } from "@/models/product.model";


const DEFAULT_PRODUCT_SCORE = 0;

interface IUseHandleScanBarcodeProps {
  productScoreOption: ProductScoreOption | undefined;
  onAddProduct: (product: { id: Product["id"]; points: number }) => void;
  onCloseScanner: () => void;
}

export function useHandleScanBarcode({
  productScoreOption,
  onAddProduct,
  onCloseScanner,
}: IUseHandleScanBarcodeProps) {
  async function handleScanProduct(productId: string) {
    try {
      if (!productId) return;

      const { data: isProductIdExist, error } = await doesProductIdExistAction(
        productId
      );

      if (error) throw new Error(error);

      if (!isProductIdExist) {
        Alert.error("รหัสสินค้านี้ไม่มีอยู่ในระบบ");
        onCloseScanner();
        return;
      }

      if (!isProductIdExist.canCollectPoints) {
        Alert.error("สินค้านี้ไม่ร่วมรายการสะสมแต้ม");
        onCloseScanner();
        return;
      }

      onAddProduct({
        id: productId,
        points: isProductIdExist.point * (productScoreOption?.score ?? DEFAULT_PRODUCT_SCORE),
      });

      onCloseScanner();
    } catch (error: any) {
      Alert.error(error.message);
    }
  }
  return {
    handleScanProduct,
  };
}
