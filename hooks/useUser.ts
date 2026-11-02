/* import { getLineTokenId, getLineUser } from "@/actions/auth.action";
import { getSupabaseCurrentUser } from "@/features/auth/services/auth.service";
import { LineUser } from "@/models/user.model";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export function useUser() {
  const [user, setUser] = useState<User | LineUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUser() {
      setIsLoadingUser(true);

      // ให้ความสำคัญกับ token ของ supabase ก่อน
      const supabaseAccessToken = localStorage.getItem(
        `sb-${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}-auth-token`
      );

      const lineIdToken = await getLineTokenId();

      if (supabaseAccessToken) {
        const supabaseUser = await getSupabaseCurrentUser();

        setUser(supabaseUser);
      } else if (lineIdToken) {
        const info = await getLineUser();

        setUser(info);
      }

      setIsLoadingUser(false);
    }

    fetchUser();
  }, []);

  return { isLoadingUser, user };
}
 */

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/utils/api-client.util";
import { getSupabaseCurrentUser } from "@/lib/utils/supabase.util";
import { LineUser } from "@/models/user.model";

interface SupabaseSession {
  access_token: string;
  user: any;
}

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUser() {
      setIsLoadingUser(true);

      try {
        // ✅ ตรวจสอบ session จาก Supabase SDK โดยตรง (ปลอดภัยกว่า)
        const { data, error } = await getSupabaseCurrentUser();

        if (data?.user) {
          setUser(data.user);
          setIsLoadingUser(false);
          return;
        }

        // ถ้าไม่มี user จาก Supabase → ตรวจสอบจาก LINE
        // คืน null เมื่อไม่มี token ของ LINE
        const lineUser = await apiGet<LineUser | null>("/api/auth/line-user");
        setUser(lineUser);
      } catch (err) {
        console.error("useUser error:", err);
        setUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    }

    fetchUser();
  }, []);

  return { user, isLoadingUser };
}

