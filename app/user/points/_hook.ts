import { Alert } from "@/components/ui/alert-message-dialog";
import { useEffect } from "react";
import { usePointsPageStore } from "./_store";
import { Product } from "./_type";

function hasAlreadyAdded(products: Product[], productIds: string[]) {
  return products.find((product) => productIds.includes(product.id));
}

export function useAddProductFromScanner(
  productIds: string[] | null,
  isScanning: boolean,
  onResetScanResult: () => void,
  score: number
) {
  const products = usePointsPageStore((state) => state.products);

  const addProduct = usePointsPageStore((state) => state.addProduct);

  useEffect(() => {
    if (!productIds || productIds.length === 0 || isScanning) return;

    if (hasAlreadyAdded(products, productIds)) {
      Alert.error("รหัสสินค้านี้มีอยู่ในรายการแล้ว");
      return;
    }

    productIds.forEach((productId) => {
      addProduct({
        id: productId,
        points: score,
      });
    });

    Alert.success("เพิ่มสินค้าสำเร็จ");

    onResetScanResult();
  }, [productIds, isScanning]);
}
