import {
  EditBillFormStoreState,
  useEditBillFormStore,
} from "@/features/bills/stores/useEditBillFormStore";
import {
  Bill,
  BillProduct,
  BillProductTypeConstraint,
} from "@/features/bills/types/bill.type";
import { FormField } from "@/features/bills/types/create-bill.type";
import { ChangeEventHandler, FocusEventHandler } from "react";

export function useEditBillForm() {
  const state = useEditBillFormStore((state) => state);

  const onStartEditFormData = useEditBillFormStore(
    (state) => state.onStartEditFormData
  );

  const onStopEditFormData = useEditBillFormStore(
    (state) => state.onStopEditFormData
  );

  const setFormData = useEditBillFormStore((state) => state.setFormData);

  function getFormData(
    field: FormField
  ): string | number | readonly string[] | undefined {
    return state[field];
  }

  const handleInputChange = (
    field: keyof EditBillFormStoreState,
    value: string
  ) => {
    setFormData(field, value);
  };

  function listenToFormEditState(): {
    onFocus?:
      | FocusEventHandler<HTMLInputElement | HTMLSelectElement>
      | undefined;
    onBlur?:
      | FocusEventHandler<HTMLInputElement | HTMLSelectElement>
      | undefined;
  } {
    return {
      onFocus: onStartEditFormData,
      onBlur: onStopEditFormData,
    };
  }

  function register(field: FormField): {
    onFocus?:
      | FocusEventHandler<HTMLInputElement | HTMLSelectElement>
      | undefined;
    onBlur?:
      | FocusEventHandler<HTMLInputElement | HTMLSelectElement>
      | undefined;
    onChange?:
      | ChangeEventHandler<HTMLInputElement | HTMLSelectElement>
      | undefined;
    value: string | number | readonly string[] | undefined;
  } {
    return {
      onFocus: onStartEditFormData,
      onBlur: onStopEditFormData,
      onChange: (e) => handleInputChange(field, e.target.value),
      value: getFormData(field),
    };
  }

  function syncFormData(bill: Bill) {
    setFormData("bill_no", bill.bill_no);
    setFormData("document_date", bill.document_date);
    setFormData("customer_fullname", bill.customer_fullname);
    setFormData("customer_email", bill.customer_email || "");
    setFormData("status", bill.status);
  }

  function syncBillProducts(products: BillProduct[]) {
    setFormData("products", products);
  }

  function syncBillProductTypeConstraints(
    productTypeConstraints: BillProductTypeConstraint[]
  ) {
    setFormData("productTypeConstraints", productTypeConstraints);
  }

  return {
    register,
    listenToFormEditState,
    syncFormData,
    syncBillProducts,
    syncBillProductTypeConstraints,
  };
}
