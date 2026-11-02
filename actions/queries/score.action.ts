"use server";
import { supabaseAdminClient } from "@/lib/supabase";
import { ServerActionResponse } from "@/models/api.model";
import { UserScore } from "@/models/score.model";
import { getLineUser } from "../auth.action";
import { preventUnauthenticatedUser, preventUnauthorizedUser } from "../util.action";
import { User } from "@/models/user.model";

const TABLE_NAME = "user_points_view";
const SCANNED_BARCODE_TABLE = "scanned_barcodes";

export async function getUserTotalScoreById({
  user_id,
}: Pick<UserScore, "user_id">): Promise<ServerActionResponse<number>> {
  try {
    const { data: scores, error } = await supabaseAdminClient
      .from(TABLE_NAME)
      .select("score")
      .eq("user_id", user_id)
      .gte("expired_date", new Date().toISOString())
      .is("used_at", null);

    console.log("user_id", user_id);

    if (error) {
      console.error(
        `[ERROR] : ล้มเหลวระหว่างการดึงข้อมูลคะแนนสะสม -> ${error.message}`
      );
      throw new Error("ล้มเหลวระหว่างการดึงข้อมูลคะแนนสะสม");
    }

    const totalScores = (scores ?? []).reduce(
      (acc, curr) => acc + (curr.score ?? 0),
      0
    );

    return {
      data: totalScores,
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.error(
      `[ERROR] : ล้มเหลวระหว่างการดึงข้อมูลคะแนนสะสม -> ${error.message}`
    );
    return {
      data: null,
      isError: true,
      error: "ล้มเหลวระหว่างการดึงข้อมูลคะแนนสะสม",
    };
  }
}

export async function getTotalUserScores(): Promise<
  ServerActionResponse<number>
> {
  try {
    /*    const lineUser = await getLineUser();
   
       if (!lineUser) throw new Error("กรุณาเข้าสู่ระบบก่อนดำเนินการ");
   
       await preventUnauthorizedUser(lineUser); */
    /*   await preventUnauthenticatedUser(); */

    const { data: userPoints, error } = await supabaseAdminClient
      .from(TABLE_NAME)
      .select("*")
      .is("used_at", null)
      .gte("expired_date", new Date().toISOString());

    if (error) {
      console.error(
        `[ERROR] : ล้มเหลวระหว่างการดึงข้อมูลคะแนนสะสม -> ${error.message}`
      );
      return {
        data: null,
        isError: true,
        error: "ล้มเหลวระหว่างการดึงข้อมูลคะแนนสะสม",
      };
    }

    const totalScores = (userPoints ?? []).reduce(
      (acc, curr) => acc + (curr.score ?? 0),
      0
    );

    return {
      data: totalScores,
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.error(
      `[ERROR] : ล้มเหลวระหว่างการดึงข้อมูลคะแนนสะสม -> ${error.message}`
    );
    return {
      data: null,
      isError: true,
      error: "ล้มเหลวระหว่างการดึงข้อมูลคะแนนสะสม",
    };
  }
}

// TODO : AUthorize this action
export async function transferUserScores(
  targetUserId: User["user_id"],
  sourceUserId: User["user_id"]
): Promise<ServerActionResponse<null>> {
  try {
    const { error } = await supabaseAdminClient
      .from(SCANNED_BARCODE_TABLE)
      .update({ user_id: targetUserId })
      .eq("user_id", sourceUserId);

    if (error) {
      console.error(`[ERROR] : ล้มเหลวระหว่างการโอนคะแนน -> ${error.message}`);
      throw new Error("ล้มเหลวระหว่างการโอนคะแนน");
    }

    return {
      data: null,
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.error(`[ERROR] : ล้มเหลวระหว่างการโอนคะแนน -> ${error.message}`);
    return {
      data: null,
      isError: true,
      error: "ล้มเหลวระหว่างการโอนคะแนน",
    };
  }
}

 

export async function getTotalUserScoresNew(): Promise<ServerActionResponse<number>> {
  try {
    // ✅ Query เฉพาะคะแนนที่ยังไม่ใช้ และยังไม่หมดอายุ
    const { data: userPoints, error } = await supabaseAdminClient
      .from(TABLE_NAME)
      .select("score")
      .is("used_at", null)
      .gte("expired_date", new Date().toISOString());

    if (error) {
      console.error(
        `[ERROR] getTotalUserScores: ดึงข้อมูลคะแนนสะสมล้มเหลว sssssss-> ${error.message}`
      );
      return {
        data: 0,
        isError: true,
        error: "ล้มเหลวระหว่างการดึงข้อมูลคะแนนสะสม",
      };
    }

    // ✅ รวมคะแนนทั้งหมด (รองรับ null / empty)
    const totalScores = (userPoints ?? []).reduce(
      (acc, curr) => acc + (curr.score ?? 0),
      0
    );

    return {
      data: totalScores,
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.error(`[EXCEPTION] getTotalUserScores -> ${error.message}`);
    return {
      data: 0,
      isError: true,
      error: "ล้มเหลวระหว่างการดึงข้อมูลคะแนนสะสม",
    };
  }
}



export async function getUserPointsExpiringSoon({
  user_id,
}: {
  user_id: string;
}): Promise<ServerActionResponse<{
  expired_date: string;
  total_score_soon_expire: number;
  expire_message: string;
} | null>> {
  try {
    // เรียกจาก VIEW โดยตรง
    const { data, error } = await supabaseAdminClient
      .from("user_expiring_points_view")
      .select("expired_date, total_score_soon_expire, expire_message")
      .eq("user_id", user_id)
      .order("expired_date", { ascending: true }) // ใกล้หมดอายุก่อน
      .limit(1)
      .single();

    if (error) {
      console.error(
        `[ERROR] : ล้มเหลวระหว่างการดึงคะแนนใกล้หมดอายุ -> ${error.message}`
      );
      return {
        data: null,
        isError: true,
        error: "ล้มเหลวระหว่างการดึงคะแนนใกล้หมดอายุ",
      };
    }

    return {
      data: data ?? null,
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.error(
      `[ERROR] : ล้มเหลวระหว่างการดึงคะแนนใกล้หมดอายุ -> ${error.message}`
    );
    return {
      data: null,
      isError: true,
      error: "ล้มเหลวระหว่างการดึงคะแนนใกล้หมดอายุ",
    };
  }
}
