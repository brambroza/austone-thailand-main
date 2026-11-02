import { supabaseAnonClient } from "@/lib/anon-supabase";

const REQUEST_TIMEOUT_MS = 20_000;

type QueryParams = Record<string, string | undefined>;

/**
 * อ่านข้อมูลจาก route handler แทน server action
 * server action ถูกรันทีละตัวและตัวที่รอคิวจะค้างตลอดไปถ้าผู้ใช้เปลี่ยนหน้า
 * จึงใช้ fetch สำหรับการอ่านข้อมูล ซึ่งยิงพร้อมกันได้และไม่ถูกทิ้งกลางคิว
 *
 * @param path - path ของ API เช่น /api/rewards/available
 * @param params - query string โดยค่าว่างจะถูกตัดออก
 * @returns body ของ response ที่ parse เป็น JSON แล้ว
 * @throws Error เมื่อ response ไม่สำเร็จหรือหมดเวลา
 */
export async function apiGet<T>(path: string, params?: QueryParams): Promise<T> {
  const query = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const queryString = query.toString();

  // ใช้ session จาก SDK เพราะ cookie ของ email user ไม่อัปเดตตอน token ถูก refresh
  const {
    data: { session },
  } = await supabaseAnonClient.auth.getSession();

  const response = await fetch(queryString ? `${path}?${queryString}` : path, {
    headers: session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : undefined,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
  }

  return response.json() as Promise<T>;
}
