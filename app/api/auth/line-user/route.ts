import { getLineUser } from "@/actions/auth.action";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** คืนข้อมูลผู้ใช้ LINE จาก cookie ของผู้เรียก หรือ null เมื่อยังไม่ได้เข้าสู่ระบบ */
export async function GET() {
  return NextResponse.json(await getLineUser());
}
