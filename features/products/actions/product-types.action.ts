"use server";

import { requireAdminSession } from "@/lib/route-auth";
import { supabaseAdminClient } from "@/lib/supabase";
import { ServerActionResponse } from "@/models/api.model";
import {
  ProductType,
  ProductTypePromotion,
  ProductTypeSchema,
} from "../types/product.type";

const PRODUCT_TYPE_TABLE = "product_types";
const PRODUCT_TYPE_PROMOTION_TABLE = "product_types_promotions";
// ทีมงานที่เข้าหน้าจัดการสินค้าได้
const PRODUCT_TYPE_EDIT_ROLES = ["ADMIN", "BILL_MANAGEMENT"];


export async function getAllProductTypesAction(): Promise<
  ServerActionResponse<ProductType[]>
> {
  try {
    const { data: productTypes, error } = await supabaseAdminClient
      .from(PRODUCT_TYPE_TABLE)
      .select("*")
      .order("id", { ascending: true });

    if (error) throw new Error(error.message);

    console.log(
      `[SUCCESS] : ดึงข้อมูลประเภทสินค้าทั้งหมดสำเร็จ ${new Date().toISOString()}`
    );

    console.log(productTypes);

    return {
      data: productTypes,
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.log(
      `[ERROR] : ดึงข้อมูลประเภทสินค้าทั้งหมดลองใหม่อีกครั้ง ${new Date().toISOString()}`
    );
    return {
      data: [],
      isError: true,
      error: error.message,
    };
  }
}



export async function getAllProductTypesPromotionsAction(): Promise<
  ServerActionResponse<ProductTypePromotion[]>
> {
  try {
    const { data: productTypespromotion, error } = await supabaseAdminClient
      .from(PRODUCT_TYPE_PROMOTION_TABLE)
      .select("*")
      .order("id", { ascending: true });

    if (error) throw new Error(error.message);

    console.log(
      `[SUCCESS] : ดึงข้อมูลประเภทสินค้าทั้งหมดสำเร็จ ${new Date().toISOString()}`
    );

    console.log(productTypespromotion);

    return {
      data: productTypespromotion,
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.log(
      `[ERROR] : ดึงข้อมูลประเภทสินค้าทั้งหมดลองใหม่อีกครั้ง ${new Date().toISOString()}`
    );
    return {
      data: [],
      isError: true,
      error: error.message,
    };
  }
}


export const createProductType = async (
  productType: Omit<ProductType, "id">
): Promise<ServerActionResponse<ProductType>> => {
  try {
    await requireAdminSession(PRODUCT_TYPE_EDIT_ROLES);

    const input = ProductTypeSchema.omit({ id: true }).parse(productType);

    const { data, error } = await supabaseAdminClient
      .from(PRODUCT_TYPE_TABLE)
      .insert({
        title: input.title.trim(),
        can_collect_points: input.can_collect_points ?? true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      data,
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.error(`Failed to create product type -> ${error.message}`);
    return {
      data: null,
      isError: true,
      error: error.message,
    };
  }
};

export const updateProductType = async (
  productType: ProductType
): Promise<ServerActionResponse<ProductType>> => {
  try {
    await requireAdminSession(PRODUCT_TYPE_EDIT_ROLES);

    const input = ProductTypeSchema.parse(productType);

    const { data, error } = await supabaseAdminClient
      .from(PRODUCT_TYPE_TABLE)
      .update({
        title: input.title.trim(),
        // ไม่ส่งค่ามา = ไม่เปลี่ยนการตั้งค่าเดิม
        ...(input.can_collect_points === undefined
          ? {}
          : { can_collect_points: input.can_collect_points }),
      })
      .eq("id", input.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return {
      data,
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.error(`Failed to update product type -> ${error.message}`);
    return {
      data: null,
      isError: true,
      error: error.message,
    };
  }
};

export const deleteProductType = async (
  productTypeId: ProductType["id"]
): Promise<ServerActionResponse<null>> => {
  try {
    // Check if there are any products using this product type
    const { count, error: countError } = await supabaseAdminClient
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("product_type_id", productTypeId);

    if (countError) throw new Error(countError.message);

    if (count && count > 0) {
      throw new Error("ไม่สามารถลบประเภทสินค้าที่มีสินค้าผูกอยู่ได้");
    }

    const { error } = await supabaseAdminClient
      .from(PRODUCT_TYPE_TABLE)
      .delete()
      .eq("id", productTypeId);

    if (error) throw new Error(error.message);

    return {
      data: null,
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.error(`Failed to delete product type -> ${error.message}`);
    return {
      data: null,
      isError: true,
      error: error.message,
    };
  }
};


export const upsertProductTypePromotions = async (input: {
  productTypeId: number;
  promotions: Array<Omit<ProductTypePromotion, "product_type_id"> & Partial<Pick<ProductTypePromotion, "id">>>;
  updatedByUserId?: string | null;
  syncMissing?: boolean; // ✅ ถ้า true จะลบรายการที่ไม่ถูกส่งมา
}): Promise<ServerActionResponse<ProductTypePromotion[]>> => {
  try {
    const {
      productTypeId,
      promotions,
      updatedByUserId = null,
      syncMissing = false,
    } = input;


    // กัน input ว่าง/ผิด
    if (!productTypeId) {
      throw new Error("productTypeId is required");
    }

    const list = Array.isArray(promotions) ? promotions : [];

    // ✅ dedupe แบบไม่ใช้ Map (ไม่ชน ts target) — key ตาม (startdate|enddate) หรือ id ถ้ามี
    const uniq: Record<string, any> = {};
    for (const p of list) {
      if (!p) continue;

      const key =
        (p.id && `id:${p.id}`) ||
        `range:${String(p.startdate ?? "")}|${String(p.enddate ?? "")}`; // ✅ ปรับ key ตาม logic ของคุณได้

      uniq[key] = {
        ...p,
        product_type_id: productTypeId,
        updated_by_user_id: p.updated_by_user_id ?? updatedByUserId,
      };
    }

    const finalList = Object.values(uniq) as ProductTypePromotion[];



    const { data: upserted, error: upsertError } = await supabaseAdminClient
      .from(PRODUCT_TYPE_PROMOTION_TABLE)
      .upsert(finalList, {
        onConflict: "product_type_id,startdate,enddate", // ✅ แก้ให้ตรง unique key ของคุณ
      })
      .select();

    if (upsertError) throw new Error(upsertError.message);

    // ✅ Sync delete (optional): ลบรายการใน DB ที่ไม่ได้ส่งมา
    if (syncMissing) {
      // ถ้าคุณใช้ id เป็นตัวชี้ ให้ลบโดยใช้ id not in
      const keepIds = finalList.map((x) => x.id).filter(Boolean) as string[];

      // ถ้าไม่มี id เลย แนะนำ "ไม่ sync delete" เพราะจะเสี่ยงลบผิด
      if (keepIds.length) {
        const { error: delError } = await supabaseAdminClient
          .from(PRODUCT_TYPE_PROMOTION_TABLE)
          .delete()
          .eq("product_type_id", productTypeId)
          .not("id", "in", `(${keepIds.map((x) => `"${x}"`).join(",")})`);

        if (delError) throw new Error(delError.message);
      }
    }

    return {
      data: upserted ?? [],
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.error(`Failed to upsert product type promotions -> ${error.message}`);
    return {
      data: null,
      isError: true,
      error: error.message,
    };
  }
};