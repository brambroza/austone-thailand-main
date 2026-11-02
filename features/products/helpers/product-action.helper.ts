export function translateProductActionErrorMessage(errorMessage: string) {
  switch (errorMessage) {
    case `duplicate key value violates unique constraint "products_pkey"`:
      return "มีสินค้ามี id ซ้ำ";
    default:
      return errorMessage;
  }
}
