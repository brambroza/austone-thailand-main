"use server";

import { LineUser, User, UserInfoView } from "@/models/user.model";
import { cookies, headers } from "next/headers";
import { fetchUserInfo } from "./queries/users.action";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { ServerActionResponse } from "@/models/api.model";
import { getLineUser } from "./auth.action";
import { supabaseAdminClient } from "@/lib/supabase";

type AuthUser = LineUser | User ;;

export async function setCookie(key: string, value: string) {
  try {
    cookies().set(key, value);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getRequestOriginUrl() {
  const origin = headers().get("origin");
  return origin;
}


export async function preventUnauthorizedUser(lineUser: AuthUser) {

 

  if (!lineUser) return;

  const userId = "sub" in lineUser ? lineUser.sub : lineUser.user_id;


  const userInfoActionResult = await fetchUserInfo({ user_id: userId });
  /*   const userInfoActionResult = await fetchUserInfo({ user_id: lineUser.sub }); */

  const { data: userInfo } =
    SafeActionUtil.getData<ServerActionResponse<UserInfoView>>(
      userInfoActionResult
    );

  if (userInfo?.role_title !== "ADMIN")
    throw new Error("คุณไม่มีสิทธิในการเข้าถึง");
}

export async function preventUnauthenticatedUser() {

  const {
    data: { user },
    error,
  } = await supabaseAdminClient.auth.getUser();

  if (user) return user;
  const lineUser = await getLineUser();

  if (!lineUser) throw new Error("กรุณาเข้าสู่ระบบก่อนดำเนินการ");
}
