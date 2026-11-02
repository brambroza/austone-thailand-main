import { z } from "zod";

const STAFF_ROLES = ["ADMIN", "BILL_MANAGEMENT"];

const UserIdSchema = z.string().min(1).max(100);

const DateFilterSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

export type DateFilter = z.infer<typeof DateFilterSchema>;

/**
 * ตรวจรูปแบบ user id ที่รับมาจาก URL
 *
 * @param userId - ค่าจาก path parameter
 * @returns true เมื่อรูปแบบถูกต้อง
 */
export function isValidUserId(userId: string): boolean {
  return UserIdSchema.safeParse(userId).success;
}

/**
 * ตรวจว่าผู้เรียกอ่านข้อมูลของผู้ใช้เป้าหมายได้หรือไม่
 *
 * @param requesterId - id ของผู้เรียก
 * @param targetUserId - id ของเจ้าของข้อมูล
 * @param requesterRole - role ของผู้เรียก (ใช้เมื่ออ่านข้อมูลของคนอื่น)
 * @returns true เมื่อเป็นเจ้าของข้อมูลหรือเป็นทีมงาน
 */
export function canReadUserData(
  requesterId: string,
  targetUserId: string,
  requesterRole: string | null | undefined
): boolean {
  return (
    requesterId === targetUserId || STAFF_ROLES.includes(requesterRole ?? "")
  );
}

/**
 * อ่านช่วงวันที่จาก query string
 *
 * @param searchParams - query string ของ request
 * @returns ช่วงวันที่ หรือ null เมื่อรูปแบบวันที่ไม่ถูกต้อง
 */
export function parseDateFilter(
  searchParams: URLSearchParams
): DateFilter | null {
  const result = DateFilterSchema.safeParse({
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
  });

  return result.success ? result.data : null;
}
