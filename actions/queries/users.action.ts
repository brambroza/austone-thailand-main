"use server";
import { authSafeActionClient, safeActionClient } from "@/lib/safe-action";
import { supabaseAdminClient } from "@/lib/supabase";
import { ServerActionResponse } from "@/models/api.model";
import { User, UserInfoView, UserSchema } from "@/models/user.model";
import { preventUnauthorizedUser } from "../util.action";
import { getLineUser } from "../auth.action";
import { getZodErrorMessage } from "@/lib/utils";
import { ProductScoreOption } from "@/models/product-score-option.model";

const TABLE_NAME = "users";

export async function initUser(userId: string) {
  const { data, error } = await supabaseAdminClient
    .from(TABLE_NAME)
    .insert({ user_id: userId, created_date: new Date() });

  if (error) throw new Error(error.message);

  return data;
}

export const updateUser = async ({
  ...fields
}: Partial<Omit<User, "created_date">>): Promise<
  ServerActionResponse<null>
> => {
  try {
    const { success: validationSuccess, error: validationError } =
      UserSchema.partial().omit({ created_date: true }).safeParse(fields);

    if (!validationSuccess)
      return {
        data: null,
        isError: true,
        error: getZodErrorMessage(validationError),
      };

    const updateFields = {
      ...fields,
      date_of_birth: fields.date_of_birth
        ? new Date(new Date(fields.date_of_birth).getTime())
        : undefined,
    };

    const { error } = await supabaseAdminClient
      .from(TABLE_NAME)
      .update(updateFields)
      .eq("user_id", fields.user_id);

    if (error)
      return {
        data: null,
        isError: true,
        error: "ล้มเหลวระหว่างการอัปเดตผู้ใช้งาน",
      };

    return { data: null, isError: false, error: "" };
  } catch (error: any) {
    console.error(
      `[ERROR] : ล้มเหลวระหว่างการอัปเดตผู้ใช้งาน -> ${error.message
      } (parameters: ${JSON.stringify(fields)})`
    );
    return {
      data: null,
      isError: true,
      error: "ล้มเหลวระหว่างการอัปเดตผู้ใช้งาน",
    };
  }
};

export const fetchAllUsers = authSafeActionClient.action(
  async ({ ctx: { lineUser } }): Promise<ServerActionResponse<User[]>> => {
    try {

      await preventUnauthorizedUser(lineUser);

      const { data, error } = await supabaseAdminClient
        .from(TABLE_NAME)
        .select("*");

      if (error) throw new Error(error.message);

      return { data, isError: false, error: "" };
    } catch (error: any) {
      console.error(
        `[ERROR] : ล้มเหลวระหว่างการดึงข้อมูลผู้ใช้งานทั้งหมด -> ${error.message}`
      );
      return {
        data: null,
        isError: true,
        error: "ล้มเหลวระหว่างการดึงข้อมูลผู้ใช้งานทั้งหมด",
      };
    }
  }
);


export const fetchUserInfolist = async (): Promise<
  ServerActionResponse<UserInfoView[]>
> => {
  try {
    const { data, error } = await supabaseAdminClient
      .from("user_info_view")
      .select("*");

    if (error) {
      console.error("[ERROR] Fetch user_info_view failed:", error.message);
      return {
        data: null,
        isError: true,
        error: error.message,
      };
    }

    return {
      data,
      isError: false,
      error: "",
    };
  } catch (err: any) {
    console.error("[EXCEPTION] fetchUserInfolist:", err);
    return {
      data: null,
      isError: true,
      error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน",
    };
  }
};



export const fetchUserScorelist = async (): Promise<
  ServerActionResponse<ProductScoreOption[]>
> => {
  try {
    const { data, error } = await supabaseAdminClient
      .from("user_score_option")
      .select("*");

    if (error) {
      console.error("[ERROR] Fetch user_score_option failed:", error.message);
      return {
        data: null,
        isError: true,
        error: error.message,
      };
    }

    return {
      data,
      isError: false,
      error: "",
    };
  } catch (err: any) {
    console.error("[EXCEPTION] fetchUserScorelist:", err);
    return {
      data: null,
      isError: true,
      error: "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน",
    };
  }
};




export const fetchUserInfos = authSafeActionClient.action(
  async ({ ctx: { lineUser } }) => {

    await preventUnauthorizedUser(lineUser);

    const { data, error } = await supabaseAdminClient
      .from("user_info_view")
      .select("*");

    if (error) throw new Error(error.message);

    return data;
  }
);

export const fetchUserInfo = safeActionClient
  .schema(UserSchema.pick({ user_id: true }))
  .action(
    async ({ parsedInput }): Promise<ServerActionResponse<UserInfoView>> => {
      try {
        const { user_id } = parsedInput;

        const { data, error } = await supabaseAdminClient
          .from("user_info_view")
          .select("*")
          .eq("user_id", user_id)
          .single();

        if (error) throw new Error(error.message);

        return { data, isError: false, error: "" };
      } catch (error: any) {
        console.error(
          `[ERROR] : ล้มเหลวระหว่างการดึงข้อมูลผู้ใช้งาน -> ${error.message
          } (parameters: ${JSON.stringify(parsedInput)})`
        );
        return {
          data: null,
          isError: true,
          error: "ล้มเหลวระหว่างการดึงข้อมูลผู้ใช้งาน",
        };
      }
    }
  );

export async function doesUserExist(userId: string) {
  try {
    const { data, error } = await supabaseAdminClient
      .from(TABLE_NAME)
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) throw new Error(error.message);

    return Boolean(data);
  } catch (error: any) {
    if (
      error.message === "JSON object requested, multiple (or no) rows returned"
    )
      return false;
    throw new Error(error.message);
  }
}

export const deleteUser = authSafeActionClient
  .schema(UserSchema.pick({ user_id: true }))
  .action(async ({ parsedInput: { user_id }, ctx: { lineUser } }) => {
    try {
      await preventUnauthorizedUser(lineUser);


      const { data, error } = await supabaseAdminClient
        .from(TABLE_NAME)
        .delete()
        .eq("user_id", user_id);

      if (error) throw new Error(error.message);

      return data;
    } catch (error: any) {
      console.error(
        `[ERROR] : ล้มเหลวระหว่างการลบผู้ใช้งาน -> ${error.message} (parameters: ${lineUser.sub})`
      );
      throw new Error("ล้มเหลวระหว่างการลบผู้ใช้งาน");
    }
  });

export const getTotalUsersNumber = authSafeActionClient.action(
  async ({ ctx: { lineUser } }) => {
    await preventUnauthorizedUser(lineUser);

    const { count, error } = await supabaseAdminClient
      .from(TABLE_NAME)
      .select("*", { count: "exact" });

    if (error) throw new Error(error.message);

    return count ?? 0;
  }
);

export const getUsersGenderProportion = authSafeActionClient.action(
  async ({
    ctx: { lineUser },
  }): Promise<ServerActionResponse<{ male: number; female: number }>> => {
    await preventUnauthorizedUser(lineUser);

    const { data: maleData, error: maleError } = await supabaseAdminClient
      .from(TABLE_NAME)
      .select("*")
      .eq("gender", "male");

    const { data: femaleData, error: femaleError } = await supabaseAdminClient
      .from(TABLE_NAME)
      .select("*")
      .eq("gender", "female");

    if (maleError) throw new Error(maleError.message);

    if (femaleError) throw new Error(femaleError.message);

    return {
      data: {
        male: maleData.length,
        female: femaleData.length,
      },
      isError: false,
      error: "",
    };
  }
);


/* ========== */

export const getTotalUsersNumberNew = async (): Promise<ServerActionResponse<number>> => {
  try {
    const { count, error } = await supabaseAdminClient
      .from(TABLE_NAME)
      .select("*", { count: "exact", head: true }); // ✅ head:true ทำให้ query เร็วขึ้น (ไม่โหลดข้อมูลจริง)

    if (error) {
      console.error(`[ERROR] getTotalUsersNumber: ${error.message}`);
      return {
        data: 0,
        isError: true,
        error: error.message,
      };
    }

    return {
      data: count ?? 0,
      isError: false,
      error: "",
    };
  } catch (err: any) {
    console.error("[EXCEPTION] getTotalUsersNumber:", err);
    return {
      data: 0,
      isError: true,
      error: "เกิดข้อผิดพลาดในการดึงจำนวนผู้ใช้ทั้งหมด",
    };
  }
};