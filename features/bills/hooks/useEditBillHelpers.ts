import { Alert } from "@/components/ui/alert-message-dialog";
import { replaceMultipleProductsAction } from "@/features/products/actions/products.action";
import { ProductType } from "@/features/products/types/product.type";
import { ADD_PRODUCT_METHOD } from "@/models/enums/product.enum";
import { Product } from "@/models/product.model";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  replaceBillProductTypeConstraints,
  updateBill,
} from "../actions/bills.action";
import { useEditBillFormStore } from "../stores/useEditBillFormStore";
import { Bill, BillSchema } from "../types/bill.type";

export function useEditBillHelpers(billId: Bill["id"]) {
  const [isUpdatingBill, setIsUpdatingBill] = useState<boolean>(false);

  const productTypeConstraints = useEditBillFormStore(
    (state) => state.productTypeConstraints
  );

  const currentSelectedProductTypeConstraintId = useEditBillFormStore(
    (state) => state.currentSelectedProductTypeConstraintId
  );

  const router = useRouter();

  const formState = useEditBillFormStore((state) => state);

  const products = useEditBillFormStore((state) => state.products);

  function handleGetProductTypeConstraintById(
    productTypeConstraintId: ProductType["id"]
  ) {
    return productTypeConstraints.find(
      (p) => p.product_type?.id === productTypeConstraintId
    );
  }

  function validateCurrentProductTypeConstraintLimit() {
    if (!currentSelectedProductTypeConstraintId) return;

    const productConstraint = handleGetProductTypeConstraintById(
      currentSelectedProductTypeConstraintId
    );

    if (!productConstraint) return;

    const realProductConstraintAmount = products.filter(
      (p) => p.product_type_id === currentSelectedProductTypeConstraintId
    ).length;

    if (realProductConstraintAmount > productConstraint.amount - 1)
      throw new Error(
        `สินค้าประเภท ${productConstraint.product_type.title} เกินจำนวนที่กำหนด`
      );
  }

  function checkIfProductAmountNotMatchedWithProductTypeConstraints(): {
    isValid: boolean;
    message: string;
  } {
    productTypeConstraints.forEach((p) => {
      const realProductAmount = products.filter(
        (product) => product.product_type_id === p.product_type.id
      ).length;

      if (realProductAmount < p.amount)
        return {
          isValid: false,
          message: `จำนวนสินค้าประเภท ${
            p.product_type.title
          } ไม่ครบ ต้องเพิ่มอีก ${p.amount - realProductAmount} ชิ้น`,
        };

      if (realProductAmount > p.amount)
        return {
          isValid: false,
          message: `จำนวนสินค้าประเภท ${
            p.product_type.title
          } เกินจำนวนที่กำหนด ต้องลบออก ${realProductAmount - p.amount} ชิ้น`,
        };
    });

    return {
      isValid: true,
      message: "",
    };
  }

  function getRequiredProductAmount() {
    return productTypeConstraints.reduce((acc, curr) => acc + curr.amount, 0);
  }

  function validateBillInfo(): { isValid: boolean; message: string } {
    const validationResult = BillSchema.omit({ id: true }).safeParse(formState);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0].message;
      const errorKey = validationResult.error.errors[0].path[0];

      console.log(errorKey, errorMessage);

      return {
        isValid: false,
        message: `${errorMessage}`,
      };
    }

    if (formState.productTypeConstraints.length <= 0)
      return {
        isValid: false,
        message: "กรุณากรอกประเภทยาง",
      };

    return { isValid: true, message: "" };
  }

  async function handleUpdateBillInfo(): Promise<{
    isValid: boolean;
    message: string;
    data: Bill | null;
  }> {
    const { data: updatedBill, error: updateBillError } = await updateBill({
      bill_no: formState.bill_no,
      customer_fullname: formState.customer_fullname,
      customer_email: formState.customer_email,
      document_date: formState.document_date,
      id: billId,
      status: formState.status,
    });

    if (updateBillError) {
      return {
        isValid: false,
        message: updateBillError,
        data: null,
      };
    }

    if (!updatedBill) {
      return {
        isValid: false,
        message: "ไม่สามารถบันยทึกบิลได้",
        data: null,
      };
    }

    return {
      isValid: true,
      message: "",
      data: updatedBill,
    };
  }

  async function handleReplaceProductsToBill(
    createdBill: Bill
  ): Promise<{ isSuccess: boolean; message: string }> {
    const { error: addProductsError } = await replaceMultipleProductsAction(
      formState.products.map((product) => {
        return {
          id: product.id,
          product_type_id: product.product_type.id,
          method: ADD_PRODUCT_METHOD.CREATE_BILL,
          updated_by_user_id: null,
          bill_id: createdBill?.id?.toString() || null,
        } satisfies Omit<Product, "created_at" | "updated_at">;
      }),
      createdBill.id
    );

    if (addProductsError) {
      return { isSuccess: false, message: addProductsError };
    }

    return { isSuccess: true, message: "" };
  }

  const handleUpdateBill = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setIsUpdatingBill(true);

      const { isValid: isProductAmountValid, message: productAmountMessage } =
        checkIfProductAmountNotMatchedWithProductTypeConstraints();

      if (!isProductAmountValid) {
        Alert.error(productAmountMessage);
        return;
      }

      const {
        isValid: isUpdateBillValid,
        message: updateBillMessage,
        data: updatedBill,
      } = await handleUpdateBillInfo();

      if (!isUpdateBillValid) {
        Alert.error(updateBillMessage);
        return;
      }

      if (!updatedBill) {
        Alert.error("ไม่สามารถสร้างบิลได้");
        return;
      }

      const { isSuccess, message: addProductsMessage } =
        await handleReplaceProductsToBill(updatedBill);

      if (!isSuccess) {
        Alert.error(`ล้มเหลวในการเพิ่มสินค้าไปยังบิล -> ${addProductsMessage}`);
        return;
      }

      const {
        isError: isReplaceBillProductTypeConstraintsError,
        error: replaceBillProductTypeConstraintsError,
      } = await replaceBillProductTypeConstraints(
        updatedBill.id,
        formState.productTypeConstraints
      );

      if (isReplaceBillProductTypeConstraintsError) {
        Alert.error(replaceBillProductTypeConstraintsError);
        return;
      }

      Alert.success("สำเร็จ");

      router.push(`/admin/bills`);
    } catch (error: any) {
      Alert.error("ล้มเหลวในการบันทึกข้อมูลบิล");
    } finally {
      setIsUpdatingBill(false);
    }
  };

  return {
    handleGetProductTypeConstraintById,
    validateCurrentProductTypeConstraintLimit,
    checkIfProductAmountNotMatchedWithProductTypeConstraints,
    getRequiredProductAmount,
    validateBillInfo,
    handleUpdateBill,
    isUpdatingBill,
  };
}
