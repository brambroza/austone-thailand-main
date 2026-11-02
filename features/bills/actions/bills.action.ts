"use server";

import {
  Bill,
  BillProductTypeConstraint,
  BillSchema,
  BillWithProductAndProductTypeAndProductTypeConstraint,
} from "@/features/bills/types/bill.type";
import { resendClient } from "@/lib/resend";
import { supabaseAdminClient } from "@/lib/supabase";
import { ServerActionResponse } from "@/models/api.model";
import { ADD_PRODUCT_METHOD } from "@/models/enums/product.enum";
import { z } from "zod";
import { translateBillErrorMessage } from "../helpers/bill.helper";
import { BILL_STATUS } from "../enums/bill.enum";

const BILL_TABLE_NAME = "bills";
const BILL_PRODUCT_TYPE_CONSTRAINT_TABLE_NAME = "bill_product_type_constraints";

export const getBills = async (): Promise<ServerActionResponse<Bill[]>> => {
  try {
    // const currentUser = await getLineUser();

    // if (!currentUser)
    //   return {
    //     data: null,
    //     isError: true,
    //     error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ",
    //   };

    // await preventUnauthorizedUser(currentUser);

    const { data, error } = await supabaseAdminClient
      .from(BILL_TABLE_NAME)
      .select("*");

    if (error) throw new Error(error.message);

    return {
      data,
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.error(`[ERROR] : ล้มเหลวในการดึงข้อมูลบิล -> ${error.message}`);
    return {
      data: null,
      isError: true,
      error: "ล้มเหลวในการดึงข้อมูลบิล",
    };
  }
};

export async function getBillsWithProductsAndProductTypesAndProductTypeConstraints_bakcup(): Promise<
  ServerActionResponse<BillWithProductAndProductTypeAndProductTypeConstraint[]>
> {
  try {
    const { data: bills, error: billsError } = await supabaseAdminClient
      .from(BILL_TABLE_NAME)
      .select("*");


    if (billsError) throw new Error(billsError.message);

    const { data: products, error: productsError } = await supabaseAdminClient
      .from("products")
      .select(
        `
        *,
          product_type:product_types!product_type_id (
          id,
          title
        )
      `
      )
      .in(
        "bill_id",
        bills.map((bill) => bill.id)
      );
  
    if (productsError) throw new Error(productsError.message);

    const { data: productTypeConstraints, error: productTypeConstraintsError } =
      await supabaseAdminClient
        .from(BILL_PRODUCT_TYPE_CONSTRAINT_TABLE_NAME)
        .select("*, product_type:product_type_id(*)")
        .in(
          "bill_id",
          bills.map((bill) => bill.id)
        );

    if (productTypeConstraintsError)
      throw new Error(productTypeConstraintsError.message);

    console.log(`[INFO] : ดึงข้อมูลบิลร่วมกับสินค้าเรียบร้อย`);

    return {
      data: bills.map((bill) => ({
        ...bill,
        products: products.filter((product) => product.bill_id === bill.id),
        productTypeConstraints: productTypeConstraints.filter(
          (productTypeConstraint) => productTypeConstraint.bill_id === bill.id
        ),
      })),
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.error(
      `[ERROR] : ล้มเหลวในการดึงข้อมูลบิลร่วมกับสินค้า -> ${error.message}`
    );
    return {
      data: null,
      isError: true,
      error: "ล้มเหลวในการดึงข้อมูลบิลร่วมกับสินค้า",
    };
  }
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export async function getBillsWithProductsAndProductTypesAndProductTypeConstraints(): Promise<
  ServerActionResponse<BillWithProductAndProductTypeAndProductTypeConstraint[]>
> {
  try {
    const { data: bills, error: billsError } = await supabaseAdminClient
      .from(BILL_TABLE_NAME)
      .select("*");

    if (billsError) throw new Error(billsError.message);

    const safeBills = bills ?? [];
    const billIds = safeBills.map((bill) => bill.id);

    if (billIds.length === 0) {
      return {
        data: [],
        isError: false,
        error: "",
      };
    }

    const chunks = chunkArray(billIds, 200);

    const productsResults = await Promise.all(
      chunks.map(async (ids) => {
        const { data, error } = await supabaseAdminClient
          .from("products")
          .select(`
            *,
            product_type:product_types!product_type_id (
              id,
              title
            )
          `)
          .in("bill_id", ids);

        if (error) throw new Error(error.message);
        return data ?? [];
      })
    );

    const productTypeConstraintResults = await Promise.all(
      chunks.map(async (ids) => {
        const { data, error } = await supabaseAdminClient
          .from(BILL_PRODUCT_TYPE_CONSTRAINT_TABLE_NAME)
          .select(`
            *,
            product_type:product_types!product_type_id (
              id,
              title
            )
          `)
          .in("bill_id", ids);

        if (error) throw new Error(error.message);
        return data ?? [];
      })
    );

    const products = productsResults.flat();
    const productTypeConstraints = productTypeConstraintResults.flat();

    return {
      data: safeBills.map((bill) => ({
        ...bill,
        products: products.filter((product) => product.bill_id === bill.id),
        productTypeConstraints: productTypeConstraints.filter(
          (item) => item.bill_id === bill.id
        ),
      })),
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.error(
      `[ERROR] : ล้มเหลวในการดึงข้อมูลบิลร่วมกับสินค้า -> ${error.message}`
    );

    return {
      data: null,
      isError: true,
      error: error.message || "ล้มเหลวในการดึงข้อมูลบิลร่วมกับสินค้า",
    };
  }
}




const CreateBillInfoActionInputSchema = BillSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

type CreateBillInfoActionInput = z.infer<
  typeof CreateBillInfoActionInputSchema
> & { products?: BillProductTypeConstraint[] };

export const createBillInfoAction = async (
  billInfo: CreateBillInfoActionInput
): Promise<ServerActionResponse<Bill>> => {
  try {
    const { data, error } = await supabaseAdminClient
      .from(BILL_TABLE_NAME)
      .insert(billInfo)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      data,
      error: "",
      isError: false,
    };
  } catch (error: any) {
    console.error(
      `ล้มเหลวในการสร้างบิล -> ${translateBillErrorMessage(error.message)}`
    );
    return {
      data: null,
      error: translateBillErrorMessage(error.message),
      isError: true,
    };
  }
};

const UpdateBillInfoActionInputSchema = BillSchema.partial().omit({
  created_at: true,
  updated_at: true,
  products: true,
});

type UpdateBillInfoActionInput = z.infer<
  typeof UpdateBillInfoActionInputSchema
> & { products?: BillProductTypeConstraint[] };

export const updateBill = async (
  billInfo: UpdateBillInfoActionInput
): Promise<ServerActionResponse<Bill>> => {
  try {
    const now = new Date();
    const { data, error } = await supabaseAdminClient
      .from(BILL_TABLE_NAME)
      .update({
        ...billInfo,
        updated_at: now,
      })
      .eq("id", billInfo.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      data,
      error: "",
      isError: false,
    };
  } catch (error: any) {
    console.error(`ล้มเหลวในการอัพเดตข้อมูลบิล -> ${error.message}`);
    return {
      data: null,
      error: error.message,
      isError: true,
    };
  }
};

const DeleteBillActionInputSchema = BillSchema.pick({ id: true });

type DeleteBillActionInput = z.infer<typeof DeleteBillActionInputSchema>;

export const deleteBill = async (
  id: DeleteBillActionInput["id"]
): Promise<ServerActionResponse<boolean>> => {
  try {
    const { error } = await supabaseAdminClient
      .from(BILL_TABLE_NAME)
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);

    return {
      data: true,
      error: "",
      isError: false,
    };
  } catch (error: any) {
    console.error(`Failed to delete bill -> ${error.message}`);
    return {
      data: false,
      error: "Failed to delete bill",
      isError: true,
    };
  }
};

export async function replaceBillProductTypeConstraints(
  billId: Bill["id"],
  productTypeConstraints: BillProductTypeConstraint[]
) {
  try {
    const existingProductTypeConstraints = productTypeConstraints.filter(
      (ptc) => Boolean(ptc.id)
    );

    const newProductTypeConstraints = productTypeConstraints.filter(
      (ptc) => !Boolean(ptc.id)
    );

    const { error } = await supabaseAdminClient
      .from(BILL_PRODUCT_TYPE_CONSTRAINT_TABLE_NAME)
      .delete()
      .eq("bill_id", billId);

    if (error) throw new Error(error.message);

    const { error: insertExistingProductTypeConstraintsError } =
      await supabaseAdminClient
        .from(BILL_PRODUCT_TYPE_CONSTRAINT_TABLE_NAME)
        .insert(
          existingProductTypeConstraints.map((ptc) => ({
            bill_id: billId,
            product_type_id: ptc.product_type_id,
            amount: ptc.amount,
            created_at: new Date().toISOString(),
            id: ptc.id,
          }))
        );

    if (insertExistingProductTypeConstraintsError)
      throw new Error(insertExistingProductTypeConstraintsError.message);

    const { error: insertNewProductTypeConstraintsError } =
      await supabaseAdminClient
        .from(BILL_PRODUCT_TYPE_CONSTRAINT_TABLE_NAME)
        .insert(
          newProductTypeConstraints.map((ptc) => ({
            bill_id: billId,
            product_type_id: ptc.product_type_id,
            amount: ptc.amount,
            created_at: new Date().toISOString(),
          }))
        );

    if (insertNewProductTypeConstraintsError)
      throw new Error(insertNewProductTypeConstraintsError.message);

    return {
      data: null,
      error: "",
      isError: false,
    };
  } catch (error: any) {
    console.error(
      `[ERROR] : ล้มเหลวในการแทนที่ข้อมูลประเภทสินค้า -> ${error.message}`
    );
    throw new Error(`ล้มเหลวในการแทนที่ข้อมูลประเภทสินค้า`);
  }
}

export async function getBillById(
  id: string
): Promise<ServerActionResponse<Bill>> {
  try {
    const { data: bill, error: billError } = await supabaseAdminClient
      .from(BILL_TABLE_NAME)
      .select("*")
      .eq("id", id)
      .single();

    if (billError) throw new Error(billError.message);

    if (!bill)
      return {
        data: null,
        isError: true,
        error: "ไม่พบข้อมูลบิล",
      };

    const { data: products, error: productsError } = await supabaseAdminClient
      .from("products")
      .select(
        `
        id,
        product_type:product_type_id (
          id,
          title
        )
      `
      )
      .eq("bill_id", id);

    if (productsError) throw new Error(productsError.message);

    const { data: productTypeConstraints, error: productTypeConstraintsError } =
      await supabaseAdminClient
        .from(BILL_PRODUCT_TYPE_CONSTRAINT_TABLE_NAME)
        .select("*, product_type:product_type_id(*)")
        .eq("bill_id", id);

    if (productTypeConstraintsError)
      throw new Error(productTypeConstraintsError.message);

    return {
      data: {
        ...bill,
        products:
          products?.map((product: any) => ({
            id: product.id,
            product_type: product.product_type,
            bill_id: id,
            method: ADD_PRODUCT_METHOD.CREATE_BILL,
          })) || [],
        product_type_constraints:
          productTypeConstraints?.map((productTypeConstraint: any) => ({
            id: productTypeConstraint.id,
            product_type: productTypeConstraint.product_type,
            bill_id: id,
            amount: productTypeConstraint.amount,
            product_type_id: productTypeConstraint.product_type_id,
          })) || [],
      },
      error: "",
      isError: false,
    };
  } catch (error: any) {
    console.error(`[ERROR] : ล้มเหลวในการดึงข้อมูลบิล-> ${error.message}`);
    return {
      data: null,
      error: error.message,
      isError: true,
    };
  }
}

export async function sendBillPdfToUserEmail(
  billId: Bill["id"],
  pdfFile: Buffer<ArrayBufferLike>
): Promise<ServerActionResponse<boolean>> {
  try {
    const { data: billInfo, error: billInfoError } = await supabaseAdminClient
      .from(BILL_TABLE_NAME)
      .select("*")
      .eq("id", billId)
      .single();

    if (billInfoError) throw new Error(billInfoError.message);

    if (!billInfo) {
      return {
        data: false,
        error: "ไม่พบข้อมูลบิล",
        isError: true,
      };
    }

    if (!billInfo.customer_email) {
      return {
        data: false,
        error: "บิลนี้ไม่มีอีเมลลูกค้า",
        isError: true,
      };
    }

    const { error: didSendEmailError } = await resendClient.emails.send({
      from: "no-reply@austonethailands.app",
      to: [billInfo.customer_email],
      subject: `File PDF หมายเลขบิล ${billInfo.bill_no}`,
      html: `<h1>ไฟล์ PDF ของบิลหมายเลข ${billInfo.bill_no}</h1>`,
      attachments: [
        {
          filename: `${billInfo.bill_no}.pdf`,
          content: pdfFile,
        },
      ],
    });

    if (didSendEmailError) throw new Error(didSendEmailError.message);

    console.log(`[INFO] : ส่งบิล PDF ไปยังอีเมลสำเร็จ`);

    return {
      data: true,
      error: "",
      isError: false,
    };
  } catch (error: any) {
    console.error(
      `[ERROR] : ล้มเหลวในการส่งบิล PDF ไปยังอีเมล -> ${error.message}`
    );
    return {
      data: false,
      error: "ล้มเหลวระหว่างส่ง pdf บิลไปยังอีเมล",
      isError: true,
    };
  }
}

export async function updateBillStatus(
  billId: Bill["id"],
  status: BILL_STATUS
): Promise<ServerActionResponse<Bill>> {
  try {
    const { data: updatedBill, error } = await supabaseAdminClient
      .from(BILL_TABLE_NAME)
      .update({ status })
      .eq("id", billId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      data: updatedBill,
      error: "",
      isError: false,
    };
  } catch (error: any) {
    console.error(`[ERROR] : ล้มเหลวในการอัพเดตสถานะบิล -> ${error.message}`);
    return {
      data: null,
      error: error.message,
      isError: true,
    };
  }
}
