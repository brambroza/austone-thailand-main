"use server";

import {
  NOT_COLLECTABLE_MESSAGE,
  findNotCollectableProductIds,
} from "@/features/products/helpers/product-point-eligibility";
import { requireAdminSession } from "@/lib/route-auth";
import { supabaseAdminClient } from "@/lib/supabase";
import { getFutureDate, getThaiDatetime } from "@/lib/utils/date.util";
import { ServerActionResponse } from "@/models/api.model";
import { WithProductScoreOption } from "@/models/product-score-option.model";
import {
  GetScannedBarcodeHistoriesByUserIdParams,
  ScannedBarcode,
} from "@/models/scanned-barcodes.model";
import { User, WithUser } from "@/models/user.model";

const TABLE_NAME = "scanned_barcodes";
const EXPIRED_DATE_YEARS = 2;

export const isBarcodeAlreadyScannedAction = async ({
  product_id,
}: Pick<ScannedBarcode, "product_id">): Promise<
  ServerActionResponse<boolean>
> => {
  try {
    const { data, error } = await supabaseAdminClient
      .from(TABLE_NAME)
      .select("*")
      .eq("product_id", product_id);

    if (error) throw new Error(error.message);

    return { data: data.length > 0, isError: false, error: "" };
  } catch (error: any) {
    return { data: false, isError: true, error: error.message };
  }
};

export const insertScannedBarcodes = async (
  scannedBarcodes: Partial<Omit<ScannedBarcode, "id" | "created_date">>[]
): Promise<ServerActionResponse<null>> => {
  // ตรวจซ้ำฝั่ง server เพราะหน้าลูกค้าเรียก action นี้ตรงได้โดยไม่ผ่านการสแกน
  try {
    const notCollectable = await findNotCollectableProductIds(
      scannedBarcodes.map((sb) => sb.product_id ?? "")
    );

    if (notCollectable.length > 0) {
      return {
        data: null,
        isError: true,
        error: `${NOT_COLLECTABLE_MESSAGE}: ${notCollectable.join(", ")}`,
      };
    }
  } catch (error: any) {
    console.error(
      `[ERROR] : ล้มเหลวระหว่างตรวจสิทธิ์สะสมแต้มของสินค้า -> ${error.message}`
    );
    return {
      data: null,
      isError: true,
      error: "ล้มเหลวระหว่างการเก็บคะแนน user",
    };
  }

  const expiredDate = getFutureDate(EXPIRED_DATE_YEARS);

  const { error } = await supabaseAdminClient.from(TABLE_NAME).insert(
    scannedBarcodes.map((sb) => ({
      ...sb,
      expired_date: expiredDate,
      created_date: getThaiDatetime(new Date()).toISOString(),
    }))
  );

  if (error) {
    console.error(
      `[ERROR] : ล้มเหลวระหว่างการเก็บคะแนน user -> ${error.message}`
    );
    switch (error.message) {
      case `duplicate key value violates unique constraint "scanned_barcodes_product_id_key"`:
        return {
          data: null,
          isError: true,
          error: "บาร์โค้ดนี้ถูกใช้ไปแล้ว",
        };
      default:
        return {
          data: null,
          isError: true,
          error: "ล้มเหลวระหว่างการเก็บคะแนน user",
        };
    }
  }

  return { data: null, isError: false, error: "" };
};

export const subtractUserScore = async ({
  user_id,
  to_subtract,
}: Pick<User, "user_id"> & { to_subtract: number }): Promise<
  ServerActionResponse<null>
> => {
  try {
    // แต้มที่เก่าที่สุดตามจำนวนที่ต้องการหัก
    const { data: toSubtractIds, error: toSubtractIdsError } =
      await supabaseAdminClient
        .from(TABLE_NAME)
        .select("id")
        .eq("user_id", user_id)
        .gte("expired_date", new Date().toISOString())
        .is("used_at", null)
        .range(0, to_subtract - 1);

    if (toSubtractIdsError) throw new Error(toSubtractIdsError.message);

    // ลบแต้มที่เก่าที่สุดตามจำนวนที่ต้องการหัก
    const { data: deletedScannedBarcodes, error: deleteError } =
      await supabaseAdminClient
        .from(TABLE_NAME)
        .update({ used_at: new Date().toISOString() })
        .in(
          "id",
          toSubtractIds.map((sb) => sb.id)
        )
        .select();

    if (deleteError) throw new Error(deleteError.message);

    return {
      data: null,
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.error(`ล้มเหลวระหว่างการหักแต้มสะสม -> ${error.message}`);
    return {
      data: null,
      isError: true,
      error: error.message,
    };
  }
};

// รองรับ คะแนน มากกว่าหนึ่งแต้มในบาร์โค้ดเดียว
export const subtractUserScoreNew = async ({
  user_id,
  to_subtract,
}: Pick<User, "user_id"> & { to_subtract: number }): Promise<
  ServerActionResponse<null>
> => {
  try {
    // 🟡 1. ดึงข้อมูลแต้มจาก view ที่รวมคะแนนจริงแล้ว
    const { data: unspent, error: unspentError } = await supabaseAdminClient
      .from("scanned_barcodes_with_score")
      .select("id, expired_date, actual_score")
      .eq("user_id", user_id)
      .is("used_at", null)
      .gte("expired_date", new Date().toISOString())
      .order("expired_date", { ascending: true });

    if (unspentError) throw new Error(unspentError.message);
    if (!unspent || unspent.length === 0)
      throw new Error("ไม่พบแต้มที่สามารถหักได้");

    // 🟡 2. สะสมแต้มจนถึงยอดที่ต้องการหัก (to_subtract)
    let sum = 0;
    const idsToUse: string[] = [];
    for (const item of unspent) {
      const points = item.actual_score ?? 0;
      if (sum >= to_subtract) break;
      idsToUse.push(item.id);
      sum += points;
    }

    if (sum < to_subtract)
      throw new Error("แต้มคงเหลือไม่เพียงพอสำหรับการหักครั้งนี้");

    // 🟡 3. อัปเดตแถวที่ถูกใช้แต้ม (mark used)
    const { error: updateError } = await supabaseAdminClient
      .from("scanned_barcodes")
      .update({ used_at: new Date().toISOString() })
      .in("id", idsToUse);

    if (updateError) throw new Error(updateError.message);

    // ✅ สำเร็จ
    return {
      data: null,
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.error(`ล้มเหลวระหว่างการหักแต้มสะสม -> ${error.message}`);
    return {
      data: null,
      isError: true,
      error: error.message,
    };
  }
};


/**
 * คืนแต้มสะสมให้ผู้ใช้ โดยการยกเลิกสถานะ "ถูกใช้แล้ว" (used_at) ของบาร์โค้ดที่เคยถูกหักไป
 *
 * ระบบแต้มไม่ได้เก็บความสัมพันธ์ระหว่างการแลกรางวัลกับบาร์โค้ดที่ถูกหัก
 * จึงใช้วิธีเลือกบาร์โค้ดที่ถูกใช้ตั้งแต่เวลาที่ระบุ (used_after) เป็นต้นไปก่อน
 * ซึ่งตรงกับบาร์โค้ดที่ถูกหักตอนแลกรางวัลรายการนั้น
 * ถ้าหาไม่ครบตามจำนวน จะย้อนไปเลือกบาร์โค้ดที่ถูกใช้ล่าสุดแทน
 *
 * @param user_id - รหัสผู้ใช้ที่ต้องการคืนแต้ม
 * @param to_refund - จำนวนแต้มที่ต้องการคืน
 * @param used_after - ISO datetime ของเวลาที่เริ่มหักแต้ม (เช่น created_at ของประวัติการแลก)
 * @returns ServerActionResponse<number> จำนวนแต้มที่คืนได้จริง
 */
export const refundUserScoreNew = async ({
  user_id,
  to_refund,
  used_after,
}: Pick<User, "user_id"> & {
  to_refund: number;
  used_after?: string;
}): Promise<ServerActionResponse<number>> => {
  try {
    if (to_refund <= 0) return { data: 0, isError: false, error: "" };

    /**
     * ดึงบาร์โค้ดที่ถูกใช้แต้มไปแล้วของผู้ใช้
     *
     * @param fromUsedAt - ถ้าระบุ จะดึงเฉพาะที่ถูกใช้ตั้งแต่เวลานี้เป็นต้นไป (เรียงเก่าไปใหม่)
     *                     ถ้าไม่ระบุ จะดึงทั้งหมดโดยเรียงจากที่ถูกใช้ล่าสุด
     */
    const fetchUsedBarcodes = async (fromUsedAt?: string) => {
      const query = supabaseAdminClient
        .from("scanned_barcodes_with_score")
        .select("id, used_at, actual_score")
        .eq("user_id", user_id)
        .not("used_at", "is", null);

      if (fromUsedAt) {
        query.gte("used_at", fromUsedAt).order("used_at", { ascending: true });
      } else {
        query.order("used_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw new Error(error.message);

      return data ?? [];
    };

    let usedBarcodes = used_after ? await fetchUsedBarcodes(used_after) : [];

    const sumScore = (
      barcodes: { actual_score: number | null }[]
    ): number =>
      barcodes.reduce((acc, curr) => acc + (curr.actual_score ?? 0), 0);

    // ถ้าช่วงเวลาที่ระบุมีแต้มไม่พอ ให้ย้อนไปดูบาร์โค้ดที่ถูกใช้ล่าสุดทั้งหมด
    if (sumScore(usedBarcodes) < to_refund) {
      usedBarcodes = await fetchUsedBarcodes();
    }

    if (usedBarcodes.length === 0)
      throw new Error("ไม่พบแต้มที่ถูกใช้ไปสำหรับการคืนแต้ม");

    // สะสมบาร์โค้ดจนครบจำนวนแต้มที่ต้องคืน (ใช้ logic เดียวกับตอนหักแต้ม)
    let refunded = 0;
    const idsToRestore: string[] = [];
    for (const barcode of usedBarcodes) {
      if (refunded >= to_refund) break;
      idsToRestore.push(barcode.id);
      refunded += barcode.actual_score ?? 0;
    }

    const { error: restoreError } = await supabaseAdminClient
      .from(TABLE_NAME)
      .update({ used_at: null })
      .in("id", idsToRestore);

    if (restoreError) throw new Error(restoreError.message);

    return { data: refunded, isError: false, error: "" };
  } catch (error: any) {
    console.error(`ล้มเหลวระหว่างการคืนแต้มสะสม -> ${error.message}`);
    return {
      data: null,
      isError: true,
      error: error.message,
    };
  }
};

export const getScannedBarcodeHistoriesByUserId = async ({
  user_id,
  filter,
}: GetScannedBarcodeHistoriesByUserIdParams): Promise<
  ServerActionResponse<WithUser<WithProductScoreOption<ScannedBarcode>>[]>
> => {
  try {
    const query = supabaseAdminClient
      .from(TABLE_NAME)
      .select("*, users(*), product_score_option(*)")
      .eq("user_id", user_id)
      .gte("expired_date", new Date().toISOString());

    if (filter) {
      if (filter.from) query.gte("created_date", filter.from);
      if (filter.to) query.lte("created_date", filter.to);
    }

    const { data: scannedBarcodes, error: scannedBarcodesError } = await query;

    if (scannedBarcodesError) throw new Error(scannedBarcodesError.message);

    return { data: scannedBarcodes, isError: false, error: "" };
  } catch (error: any) {
    console.error(
      `ล้มเหลวระหว่างการดึงข้อมูลประวัติการสะสมแต้ม -> ${error.message}`
    );
    return { data: [], isError: true, error: error.message };
  }
};

export const getAllScannedBarcodes = async (): Promise<
  ServerActionResponse<ScannedBarcode[]>
> => {
  try {
    const { data: scannedBarcodes, error: scannedBarcodesError } =
      await supabaseAdminClient.from(TABLE_NAME).select("*");

    if (scannedBarcodesError) throw new Error(scannedBarcodesError.message);

    return { data: scannedBarcodes, isError: false, error: "" };
  } catch (error: any) {
    console.error(
      `ล้มเหลวระหว่างการดึงข้อมูลประวัติการสะสมแต้ม -> ${error.message}`
    );
    return { data: [], isError: true, error: error.message };
  }
};

export const deleteScannedBarcodeAction = async ({
  id,
}: Pick<ScannedBarcode, "id">): Promise<ServerActionResponse<boolean>> => {
  try {
    await requireAdminSession();

    const { error } = await supabaseAdminClient
      .from(TABLE_NAME)
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);

    return { data: true, isError: false, error: "" };
  } catch (error: any) {
    console.error(
      `ล้มเหลวระหว่างการลบข้อมูลประวัติการสะสมแต้ม -> ${error.message}`
    );
    return { data: false, isError: true, error: error.message };
  }
};



export const AllScannedBarcodes = async (
  userId: string,
  scoreOptionId: number = 1,
  expireYears: number = EXPIRED_DATE_YEARS
): Promise<ServerActionResponse<{ inserted: number }>> => {
  try {
    if (!userId?.trim()) {
      return {
        data: { inserted: 0 },
        isError: true,
        error: "ไม่พบ userId",
      };
    }

    const { data, error } = await supabaseAdminClient.rpc(
      "insert_scanned_barcodes_for_user",
      {
        p_user_id: userId,
        p_score_option_id: scoreOptionId,
        p_expire_years: expireYears,
      }
    );

    if (error) {
      console.error(
        `[ERROR] : ล้มเหลวระหว่างการเก็บคะแนน user (rpc) -> ${error.message}`,
        error
      );

      // ถ้าในอนาคตคุณทำ unique แล้วอยากดักซ้ำด้วย code 23505:
      if ((error as any).code === "23505") {
        return {
          data: { inserted: 0 },
          isError: true,
          error: "บาร์โค้ดนี้ถูกใช้ไปแล้ว",
        };
      }

      return {
        data: { inserted: 0 },
        isError: true,
        error: "ล้มเหลวระหว่างการเก็บคะแนน user",
      };
    }

    // function returns int => data คือ number
    const inserted = typeof data === "number" ? data : Number(data ?? 0);

    return {
      data: { inserted },
      isError: false,
      error: "",
    };
  } catch (e: any) {
    console.error(`[ERROR] : AllScannedBarcodes exception ->`, e);
    return {
      data: { inserted: 0 },
      isError: true,
      error: "ล้มเหลวระหว่างการเก็บคะแนน user",
    };
  }
};



