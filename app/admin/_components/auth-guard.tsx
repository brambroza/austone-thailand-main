/* "use client";

import { getLineUser } from "@/actions/auth.action";
import { fetchUserInfo } from "@/actions/queries/users.action";
import { useUser } from "@/hooks/useUser";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { ServerActionResponse } from "@/models/api.model";
import { UserInfoView } from "@/models/user.model";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

const ALLOWED_ROLES = ["ADMIN", "BILL_MANAGEMENT"];

interface IAuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: IAuthGuardProps) {
  const router = useRouter();
  const useUserValue = useUser();

  const [isAuthorized, setIsAuthorized] = useState(false);

 

  useEffect(() => {
    async function checkAuth() {
      try {
        const lineUser = await getLineUser();

        console.log("lineUser", lineUser);
        console.log("useUserValue.user?.id", useUserValue.user?.id);
 
        let userInfoResult;
        if (lineUser)
          userInfoResult = await fetchUserInfo({ user_id: lineUser.sub });

        if (useUserValue.user?.id)
          userInfoResult = await fetchUserInfo({ user_id: useUserValue.user?.id });

        if (!lineUser && !useUserValue.user?.id) {
          router.replace("/");
          return;
        }
        const { data: userInfo } =
          SafeActionUtil.getData<ServerActionResponse<UserInfoView>>(
            userInfoResult
          );

        console.log("userInfo", userInfo);
        console.log("ALLOWED_ROLES", ALLOWED_ROLES);

        if (!ALLOWED_ROLES.includes(userInfo?.role_title ?? "")) {

          router.replace("/");
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/");
      }
    }

    checkAuth();

  }, [router, useUserValue.user?.id]);

  if (!isAuthorized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">กำลังตรวจสอบสิทธิ์การเข้าถึง...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
 */

"use client";

import { useFetchUserInfo } from "@/hooks/fetch-data/useFetchUserInfo";
import { useUser } from "@/hooks/useUser";
import { getUserId } from "@/lib/utils/user.util";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

const ALLOWED_ROLES = ["ADMIN", "BILL_MANAGEMENT"];

interface IAuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: IAuthGuardProps) {
  const router = useRouter();
  const { user, isLoadingUser } = useUser();

  // ใช้ query เดียวกับเมนูด้านข้าง จึงไม่ยิงซ้ำและไม่ต้องรอคิว server action
  const { data: userInfo, isLoading: isLoadingUserInfo } = useFetchUserInfo(
    getUserId(user)
  );

  const isChecking = isLoadingUser || isLoadingUserInfo;
  const isAuthorized = ALLOWED_ROLES.includes(userInfo?.role_title ?? "");

  useEffect(() => {
    if (!isChecking && !isAuthorized) router.replace("/");
  }, [router, isChecking, isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600">กำลังตรวจสอบสิทธิ์การเข้าถึง...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
