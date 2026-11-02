/* import axios from "axios";
import { createSafeActionClient } from "next-safe-action";
import { cookies } from "next/headers";

const LINE_AUTH_TOKEN_COOKIE_NAME = "line_id_token";
const LINE_BASE_URL = "https://api.line.me/oauth2/v2.1";

export const safeActionClient = createSafeActionClient({});

export const authSafeActionClient = createSafeActionClient({
  handleServerError(e, utils) {
    console.error("SAFE_ACTION_SERVER_ERROR", {
      message: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
      clientInput: utils.clientInput,
      ctx: utils.ctx,
      metadata: utils.metadata,
    });

 
    throw e;
  },
}).use(
  async ({ next }) => {
    const lineTokenId = cookies().get(LINE_AUTH_TOKEN_COOKIE_NAME);

    const { data: lineUser } = await axios.post(
      `${LINE_BASE_URL}/verify`,
      {
        id_token: lineTokenId?.value,
        client_id: process.env.NEXT_PUBLIC_LINE_CHANNEL_ID!,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!lineUser) throw new Error("กรุณาเข้าสู่ระบบก่อนดำเนินการ");

    return next({ ctx: { lineUser } });
  }
);


 */
import axios from "axios";
import { createSafeActionClient } from "next-safe-action";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const LINE_AUTH_TOKEN_COOKIE_NAME = "line_id_token";
const LINE_BASE_URL = "https://api.line.me/oauth2/v2.1";

export const safeActionClient = createSafeActionClient({});

export const authSafeActionClient = createSafeActionClient({
  handleServerError(e, utils) {
    console.error("SAFE_ACTION_SERVER_ERROR", {
      message: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
      clientInput: utils.clientInput,
      ctx: utils.ctx,
      metadata: utils.metadata,
    });

    return e instanceof Error ? e.message : "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
  },
}).use(async ({ next, clientInput }) => {
  const cookieStore = cookies();

  // 1) LINE Login
  const lineTokenId = cookieStore.get(LINE_AUTH_TOKEN_COOKIE_NAME)?.value;

  if (lineTokenId) {
    try {
      const body = new URLSearchParams({
        id_token: lineTokenId,
        client_id: process.env.NEXT_PUBLIC_LINE_CHANNEL_ID!,
      });

      const { data: lineUser } = await axios.post(
        `${LINE_BASE_URL}/verify`,
        body,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (lineUser?.sub) {
        return next({
          ctx: {
            user: {
              id: lineUser.sub,
              provider: "line",
              email: lineUser.email ?? null,
              name: lineUser.name ?? null,
            },
            lineUser,
            emailUser: null,
          },
        });
      }
    } catch (error) {
      console.error("LINE_VERIFY_FAILED");
    }
  }

  // 2) Email Login จาก Supabase cookie
  /*  const accessToken =
     typeof clientInput === "object" &&
       clientInput !== null &&
       "access_token" in clientInput
       ? String((clientInput as any).access_token)
       : undefined; */

  const accessToken = cookies().get("supabase_access_token")?.value;

  if (accessToken) {
    const supabaseUrl = `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co`;
    const supabaseSecretKey = process.env.SUPABASE_SERVICE_KEY;

    const supabase = createClient(
      supabaseUrl,
      supabaseSecretKey!
    );

    const {
      data: { user: emailUser },
      error,
    } = await supabase.auth.getUser(accessToken);

    if (!error && emailUser) {
      return next({
        ctx: {
          user: {
            id: emailUser.id,
            provider: "email",
            email: emailUser.email ?? null,
            name: emailUser.email ?? null,
          },
          lineUser: null,
          emailUser,
        },
      });
    }
  }

  throw new Error("กรุณาเข้าสู่ระบบก่อนดำเนินการ");
});