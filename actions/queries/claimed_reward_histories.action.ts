"use server";

import { CLAIMED_REWARD_HISTORY_STATUS } from "@/features/claimed-reward-history/types/claimed-reward-history.type";
import { authSafeActionClient, safeActionClient } from "@/lib/safe-action";
import { supabaseAdminClient } from "@/lib/supabase";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { ServerActionResponse } from "@/models/api.model";
import {
  ClaimedRewardHistory,
  ClaimedRewardHistorySchema,
  GetClaimedRewardHistoriesByUserIdParamsSchema,
  GetClaimedRewardHistoriesParamsSchema,
  Reward,
} from "@/models/reward.model";
import { z } from "zod";
import { preventUnauthorizedUser } from "../util.action";
import { getRewardById } from "./reward.action";
import {
  refundUserScoreNew,
  subtractUserScoreNew,
} from "./scanned-barcodes.action";
import { getUserTotalScoreById } from "./score.action";

const TABLE_NAME = "claimed_reward_histories";
const REWARD_TABLE_NAME = "rewards";

export const claimReward = authSafeActionClient
  .schema(
    ClaimedRewardHistorySchema.pick({
      user_id: true,
      reward_id: true,
      email: true,
      shipping_address: true,
    })
  )
  .action(
    async ({
      parsedInput: { user_id, reward_id, email, shipping_address },
      ctx: { lineUser },
    }): Promise<ServerActionResponse<null>> => {
      try {
        if (lineUser && lineUser.sub !== user_id)
          throw new Error(`คุณไม่มีสิทธิในการรับรางวัลแทนคนอื่น`);

        const { data: userTotalScore, error: userTotalScoreError } =
          await getUserTotalScoreById({ user_id });

        if (userTotalScoreError) throw new Error(userTotalScoreError);

        if (!userTotalScore || userTotalScore < 0)
          return {
            data: null,
            isError: true,
            error: "คะแนนของคุณไม่พอสำหรับแลกรางวัล",
          };

        const {
          data: rewardInfo,
          isError: isRewardInfoError,
          error: rewardInfoError,
        } = SafeActionUtil.getData<ServerActionResponse<Reward>>(
          await getRewardById({ id: reward_id })
        );

        if (!rewardInfo)
          return {
            data: null,
            isError: true,
            error: "ไม่พบข้อมูลรางวัล",
          };

        if (isRewardInfoError) throw new Error(rewardInfoError);

        // เช็คว่าคะแนน user พอมั้ย
        if (userTotalScore < rewardInfo.required_score)
          return {
            data: null,
            isError: true,
            error: "คะแนนของคุณไม่พอสำหรับแลกรางวัล",
          };

        // บันทึกประวัติการรับรางวัล
        const { data: rewardHistory, error } = await supabaseAdminClient
          .from(TABLE_NAME)
          .insert({
            user_id,
            reward_id,
            email,
            shipping_address,
            quantity: 1,
          })
          .select()
          .single<ClaimedRewardHistory>();

        if (error) {
          throw new Error(error.message);
        }

/*         console.log(`[INFO] : บันทึกประวัติการรับรางวัลสำเร็จ`);
 */
        // ลดจำนวนรางวัลที่สามารถแลกได้
        const { error: cutStockError } = await supabaseAdminClient
          .from(REWARD_TABLE_NAME)
          .update({ quantity: rewardInfo.quantity - 1 })
          .eq("id", reward_id);

        if (cutStockError) {
          // ลบประวัติการรับรางวัลที่ยังไม่ได้ใช้
          if (rewardHistory) {
            await supabaseAdminClient
              .from(TABLE_NAME)
              .delete()
              .eq("id", rewardHistory.id);
          }
          throw new Error(cutStockError.message);
        }

   /*      console.log(`[INFO] : ลดจำนวนรางวัลสำเร็จ`); */

        // หักแต้มสะสมของผู้ใช้
        const { isError: isSubtractingError, error: subtractingError } =
          await subtractUserScoreNew({
            user_id,
            to_subtract: rewardInfo.required_score,
          });

        if (isSubtractingError) {
          // ลบประวัติการรับรางวัลที่ยังไม่ได้ใช้
          if (rewardHistory) {
            await supabaseAdminClient
              .from(TABLE_NAME)
              .delete()
              .eq("id", rewardHistory.id);
          }

          // เพิ่มจำนวนรางวัลที่สามารถแลกได้
          if (rewardInfo) {
            await supabaseAdminClient
              .from(REWARD_TABLE_NAME)
              .update({ quantity: rewardInfo.quantity + 1 })
              .eq("id", reward_id);
          }
          throw new Error(subtractingError);
        }

      /*   console.log(`[INFO] : หักแต้มสะสมสำเร็จ`); */

        return {
          data: null,
          isError: false,
          error: "",
        };
      } catch (error: any) {
        console.log(`ล้มเหลวระหว่างการรับรางวัล -> ${error.message}`);
        return {
          data: null,
          isError: true,
          error: error.message,
        };
      }
    }
  );

export const getClaimedRewardHistories = authSafeActionClient
  .schema(GetClaimedRewardHistoriesParamsSchema.optional())
  .action(async ({ ctx: { lineUser }, parsedInput: filter }) => {
    try {
      await preventUnauthorizedUser(lineUser);

      const query = supabaseAdminClient
        .from(TABLE_NAME)
        .select("*, rewards(*), users(*)")
        .order("created_at", { ascending: false });

      if (filter) {
        query.gte(
          "created_at",
          new Date(filter.year, filter.month - 1, 1).toISOString()
        );

        query.lt(
          "created_at",
          new Date(filter.year, filter.month, 1).toISOString()
        );
      }

      const { data, error } = await query;

      if (error) throw new Error(error.message);

      return data;
    } catch (error: any) {
      console.error(
        `ล้มเหลวระหว่างการดึงข้อมูลประวัติการแลกของรางวัล -> ${error.message}`
      );
      throw new Error(`ล้มเหลวระหว่างการดึงข้อมูลประวัติการแลกของรางวัล`);
    }
  });

export const getClaimedRewardHistoriesByUserId = safeActionClient
  .schema(GetClaimedRewardHistoriesByUserIdParamsSchema)
  .action(
    async ({
      parsedInput: { user_id, filter },
    }): Promise<ServerActionResponse<ClaimedRewardHistory[]>> => {
      try {
        const query = supabaseAdminClient
          .from(TABLE_NAME)
          .select("*, rewards(*), users(*)")
          .eq("user_id", user_id)
          .order("created_at", { ascending: false });

        if (filter) {
          if (filter.from) query.gte("created_at", filter.from);
          if (filter.to) query.lte("created_at", filter.to);
        }

        const { data, error } = await query;

        if (error) throw new Error(error.message);

        return {
          data,
          isError: false,
          error: "",
        };
      } catch (error: any) {
        console.error(
          `[ERROR] : ล้มเหลวระหว่างการดึงข้อมูลประวัติการแลกของรางวัล -> ${error.message}`
        );
        return {
          data: null,
          isError: true,
          error: error.message,
        };
      }
    }
  );

export const getTotalNumberOfClaimedRewards = authSafeActionClient.action(
  async ({ ctx: { lineUser } }) => {
    await preventUnauthorizedUser(lineUser);

    const { count: totalClaimedRewards, error } = await supabaseAdminClient
      .from(TABLE_NAME)
      .select("*", { count: "exact" });

    if (error) throw new Error(error.message);

    return totalClaimedRewards ?? 0;
  }
);

export const updateClaimedRewardStatus = authSafeActionClient
  .schema(
    z.object({
      id: z.number(),
      status: z.nativeEnum(CLAIMED_REWARD_HISTORY_STATUS),
    })
  )
  .action(async ({ parsedInput: { id, status }, ctx: { lineUser } }) => {
    try {
      await preventUnauthorizedUser(lineUser);

      // การยกเลิกต้องคืนแต้ม/stock ด้วย จึงต้องใช้ cancelClaimedReward เท่านั้น
      if (status === CLAIMED_REWARD_HISTORY_STATUS.CANCELLED)
        throw new Error("กรุณาใช้ปุ่มยกเลิกการแลกของรางวัลเพื่อยกเลิกรายการ");

      const { error } = await supabaseAdminClient
        .from(TABLE_NAME)
        .update({ status })
        .eq("id", id)
        // กันไม่ให้รายการที่ยกเลิกไปแล้ว (คืนแต้มแล้ว) ถูกเปลี่ยนกลับ
        .neq("status", CLAIMED_REWARD_HISTORY_STATUS.CANCELLED);

      if (error) throw new Error(error.message);

      return {
        data: null,
        isError: false,
        error: "",
      };
    } catch (error: any) {
      console.error(
        `ล้มเหลวระหว่างการอัพเดทสถานะของรางวัล -> ${error.message}`
      );
      return {
        data: null,
        isError: true,
        error: error.message,
      };
    }
  });

/**
 * ยกเลิกการแลกของรางวัลที่ยังอยู่ในสถานะ "กำลังตรวจสอบ"
 * โดยคืนแต้มให้ลูกค้า คืน stock ของรางวัล และเปลี่ยนสถานะเป็น "ยกเลิกแล้ว"
 *
 * @param id - รหัสประวัติการแลกของรางวัล (claimed_reward_histories.id)
 * @returns ServerActionResponse<number> จำนวนแต้มที่คืนให้ลูกค้า
 */
export const cancelClaimedReward = authSafeActionClient
  .schema(
    z.object({
      id: z.number(),
    })
  )
  .action(
    async ({
      parsedInput: { id },
      ctx: { lineUser },
    }): Promise<ServerActionResponse<number>> => {
      try {
        await preventUnauthorizedUser(lineUser);

        const { data: history, error: historyError } = await supabaseAdminClient
          .from(TABLE_NAME)
          .select("*, rewards(*)")
          .eq("id", id)
          .single<ClaimedRewardHistory>();

        if (historyError) throw new Error(historyError.message);

        if (!history) throw new Error("ไม่พบข้อมูลการแลกของรางวัล");

        if (history.status !== CLAIMED_REWARD_HISTORY_STATUS.INSPECTING)
          return {
            data: null,
            isError: true,
            error: `ยกเลิกได้เฉพาะรายการที่อยู่ในสถานะ "${CLAIMED_REWARD_HISTORY_STATUS.INSPECTING}" เท่านั้น`,
          };

        const quantity = history.quantity ?? 1;
        const scoreToRefund = history.rewards.required_score * quantity;

        // คืนแต้มให้ลูกค้า
        const {
          data: refundedScore,
          isError: isRefundError,
          error: refundError,
        } = await refundUserScoreNew({
          user_id: history.user_id,
          to_refund: scoreToRefund,
          used_after: history.created_at,
        });

        if (isRefundError) throw new Error(refundError);

        // คืน stock ของรางวัล
        const { error: restoreStockError } = await supabaseAdminClient
          .from(REWARD_TABLE_NAME)
          .update({ quantity: history.rewards.quantity + quantity })
          .eq("id", history.reward_id);

        if (restoreStockError) throw new Error(restoreStockError.message);

        // เปลี่ยนสถานะเป็นยกเลิกแล้ว
        const { error: updateStatusError } = await supabaseAdminClient
          .from(TABLE_NAME)
          .update({ status: CLAIMED_REWARD_HISTORY_STATUS.CANCELLED })
          .eq("id", id)
          .eq("status", CLAIMED_REWARD_HISTORY_STATUS.INSPECTING);

        if (updateStatusError) {
          // คืน stock กลับไปเท่าเดิม เพราะการยกเลิกไม่สำเร็จ
          await supabaseAdminClient
            .from(REWARD_TABLE_NAME)
            .update({ quantity: history.rewards.quantity })
            .eq("id", history.reward_id);

          throw new Error(updateStatusError.message);
        }

        return {
          data: refundedScore ?? 0,
          isError: false,
          error: "",
        };
      } catch (error: any) {
        console.error(
          `ล้มเหลวระหว่างการยกเลิกการแลกของรางวัล -> ${error.message}`
        );
        return {
          data: null,
          isError: true,
          error: error.message,
        };
      }
    }
  );

/* ========= */


export const getTotalNumberOfClaimedRewardsNew =
  async () => {

    const { count: totalClaimedRewards, error } = await supabaseAdminClient
      .from(TABLE_NAME)
      .select("*", { count: "exact" });

    if (error) throw new Error(error.message);

    return totalClaimedRewards ?? 0;
  };



export const getClaimedRewardHistoriesNew = async (
  filter?: z.infer<typeof GetClaimedRewardHistoriesParamsSchema>
): Promise<ServerActionResponse<any[]>> => {
  try {
    // ✅ ตรวจสอบสิทธิ์ผู้ใช้ (LINE / SUPABASE)



    // ✅ สร้าง query พื้นฐาน
    let query = supabaseAdminClient
      .from(TABLE_NAME)
      .select("*, rewards(*), users(*)")
      .order("created_at", { ascending: false });

    // ✅ ถ้ามี filter (เช่น เดือน / ปี)
    if (filter) {
      query = query
        .gte("created_at", new Date(filter.year, filter.month - 1, 1).toISOString())
        .lt("created_at", new Date(filter.year, filter.month, 1).toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error("[ERROR] getClaimedRewardHistories:", error.message);
      return {
        data: [],
        isError: true,
        error: "ล้มเหลวระหว่างการดึงข้อมูลประวัติการแลกของรางวัล",
      };
    }

    return {
      data: data ?? [],
      isError: false,
      error: "",
    };
  } catch (err: any) {
    console.error(
      `[EXCEPTION] getClaimedRewardHistories -> ${err.message}`
    );
    return {
      data: [],
      isError: true,
      error: "ล้มเหลวระหว่างการดึงข้อมูลประวัติการแลกของรางวัล",
    };
  }
};


export const getClaimedRewardHistoriesUnzline = async (
  filter?: z.infer<typeof GetClaimedRewardHistoriesParamsSchema>
): Promise<{ data: any[]; count: number }> => {

  try {


    const query = supabaseAdminClient
      .from(TABLE_NAME)
      .select(" id  ,reward_id  ,quantity  ,user_id  ,created_at   ,email ,shipping_address ,status  , rewards(*), users(*)")
      .order("created_at", { ascending: false });

    if (filter) {
      query.gte(
        "created_at",
        new Date(filter.year, filter.month - 1, 1).toISOString()
      );

      query.lt(
        "created_at",
        new Date(filter.year, filter.month, 1).toISOString()
      );
    }

    if (!filter) {
      const now = new Date();

      // ทำให้ now เป็นเวลาไทย (UTC+7) เพื่อเอา year/month ให้ถูกกับ “เดือนในไทย”
      const th = new Date(now.getTime() + 7 * 60 * 60 * 1000);

      const year = th.getUTCFullYear();
      const monthIdx = th.getUTCMonth(); // 0-11

      // ช่วงเดือน (ใช้ UTC boundary เพื่อตัดปัญหา toISOString)
      const start = new Date(Date.UTC(year, monthIdx, 1)).toISOString();
      const end = new Date(Date.UTC(year, monthIdx + 1, 1)).toISOString();

      query.gte("created_at", start).lt("created_at", end);
    }



    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return { data: data ?? [], count: data?.length ?? 0 };
  } catch (error: any) {
    console.error(
      `ล้มเหลวระหว่างการดึงข้อมูลประวัติการแลกของรางวัล -> ${error.message}`
    );
    throw new Error(`ล้มเหลวระหว่างการดึงข้อมูลประวัติการแลกของรางวัล`);
  }
};