import { LineUser } from "@/models/user.model";
import { createHmac, timingSafeEqual } from "crypto";

export const LINE_SESSION_COOKIE_NAME = "line_session";
export const LINE_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const KEY_CONTEXT = "austone-line-session-v1";

type LineSessionPayload = Pick<LineUser, "sub" | "name" | "picture" | "email"> & {
  exp: number;
};

/** แยก key ของ session ออกจาก channel secret โดยไม่ต้องเพิ่ม env ใหม่ */
function getSigningKey(): Buffer {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;

  if (!channelSecret) throw new Error("LINE_CHANNEL_SECRET is not configured");

  return createHmac("sha256", channelSecret).update(KEY_CONTEXT).digest();
}

/** เซ็นข้อมูล session */
function sign(encodedPayload: string): Buffer {
  return createHmac("sha256", getSigningKey()).update(encodedPayload).digest();
}

/**
 * สร้างค่า cookie session จากผู้ใช้ LINE ที่ยืนยันกับ LINE แล้วเท่านั้น
 *
 * @param lineUser - ข้อมูลจาก LINE verify endpoint
 * @param now - เวลาปัจจุบันหน่วยมิลลิวินาที
 * @returns ค่า cookie ที่เซ็นแล้ว
 */
export function createLineSession(
  lineUser: LineUser,
  now: number = Date.now()
): string {
  const payload: LineSessionPayload = {
    sub: lineUser.sub,
    name: lineUser.name,
    picture: lineUser.picture,
    email: lineUser.email,
    exp: now + LINE_SESSION_MAX_AGE_SECONDS * 1000,
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  );

  return `${encodedPayload}.${sign(encodedPayload).toString("base64url")}`;
}

/**
 * ตรวจลายเซ็นและวันหมดอายุของ session
 *
 * @param session - ค่า cookie
 * @param now - เวลาปัจจุบันหน่วยมิลลิวินาที
 * @returns ผู้ใช้ LINE หรือ null เมื่อ session ใช้ไม่ได้
 */
export function verifyLineSession(
  session: string | undefined,
  now: number = Date.now()
): LineUser | null {
  if (!session) return null;

  const [encodedPayload, encodedSignature, ...rest] = session.split(".");

  if (!encodedPayload || !encodedSignature || rest.length > 0) return null;

  try {
    const actualSignature = Buffer.from(encodedSignature, "base64url");
    const expectedSignature = sign(encodedPayload);

    if (
      actualSignature.length !== expectedSignature.length ||
      !timingSafeEqual(actualSignature, expectedSignature)
    ) {
      return null;
    }

    const { exp, ...lineUser } = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as LineSessionPayload;

    return exp > now && lineUser.sub ? lineUser : null;
  } catch {
    return null;
  }
}
