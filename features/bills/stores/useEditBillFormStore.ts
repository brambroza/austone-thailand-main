import { ProductType } from "@/features/products/types/product.type";
import { create } from "zustand";
import { BillProduct, BillProductTypeConstraint } from "../types/bill.type";
import { BILL_STATUS } from "../enums/bill.enum";

export type EditBillFormStoreState = {
  bill_no: string;
  document_date: string;
  customer_fullname: string;
  customer_email: string;
  products: BillProduct[];
  productTypeConstraints: BillProductTypeConstraint[];
  isEditingProductId: boolean;
  isEditingFormData: boolean;
  currentSelectedProductTypeConstraintId: ProductType["id"] | null;
  status: BILL_STATUS;
};

export type StoreActions = {
  setFormData: <T extends keyof EditBillFormStoreState>(
    field: T,
    value: EditBillFormStoreState[T]
  ) => void;
  addProduct: (product: BillProduct) => void;
  addProductTypeConstraint: (
    productTypeConstraint: BillProductTypeConstraint
  ) => void;
  removeProductTypeConstraint: (
    productTypeConstraintId: ProductType["id"]
  ) => void;
  removeProduct: (productId: string) => void;
  editProductId: (productId: string, id: string) => void;
  onStartEditProductId: () => void;
  onStopEditProductId: () => void;
  onStartEditFormData: () => void;
  onStopEditFormData: () => void;
  onSelectProductTypeConstraint: (
    productTypeConstraintId: ProductType["id"]
  ) => void;
  onEditProductTypeConstraint: (
    productTypeConstraintId: ProductType["id"],
    productTypeConstraint: BillProductTypeConstraint
  ) => void;
  deleteProductTypeConstraint: (
    productTypeConstraintId: ProductType["id"]
  ) => void;
  reset: () => void;
};

const initialFormData: EditBillFormStoreState = {
  bill_no: "",
  document_date: "",
  customer_fullname: "",
  customer_email: "",
  products: [],
  productTypeConstraints: [],
  isEditingProductId: false,
  isEditingFormData: false,
  currentSelectedProductTypeConstraintId: null,
  status: BILL_STATUS.WAIT_FOR_SCAN,
};

type Store = EditBillFormStoreState & StoreActions;

export const useEditBillFormStore = create<Store>((set) => ({
  ...initialFormData,

  setFormData: (field, value) =>
    set((state) => ({
      [field]: value,
    })),

  setProducts: (products: BillProduct[]) =>
    set((state) => ({
      products,
    })),

  addProduct: (product) =>
    set((state) => ({
      products: [...state.products, product],
    })),

  removeProduct: (productId) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== productId),
    })),

  editProductId: (productId, id) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId ? { ...p, id } : p
      ),
    })),

  onStartEditProductId: () =>
    set((state) => ({
      isEditingProductId: true,
    })),

  onStopEditProductId: () =>
    set((state) => ({
      isEditingProductId: false,
    })),

  onStartEditFormData: () =>
    set((state) => ({
      isEditingFormData: true,
    })),

  onStopEditFormData: () =>
    set((state) => ({
      isEditingFormData: false,
    })),

  onSelectProductTypeConstraint: (productTypeConstraintId) =>
    set((state) => ({
      currentSelectedProductTypeConstraintId:
        state.currentSelectedProductTypeConstraintId === productTypeConstraintId
          ? null
          : productTypeConstraintId,
    })),

  addProductTypeConstraint: (productTypeConstraint) =>
    set((state) => ({
      productTypeConstraints: [
        ...state.productTypeConstraints,
        productTypeConstraint,
      ],
    })),

  removeProductTypeConstraint: (productTypeConstraintId) =>
    set((state) => ({
      productTypeConstraints: state.productTypeConstraints.filter(
        (p) => p.product_type.id !== productTypeConstraintId
      ),
    })),

  onEditProductTypeConstraint: (
    productTypeConstraintId,
    productTypeConstraint
  ) =>
    set((state) => ({
      productTypeConstraints: state.productTypeConstraints.map((p) =>
        p.product_type.id === productTypeConstraintId
          ? productTypeConstraint
          : p
      ),
    })),

  deleteProductTypeConstraint: (productTypeConstraintId) =>
    set((state) => ({
      productTypeConstraints: state.productTypeConstraints.filter(
        (p) => p.product_type.id !== productTypeConstraintId
      ),
    })),
  reset: () =>
    set({
      ...initialFormData,
    }),
}));
