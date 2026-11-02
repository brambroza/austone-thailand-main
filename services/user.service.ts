import { supabaseAdminClient } from "@/lib/supabase";
import { User, UserInfoView } from "@/models/user.model";
import { SupabaseClient } from "@supabase/supabase-js";

class UserService {
  private readonly TABLE_NAME = "users";

  constructor(private readonly supabaseAdminClient: SupabaseClient) {
    if (!this.supabaseAdminClient)
      throw new Error("Supabase client has not been injected");
  }

  async initializeUser(userId: string): Promise<User> {
    try {
      if (!userId) throw new Error("ผู้ใช้เริ่มต้นต้องมี userId");

      const { data, error } = await this.supabaseAdminClient
        .from(this.TABLE_NAME)
        .insert({ user_id: userId, created_date: new Date() })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return data as User;
    } catch (error: any) {
      console.error(
        `ล้มเหลวระหว่างการสร้างผู้ใช้งานเริ่มต้น -> ${error.message} (parameters: ${userId})`
      );
      throw new Error(error.message);
    }
  }

  async updateUser(
    updatedFields: Omit<Partial<User>, "user_id">,
    userId: string
  ): Promise<User> {
    try {
      const { data, error } = await this.supabaseAdminClient
        .from(this.TABLE_NAME)
        .update(updatedFields)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw new Error(error.message);

      return data;
    } catch (error: any) {
      console.error(`ล้มเหลวระหว่างการอัปเดตผู้ใช้งาน -> ${error.message}`);
      throw new Error(error.message);
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await this.supabaseAdminClient
        .from(this.TABLE_NAME)
        .select("*");

      if (error) throw new Error(error.message);

      return data;
    } catch (error: any) {
      console.error(
        `ล้มเหลวระหว่างการดึงข้อมูลผู้ใช้งานทั้งหมด -> ${error.message}`
      );
      throw new Error(error.message);
    }
  }

  async getAllUserInfos(): Promise<UserInfoView[]> {
    try {
      const { data, error } = await this.supabaseAdminClient
        .from("user_info_view")
        .select("*");

      if (error) throw new Error(error.message);

      return data;
    } catch (error: any) {
      console.error(
        `ล้มเหลวระหว่างการดึงข้อมูลผู้ทั้งหมดของผู้ใช้งานทั้งหมด -> ${error.message}`
      );
      throw new Error(error.message);
    }
  }

  async getUserInfo(userId: string): Promise<UserInfoView> {
    try {
      const { data, error } = await this.supabaseAdminClient
        .from("user_info_view")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw new Error(error.message);

      return data;
    } catch (error: any) {
      console.error(`ล้มเหลวระหว่างการดึงข้อมูลผู้ใช้งาน -> ${error.message}`);
      throw new Error(error.message);
    }
  }

  async doesUserExist(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseAdminClient
        .from(this.TABLE_NAME)
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw new Error(error.message);

      return Boolean(data);
    } catch (error: any) {
      if (
        error.message ===
        "JSON object requested, multiple (or no) rows returned"
      )
        return false;
      throw new Error(error.message);
    }
  }

  async deleteUser(userId: string): Promise<any> {
    try {
      const { data, error } = await this.supabaseAdminClient
        .from(this.TABLE_NAME)
        .delete()
        .eq("user_id", userId);

      if (error) throw new Error(error.message);

      return data;
    } catch (error: any) {
      console.error(`ล้มเหลวระหว่างการลบผู้ใช้งาน -> ${error.message}`);
      throw new Error(error.message);
    }
  }

  async getTotalUsersNumber(): Promise<number> {
    try {
      const { count, error } = await this.supabaseAdminClient
        .from(this.TABLE_NAME)
        .select("*", { count: "exact" });

      if (error) throw new Error(error.message);

      return count ?? 0;
    } catch (error: any) {
      console.error(`ล้มเหลวระหว่างการนับจำนวนผู้ใช้งาน -> ${error.message}`);
      throw new Error(error.message);
    }
  }

  async getUsersGenderProportion(): Promise<{ male: number; female: number }> {
    try {
      const { data: maleData, error: maleError } =
        await this.supabaseAdminClient
          .from(this.TABLE_NAME)
          .select("*")
          .eq("gender", "male");

      const { data: femaleData, error: femaleError } =
        await this.supabaseAdminClient
          .from(this.TABLE_NAME)
          .select("*")
          .eq("gender", "female");

      if (maleError) throw new Error(maleError.message);
      if (femaleError) throw new Error(femaleError.message);

      return {
        male: maleData.length,
        female: femaleData.length,
      };
    } catch (error: any) {
      console.error(
        `ล้มเหลวระหว่างการดึงข้อมูลสัดส่วนเพศของผู้ใช้งาน -> ${error.message}`
      );
      throw new Error(error.message);
    }
  }
}

export const userService = new UserService(supabaseAdminClient);
