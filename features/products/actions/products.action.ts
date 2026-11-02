"use server";

import { Bill } from "@/features/bills/types/bill.type";
import { requireAdminSession } from "@/lib/route-auth";
import { supabaseAdminClient } from "@/lib/supabase";
import { ServerActionResponse } from "@/models/api.model";
import {
  Product,
  ProductWithProductType,
} from "@/models/product.model";
import { translateProductActionErrorMessage } from "../helpers/product-action.helper";
const PRODUCT_TABLE = "products";
const View_Product_point = "view_products_with_point";
const PRODUCT_IMPORT_ROLES = ["ADMIN", "BILL_MANAGEMENT"];

/* export async function addMultipleProductsAction(
  products: Omit<Product, "created_at" | "updated_at">[]
): Promise<ServerActionResponse<Omit<Product, "created_at" | "updated_at">[]>> {
  try {
    const { data: allProducts, error: allProductsError } =
      await supabaseAdminClient.from(PRODUCT_TABLE).select("id");

    if (allProductsError) throw new Error(allProductsError.message);

    const notDuplicatedProducts = products.filter(
      (product) => !allProducts.some((p) => p.id === product.id)
    );

    console.log("notDuplicatedProducts" ,notDuplicatedProducts.length);

    const { data: addedProducts, error: addedProductsError } =
      await supabaseAdminClient
        .from(PRODUCT_TABLE)
        .insert(notDuplicatedProducts)
        .select();

    if (addedProductsError) throw new Error(addedProductsError.message);

    return {
      data: addedProducts,
      isError: false,
      error: "",
    };
  } catch (error: any) {
    return {
      data: [],
      isError: true,
      error: translateProductActionErrorMessage(error.message),
    };
  }
}
 */


const chunkArray = <T,>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

/**
 * เพิ่มสินค้าหลายรายการ รหัสที่มีอยู่แล้วจะถูกข้าม
 * ไม่อ่านแถวกลับมาเพราะผู้เรียกไม่ได้ใช้ และจะทำให้ response ใหญ่ตามจำนวนแถว
 *
 * @param products - สินค้าที่จะเพิ่ม ควรส่งมาทีละไม่เกิน 1,000 แถว
 * @returns ผลการบันทึก
 */
export async function addMultipleProductsAction(
  products: Omit<Product, "created_at" | "updated_at">[]
): Promise<ServerActionResponse<null>> {
  try {
    await requireAdminSession(PRODUCT_IMPORT_ROLES);

    for (const chunk of chunkArray(products, 1000)) {
      const { error } = await supabaseAdminClient
        .from(PRODUCT_TABLE)
        .upsert(chunk, {
          onConflict: "id",
          ignoreDuplicates: true,
        });

      if (error) throw new Error(error.message);
    }

    return {
      data: null,
      isError: false,
      error: "",
    };
  } catch (error: any) {
    return {
      data: null,
      isError: true,
      error: translateProductActionErrorMessage(error.message),
    };
  }
}


export async function replaceMultipleProductsAction(
  products: Omit<Product, "created_at" | "updated_at">[],
  billId: Bill["id"]
): Promise<ServerActionResponse<Omit<Product, "created_at" | "updated_at">[]>> {
  try {
    // ลบสินค้าเดิมทั้งหมด
    const { data: deletedProducts, error: deleteError } =
      await supabaseAdminClient
        .from(PRODUCT_TABLE)
        .delete()
        .eq("bill_id", billId)
        .select();

    if (deleteError) throw new Error(deleteError.message);

    // เพิ่มสินค้าใหม่ทั้งหมด
    const { data: addedProducts, error: addedProductError } =
      await supabaseAdminClient.from(PRODUCT_TABLE).insert(products).select();

    if (addedProductError) {
      // เพิ่มสินค้ากลับเข้าไป
      await supabaseAdminClient.from(PRODUCT_TABLE).insert(deletedProducts);

      throw new Error(addedProductError.message);
    }

    return {
      data: addedProducts,
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.error(`[ERROR] : ล้มเหลวในการแทนที่สินค้า -> ${error.message}`);
    return {
      data: [],
      isError: true,
      error: `[ERROR] : ล้มเหลวในการแทนที่สินค้า -> ${error.message}`,
    };
  }
}

export const deleteProduct = async ({
  id,
}: {
  id: string;
}): Promise<ServerActionResponse<null>> => {
  try {
    const { error } = await supabaseAdminClient
      .from(PRODUCT_TABLE)
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);

    return {
      data: null,
      error: "",
      isError: false,
    };
  } catch (error: any) {
    console.error(`Failed to delete product -> ${error.message}`);
    return {
      data: null,
      error: `Failed to delete product: ${error.message}`,
      isError: true,
    };
  }
};

export const updateProduct = async (
  id: string,
  data: Partial<Product>
): Promise<ServerActionResponse<Product>> => {
  try {
    const { data: updatedProduct, error } = await supabaseAdminClient
      .from(PRODUCT_TABLE)
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      data: updatedProduct,
      error: "",
      isError: false,
    };
  } catch (error: any) {
    console.error(`Failed to update product -> ${error.message}`);
    return {
      data: null,
      error: `Failed to update product: ${error.message}`,
      isError: true,
    };
  }
};

export const createProduct = async (
  product: Omit<Product, "created_at" | "updated_at">
): Promise<ServerActionResponse<Product>> => {
  try {
    const { data: newProduct, error } = await supabaseAdminClient
      .from(PRODUCT_TABLE)
      .insert(product)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      data: newProduct,
      error: "",
      isError: false,
    };
  } catch (error: any) {
    console.error(`Failed to create product -> ${error.message}`);
    return {
      data: null,
      error: `Failed to create product: ${error.message}`,
      isError: true,
    };
  }
};

type ProductExistResult = {
  exists: boolean;
  point: number; // ถ้าไม่เจอ product หรือไม่มี promo -> 1
};

export async function doesProductIdExistAction(
  productId: Product["id"]
): Promise<ServerActionResponse<ProductExistResult>> {
  try {
    if (!productId)
      return {
        data: null,
        error: "กรุณาระบุรหัสสินค้า",
        isError: true,
      };

    /*     const { data: matchedProducts, error } = await supabaseAdminClient
          .from(PRODUCT_TABLE)
          .select("id")
          .eq("id", productId); */

    const { data: matchedProducts, error } = await supabaseAdminClient
      .from(View_Product_point)
      .select("product_id,point")
      .eq("product_id", productId);


    if (error) throw new Error(error.message);

    const exists = !!matchedProducts;
    const point = Number(matchedProducts[0].point ?? 1);

    return {
      data: { exists, point },
      error: "",
      isError: false,
    };
  } catch (error: any) {
    console.error(
      `[ERROR] : ล้มเหลวระหว่างการตรวจสอบข้อมูลสินค้า -> ${error.message}`
    );
    return {
      data: null,
      error: "ล้มเหลวระหว่างการตรวจสอบข้อมูลสินค้า",
      isError: true,
    };
  }
}

export async function fetchAllProductsByBillIdAction(
  billId: Bill["id"]
): Promise<ServerActionResponse<ProductWithProductType[]>> {
  try {
    const { data: products, error } = await supabaseAdminClient
      .from(PRODUCT_TABLE)
      .select(
        `
        *,
        product_type:product_type_id (
          id,
          title
        )
      `
      )
      .eq("bill_id", billId);

    if (error) throw new Error(error.message);

    console.log(`[INFO] : ดึงข้อมูลสินค้าโดย bill id เรียบร้อย`);

    return {
      data: products,
      error: "",
      isError: false,
    };
  } catch (error: any) {
    console.error(`[ERROR] : ล้มเหลวในการดึงข้อมูลสินค้า -> ${error.message}`);
    return {
      data: [],
      error: `ล้มเหลวในการดึงข้อมูลสินค้า`,
      isError: true,
    };
  }
}
