import { getLineUserProfile } from "@/actions/auth.action";
import { LINE_SESSION_COOKIE_NAME, verifyLineSession } from "@/lib/line-session";
import { supabaseAdminClient } from "@/lib/supabase";
import { canReadUserData, isValidUserId } from "@/lib/utils/route-access.util";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const LINE_AUTH_TOKEN_COOKIE_NAME = "line_id_token";
const SUPABASE_ACCESS_TOKEN_COOKIE_NAME = "supabase_access_token";

type UserRouteContext = { params: { userId: string } };

/**
 * หา id ของผู้เรียกจาก Bearer token, cookie ของ Supabase หรือ cookie ของ LINE
 *
 * @param request - request ที่เข้ามา
 * @returns id ของผู้ใช้ หรือ null เมื่อยืนยันตัวตนไม่ได้
 */
export async function resolveRequesterId(
  request: NextRequest
): Promise<string | null> {
  const bearerToken = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");

  const lineSessionUser = bearerToken
    ? null
    : verifyLineSession(request.cookies.get(LINE_SESSION_COOKIE_NAME)?.value);

  if (lineSessionUser) return lineSessionUser.sub;

  return resolveUserIdFromTokens(
    bearerToken ?? request.cookies.get(SUPABASE_ACCESS_TOKEN_COOKIE_NAME)?.value,
    request.cookies.get(LINE_AUTH_TOKEN_COOKIE_NAME)?.value
  );
}

/**
 * ยืนยัน token กับผู้ให้บริการแล้วคืน id ของผู้ใช้
 *
 * @param supabaseToken - access token ของ Supabase
 * @param lineToken - id token ของ LINE
 * @returns id ของผู้ใช้ หรือ null เมื่อ token ใช้ไม่ได้
 */
async function resolveUserIdFromTokens(
  supabaseToken: string | undefined,
  lineToken: string | undefined
): Promise<string | null> {
  if (supabaseToken) {
    const { data, error } = await supabaseAdminClient.auth.getUser(supabaseToken);

    if (!error && data.user) return data.user.id;
  }

  if (!lineToken) return null;

  try {
    const { data: lineUser } = await getLineUserProfile(lineToken);

    return lineUser?.sub ?? null;
  } catch {
    return null;
  }
}

/**
 * ดึง role ของผู้ใช้เพื่อตรวจสิทธิ์อ่านข้อมูลของคนอื่น
 *
 * @param userId - id ของผู้ใช้
 * @returns ชื่อ role หรือ null เมื่อไม่พบ
 */
async function getUserRole(userId: string): Promise<string | null> {
  const { data } = await supabaseAdminClient
    .from("user_info_view")
    .select("role_title")
    .eq("user_id", userId)
    .maybeSingle();

  return data?.role_title ?? null;
}

/**
 * ตรวจว่าผู้เรียก server action เป็น admin จาก cookie
 * ใช้กับ action ที่ไม่ได้สร้างจาก authSafeActionClient
 *
 * @param allowedRoles - role ที่อนุญาต ค่าเริ่มต้นคือ ADMIN เท่านั้น
 * @throws Error เมื่อยังไม่เข้าสู่ระบบหรือไม่มีสิทธิ์
 */
export async function requireAdminSession(
  allowedRoles: string[] = ["ADMIN"]
): Promise<void> {
  const cookieStore = cookies();

  const userId =
    verifyLineSession(cookieStore.get(LINE_SESSION_COOKIE_NAME)?.value)?.sub ??
    (await resolveUserIdFromTokens(
      cookieStore.get(SUPABASE_ACCESS_TOKEN_COOKIE_NAME)?.value,
      cookieStore.get(LINE_AUTH_TOKEN_COOKIE_NAME)?.value
    ));

  if (!userId || !allowedRoles.includes((await getUserRole(userId)) ?? "")) {
    throw new Error("คุณไม่มีสิทธิในการเข้าถึง");
  }
}

/**
 * สร้าง GET handler สำหรับข้อมูลที่อนุญาตเฉพาะ admin
 *
 * @param read - ฟังก์ชันอ่านข้อมูล ทำงานหลังตรวจสิทธิ์แล้วเท่านั้น คืน NextResponse เองได้เมื่อ input ไม่ถูกต้อง
 * @param allowedRoles - role ที่อ่านได้ ค่าเริ่มต้นคือ ADMIN เท่านั้น
 * @returns GET handler ของ route
 */
export function createAdminReadHandler(
  read: (request: NextRequest) => Promise<unknown>,
  allowedRoles: string[] = ["ADMIN"]
) {
  return async function GET(request: NextRequest) {
    const requesterId = await resolveRequesterId(request);

    if (!requesterId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!allowedRoles.includes((await getUserRole(requesterId)) ?? "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      const result = await read(request);

      return result instanceof NextResponse ? result : NextResponse.json(result);
    } catch (error: any) {
      console.error(`[ERROR] : admin read failed -> ${error.message}`);
      return NextResponse.json({ error: "Read failed" }, { status: 500 });
    }
  };
}

/**
 * สร้าง GET handler สำหรับข้อมูลส่วนตัวของผู้ใช้
 * อนุญาตเฉพาะเจ้าของข้อมูลหรือทีมงาน และ handler จะทำงานหลังตรวจสิทธิ์แล้วเท่านั้น
 *
 * @param read - ฟังก์ชันอ่านข้อมูล คืน NextResponse เองได้เมื่อ input ไม่ถูกต้อง
 * @returns GET handler ของ route
 */
export function createUserReadHandler(
  read: (userId: string, request: NextRequest) => Promise<unknown>
) {
  return async function GET(
    request: NextRequest,
    { params: { userId } }: UserRouteContext
  ) {
    if (!isValidUserId(userId)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const requesterId = await resolveRequesterId(request);

    if (!requesterId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // อ่านข้อมูลตัวเองไม่ต้องดึง role เพื่อลดจำนวน query
    const requesterRole =
      requesterId === userId ? null : await getUserRole(requesterId);

    if (!canReadUserData(requesterId, userId, requesterRole)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await read(userId, request);

    return result instanceof NextResponse ? result : NextResponse.json(result);
  };
}
