import { supabaseAdminClient } from "@/lib/supabase";
import { UserInfoView } from "@/models/user.model";

const THAI_UTC_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * ไฟล์นี้ตั้งใจไม่ใช้ "use server" เพื่อไม่ให้ query เหล่านี้ถูกเรียกตรงจาก browser
 * ต้องเรียกผ่าน route ที่ตรวจสิทธิ์ admin แล้วเท่านั้น
 */

/**
 * ดึงข้อมูลผู้ใช้ทั้งหมด
 *
 * @returns รายการผู้ใช้จาก user_info_view
 */
export async function fetchAllUserInfos(): Promise<UserInfoView[]> {
  const { data, error } = await supabaseAdminClient
    .from("user_info_view")
    .select("*");

  if (error) throw new Error(error.message);

  return data ?? [];
}

/**
 * หาช่วงเวลาของเดือนปัจจุบันตามเวลาไทย
 *
 * @param now - เวลาปัจจุบัน
 * @returns วันเริ่มเดือนนี้และเดือนถัดไปในรูปแบบ ISO
 */
export function getThaiMonthRange(now: Date = new Date()) {
  const thaiNow = new Date(now.getTime() + THAI_UTC_OFFSET_MS);
  const year = thaiNow.getUTCFullYear();
  const monthIndex = thaiNow.getUTCMonth();

  return {
    start: new Date(Date.UTC(year, monthIndex, 1)).toISOString(),
    end: new Date(Date.UTC(year, monthIndex + 1, 1)).toISOString(),
  };
}

/** นับจำนวนแถวของตารางโดยไม่โหลดข้อมูล */
async function countRows(table: string): Promise<number> {
  const { count, error } = await supabaseAdminClient
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) throw new Error(error.message);

  return count ?? 0;
}

/** รวมแต้มที่ยังไม่ถูกใช้และยังไม่หมดอายุ */
async function sumActiveScores(): Promise<number> {
  const { data, error } = await supabaseAdminClient
    .from("user_points_view")
    .select("score")
    .is("used_at", null)
    .gte("expired_date", new Date().toISOString());

  if (error) throw new Error(error.message);

  return (data ?? []).reduce((total, row) => total + (row.score ?? 0), 0);
}

/** ดึงวันที่สแกนทั้งหมดสำหรับกราฟรายวัน */
async function fetchScannedBarcodeDates() {
  const { data, error } = await supabaseAdminClient
    .from("scanned_barcodes")
    .select("created_date");

  if (error) throw new Error(error.message);

  return data ?? [];
}

/** ดึงประวัติการแลกของรางวัลของเดือนปัจจุบัน */
async function fetchCurrentMonthClaimedRewards(): Promise<any[]> {
  const { start, end } = getThaiMonthRange();

  const { data, error } = await supabaseAdminClient
    .from("claimed_reward_histories")
    .select(
      "id, reward_id, quantity, user_id, created_at, email, shipping_address, status, rewards(*), users(*)"
    )
    .order("created_at", { ascending: false })
    .gte("created_at", start)
    .lt("created_at", end);

  if (error) throw new Error(error.message);

  return data ?? [];
}

/**
 * ดึงข้อมูลทั้งหมดของหน้า dashboard พร้อมกัน
 *
 * @returns ข้อมูลสรุป กราฟ และตารางของ dashboard
 */
export async function getDashboardData() {
  const [
    totalUsers,
    totalUserScores,
    totalClaimedRewards,
    scannedBarcodes,
    userInfos,
    claimedRewardHistories,
  ] = await Promise.all([
    countRows("users"),
    sumActiveScores(),
    countRows("claimed_reward_histories"),
    fetchScannedBarcodeDates(),
    fetchAllUserInfos(),
    fetchCurrentMonthClaimedRewards(),
  ]);

  return {
    totalUsers,
    totalUserScores,
    totalClaimedRewards,
    scannedBarcodes,
    userInfos,
    claimedRewardHistories,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
