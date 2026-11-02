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
import { getLineTokenId, getLineUser } from "@/actions/auth.action";
import { getSupabaseCurrentUser } from "@/lib/utils/supabase.util";

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
        const lineIdToken = await getLineTokenId();
        if (lineIdToken) {
          const info = await getLineUser();
          setUser(info);
          setIsLoadingUser(false);
          return;
        }

        // ❌ ไม่มี token ทั้งคู่
        setUser(null);
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

