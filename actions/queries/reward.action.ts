"use server";
import { supabaseAdminClient } from "@/lib/supabase";
import { ServerActionResponse } from "@/models/api.model";
import { Reward, RewardSchema, RewardCreateSchema } from "@/models/reward.model";
import { preventUnauthorizedUser } from "../util.action";
import { authSafeActionClient, safeActionClient } from "@/lib/safe-action";

const TABLE_NAME = "rewards";

export const addNewRewardx = authSafeActionClient
  .schema(RewardSchema.omit({ id: true, updated_at: true, created_at: true }))
  .action(
    async ({ parsedInput: rewardInfo, ctx: { lineUser } }): Promise<Reward> => {
      try {


        await preventUnauthorizedUser(lineUser);

        const { data, error } = await supabaseAdminClient
          .from(TABLE_NAME)
          .insert(rewardInfo)
          .select()
          .single();

        if (error) throw new Error(error.message);


        return data;
      } catch (error: any) {
        console.error(`ล้มเหลวระหว่างการเพิ่มรางวัล -> ${error.message}`);
        throw new Error(`ล้มเหลวระหว่างการเพิ่มรางวัล`);
      }
    }
  );




export const addNewReward = safeActionClient
  .schema(RewardSchema.omit({ id: true, updated_at: true, created_at: true }))
  .action(async (args): Promise<Reward> => {
    console.log("[addNewReward] start");

    const rewardInfo = args.parsedInput;
    /*   const lineUser = args.ctx?.lineUser; */

    console.log("[addNewReward] ctx:", args.ctx);
    console.log("[addNewReward] payload:", rewardInfo);

    /*   await preventUnauthorizedUser(lineUser); */
    console.log("[addNewReward] auth ok");

    const { data, error } = await supabaseAdminClient
      .from(TABLE_NAME)
      .insert(rewardInfo)
      .select("*")
      .single();

    console.log("[addNewReward] insert returned", { hasData: !!data, error });

    if (error) {
      console.error("[addNewReward] SUPABASE_ERROR", error);
      throw error;
    }

    if (!data) {
      throw new Error("Insert succeeded but no data returned (check .select()/RLS)");
    }

    return data;
  });







export const updateReward = authSafeActionClient
  .schema(
    RewardSchema.partial().omit({
      created_at: true,
      updated_at: true,
      required_score: true,
    })
  )
  .action(
    async ({ parsedInput: rewardInfo, ctx: { lineUser } }): Promise<Reward> => {
      try {

        await preventUnauthorizedUser(lineUser);


        const now = new Date();
        const { data, error } = await supabaseAdminClient
          .from(TABLE_NAME)
          .update({
            ...rewardInfo,
            updated_at: now,
          })
          .eq("id", rewardInfo.id)
          .select()
          .single();


        /*  if (error) throw new Error(error.message); */
        if (error) {
          console.error("SUPABASE_UPDATE_REWARD_ERROR:", error);
          throw new Error(error.message);
        }


        return data;
      } catch (error) {
        console.error(`ล้มเหลวระหว่างการแก้ไขรางวัล -> ${error}`);
        throw new Error(`ล้มเหลวระหว่างการแก้ไขรางวัล`);
      }
    }
  );

export const getRewards = authSafeActionClient.action(
  async ({ ctx: { lineUser } }) => {
    try {
      await preventUnauthorizedUser(lineUser);

      const { data, error } = await supabaseAdminClient
        .from(TABLE_NAME)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);

      return data;
    } catch (error: any) {
      console.error(`ล้มเหลวระหว่างการดึงข้อมูลรางวัล -> ${error.message}`);
      throw new Error(`ล้มเหลวระหว่างการดึงข้อมูลรางวัล`);
    }
  }
);

export const getAvailableRewards = authSafeActionClient.action(async () => {
  try {
    const { data, error } = await supabaseAdminClient
      .from(TABLE_NAME)
      .select("*")
      .eq("is_visible", true)
      .lte("available_at", new Date().toISOString())
      .gte("expired_at", new Date().toISOString())
      .order("required_score", { ascending: true });

    if (error) throw new Error(error.message);

    return data;
  } catch (error: any) {
    console.error(
      `ล้มเหลวระหว่างการดึงข้อมูลรางวัลที่มีสถานะเปิดใช้งาน -> ${error.message}`
    );
    throw new Error(`ล้มเหลวระหว่างการดึงข้อมูลรางวัลที่มีสถานะเปิดใช้งาน`);
  }
});

export const getRewardById = authSafeActionClient
  .schema(RewardSchema.pick({ id: true }))
  .action(
    async ({ parsedInput: { id } }): Promise<ServerActionResponse<Reward>> => {
      try {
        const { data, error } = await supabaseAdminClient
          .from(TABLE_NAME)
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw new Error(error.message);

        return {
          data: data,
          isError: false,
          error: "",
        };
      } catch (error: any) {
        console.error(`ล้มเหลวระหว่างการดึงข้อมูลรางวัล -> ${error.message}`);
        return {
          data: null,
          isError: true,
          error: error.message,
        };
      }
    }
  );


/* ============== */

export const getRewardsNew = async (): Promise<ServerActionResponse<any[]>> => {
  try {
    const { data, error } = await supabaseAdminClient
      .from(TABLE_NAME)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`[ERROR] getRewardsNew: ${error.message}`);
      return {
        data: [],
        isError: true,
        error: "ล้มเหลวระหว่างการดึงข้อมูลรางวัล",
      };
    }

    return {
      data: data ?? [],
      isError: false,
      error: "",
    };
  } catch (err: any) {
    console.error(`[EXCEPTION] getRewardsNew -> ${err.message}`);
    return {
      data: [],
      isError: true,
      error: "ล้มเหลวระหว่างการดึงข้อมูลรางวัล",
    };
  }
};



export async function getAvailableRewardsNew() {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdminClient
      .from("rewards")
      .select("*")
      .eq("is_visible", true)
      .lte("available_at", now)
      .gte("expired_at", now)
      .order("required_score", { ascending: true });

    if (error) throw new Error(error.message);

    return {
      data: data ?? [],
      isError: false,
      error: "",
    };
  } catch (error: any) {
    console.error("Error fetching rewards:", error);
    return {
      data: [],
      isError: true,
      error: error.message ?? "Unexpected error",
    };
  }
}



export const getRewardAvailableNew = async (): Promise<ServerActionResponse<any[]>> => {
  try {
    // วันที่ย้อนหลัง 1 เดือน
    /*   const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1); */


    const { data, error } = await supabaseAdminClient
      .from(TABLE_NAME)
      .select("id, title, required_score, description, quantity, created_at ,is_alert_enable")
      .eq("is_alert_enable", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`[ERROR] getRewardAvailableNew: ${error.message}`);
      return {
        data: [],
        isError: true,
        error: "ล้มเหลวระหว่างการดึงข้อมูลรางวัล",
      };
    }

    if (!data || data.length === 0) {
      return {
        data: [],
        isError: false,
        error: "",
      };
    }

    // ✅ เพิ่ม URL รูปภาพจาก Supabase Storage
    const rewardsWithImage = data.map((reward) => {
      const imageUrl = supabaseAdminClient.storage
        .from(TABLE_NAME)
        .getPublicUrl(`${reward.id}.png`).data.publicUrl;

      return {
        ...reward,
        image_url: imageUrl,
      };
    });

    return {
      data: rewardsWithImage,
      isError: false,
      error: "",
    };
  } catch (err: any) {
    console.error(`[EXCEPTION] getRewardAvailableNew -> ${err.message}`);
    return {
      data: [],
      isError: true,
      error: "ล้มเหลวระหว่างการดึงข้อมูลรางวัล",
    };
  }
};



export const updateRewardNew = async (rewardInfo: Partial<Reward>): Promise<Reward> => {
  try {
    // ✅ ตรวจสอบ schema (optional)


    const now = new Date();
    const { data, error } = await supabaseAdminClient
      .from(TABLE_NAME)
      .update({
        ...rewardInfo,
        updated_at: now,
      })
      .eq("id", rewardInfo.id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data;
  } catch (error: any) {
    console.error(`ล้มเหลวระหว่างการแก้ไขรางวัล -> ${error.message}`);
    throw new Error("ล้มเหลวระหว่างการแก้ไขรางวัล");
  }
};