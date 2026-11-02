import { fetchUserInfo } from "@/actions/queries/users.action";
import { createUserReadHandler } from "@/lib/route-auth";

export const dynamic = "force-dynamic";

/** คืนข้อมูลโปรไฟล์ของผู้ใช้ */
export const GET = createUserReadHandler(async (userId) => {
  const actionResult = await fetchUserInfo({ user_id: userId });

  return actionResult?.data ?? null;
});
