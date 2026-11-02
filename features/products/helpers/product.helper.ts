import { BillProduct } from "@/features/bills/types/bill.type";
import { ADD_PRODUCT_METHOD } from "@/models/enums/product.enum";
import { ProductWithProductType } from "@/models/product.model";

export function convertProductCSVtoProduct(productRow: string) {
  const [id, product_type_id] = productRow.split(",");
  return {
    id: id.trim(),
    product_type_id: parseInt(product_type_id.trim()),
    method: ADD_PRODUCT_METHOD.CSV,
    bill_id: null,
    updated_by_user_id: null,
  };
}

export function convertProductToBillProduct(
  product: ProductWithProductType
): BillProduct {
  return {
    id: product.id,
    product_type_id: product.product_type_id,
    method: ADD_PRODUCT_METHOD.CSV,
    bill_id: product.bill_id,
    product_type: product.product_type,
  };
}
