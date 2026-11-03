"use client";

import { supabaseAnonClient } from "@/lib/anon-supabase";
import { writeSupabaseAccessTokenCookie } from "@/lib/utils/supabase-cookie.util";
import { useEffect } from "react";

/**
 * อัปเดต cookie access token ทุกครั้งที่ session ของ Supabase เปลี่ยน
 * token อายุราว 1 ชั่วโมง ถ้าไม่เขียน cookie ใหม่ server action จะเห็น token หมดอายุ
 * แล้วตอบว่าไม่มีสิทธิ์ ทั้งที่ admin ยังเข้าสู่ระบบอยู่
 */
export default function SupabaseSessionSync() {
  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseAnonClient.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        writeSupabaseAccessTokenCookie(null);
        return;
      }

      // ผู้ใช้ LINE ไม่มี session ของ Supabase จึงไม่แตะ cookie
      if (session?.access_token) {
        writeSupabaseAccessTokenCookie(session.access_token);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
