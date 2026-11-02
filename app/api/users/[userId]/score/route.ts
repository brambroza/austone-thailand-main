import { getUserTotalScoreById } from "@/actions/queries/score.action";
import { createUserReadHandler } from "@/lib/route-auth";

export const dynamic = "force-dynamic";

/** คืนแต้มสะสมคงเหลือของผู้ใช้ */
export const GET = createUserReadHandler((userId) =>
  getUserTotalScoreById({ user_id: userId })
);
