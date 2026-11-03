export const SUPABASE_ACCESS_TOKEN_COOKIE = "supabase_access_token";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/**
 * สร้างค่า document.cookie สำหรับ access token ของ Supabase
 * server action อ่านตัวตนของ email user จาก cookie นี้ จึงต้องเขียนใหม่ทุกครั้งที่ token ถูก refresh
 *
 * @param accessToken - access token ปัจจุบัน หรือ null เพื่อลบ cookie
 * @param isSecure - true เมื่อเปิดผ่าน https
 * @returns ข้อความสำหรับกำหนดให้ document.cookie
 */
export function buildSupabaseAccessTokenCookie(
  accessToken: string | null | undefined,
  isSecure: boolean
): string {
  const value = accessToken ? encodeURIComponent(accessToken) : "";
  const maxAge = accessToken ? COOKIE_MAX_AGE_SECONDS : 0;

  return `${SUPABASE_ACCESS_TOKEN_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
}

/**
 * เขียน หรือลบ cookie access token ใน browser
 *
 * @param accessToken - access token ปัจจุบัน หรือ null เพื่อลบ cookie
 */
export function writeSupabaseAccessTokenCookie(
  accessToken: string | null | undefined
): void {
  document.cookie = buildSupabaseAccessTokenCookie(
    accessToken,
    window.location.protocol === "https:"
  );
}
