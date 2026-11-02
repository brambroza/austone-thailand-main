import { getUserPointsExpiringSoon } from "@/actions/queries/score.action";
import { createUserReadHandler } from "@/lib/route-auth";

export const dynamic = "force-dynamic";

/** คืนแต้มที่ใกล้หมดอายุของผู้ใช้ */
export const GET = createUserReadHandler((userId) =>
  getUserPointsExpiringSoon({ user_id: userId })
);
