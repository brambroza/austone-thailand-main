import { Alert } from "@/components/ui/alert-message-dialog";
import { ProductType } from "@/features/products/types/product.type";
import { useDetectKeyStrokes } from "@/hooks/useDetectKeyStrokes";
import { ADD_PRODUCT_METHOD } from "@/models/enums/product.enum";
import { useEffect } from "react";
import { useEditBillFormStore } from "../stores/useEditBillFormStore";
import { useEditBillHelpers } from "./useEditBillHelpers";
import { Bill } from "../types/bill.type";
const DEFAULT_DELAY = 1000;

export function useAddProductToBill({
  AfkDelay = DEFAULT_DELAY,
  productTypes,
  billId,
}: {
  AfkDelay?: number;
  productTypes: ProductType[];
  billId: Bill["id"];
}) {
  const { validateCurrentProductTypeConstraintLimit } =
    useEditBillHelpers(billId);

  const isEditingProductId = useEditBillFormStore(
    (state) => state.isEditingProductId
  );

  const products = useEditBillFormStore((state) => state.products);

  const addProduct = useEditBillFormStore((state) => state.addProduct);

  const currentSelectedProductTypeConstraintId = useEditBillFormStore(
    (state) => state.currentSelectedProductTypeConstraintId
  );

  const isEditingFormData = useEditBillFormStore(
    (state) => state.isEditingFormData
  );

  const { keyStrokes: productId, onResetKeyStrokes } = useDetectKeyStrokes(
    !isEditingProductId && !isEditingFormData
  );

  function handleAddProductId(productId: string) {
    try {
      if (!currentSelectedProductTypeConstraintId) {
        Alert.error("กรุณาเลือกประเภทยางก่อนทำการเพิ่มสินค้า");
        return;
      }

      if (products.find((p) => p.id === productId)) {
        Alert.error("สินค้านี้มีอยู่ในรายการแล้ว");
        return;
      }

      validateCurrentProductTypeConstraintLimit();

      const matchedProductType = productTypes.find(
        (pt) => pt.id === currentSelectedProductTypeConstraintId
      );

      if (!matchedProductType) {
        Alert.error("ไม่พบประเภทยางที่ต้องการเพิ่ม");
        return;
      }

      const detectedProductIds = productId.includes("Enter")
        ? productId.split("Enter").filter((id) => id !== "")
        : [productId];

      detectedProductIds.forEach((id) => {
        addProduct({
          id: id,
          method: ADD_PRODUCT_METHOD.CREATE_BILL,
          product_type_id: currentSelectedProductTypeConstraintId,
          product_type: matchedProductType,
          bill_id: null,
        });
      });
    } catch (error: any) {
      Alert.error(error.message);
    }
  }

  useEffect(() => {
    if (productId.length === 0 || isEditingProductId) return;

    const timeoutId = setTimeout(() => {
      handleAddProductId(productId);
      onResetKeyStrokes();
    }, AfkDelay);

    return () => clearTimeout(timeoutId);
  }, [productId]);
}
