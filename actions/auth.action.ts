"use server";
import { LINE_CLIENT_ID } from "@/config/env.config";
import { joinLineOAuthScopes } from "@/lib/utils/auth.util";
import { getLineResponseErrorMessage } from "@/lib/utils/line.util";
import { ServerActionResponse } from "@/models/api.model";
import { LineUser } from "@/models/user.model";
import axios from "axios";
import { StatusCodes } from "http-status-codes";
import { cookies } from "next/headers";
import { v4 } from "uuid";
import { getRequestOriginUrl, setCookie } from "./util.action";

const LINE_AUTH_TOKEN_COOKIE_NAME = "line_id_token";
const LINE_AUTH_URL = "https://access.line.me/oauth2/v2.1/authorize";
const LINE_BASE_URL = "https://api.line.me/oauth2/v2.1";

export async function getLineTokenId() {
  return cookies().get(LINE_AUTH_TOKEN_COOKIE_NAME);
}

export async function getLineUser(): Promise<LineUser | null> {
  try {
    const tokenId = await getLineTokenId();

    if (tokenId) {
      const { data: user } = await getLineUserProfile(tokenId.value);
      return user;
    } else {
      return null;
    }
  } catch (error: any) {
    console.error(
      `[ERROR] : ล้มเหลวระหว่างการดึงข้อมูลผู้ใช้งานด้วย Line -> ${error.message}`
    );
    return null;
  }
}

export async function signOutLineUser() {
  try {
    const tokenId = cookies().get(LINE_AUTH_TOKEN_COOKIE_NAME);

    if (tokenId) await lineUserSignOut();
  } catch (error: any) {
    console.error(
      `[ERROR] : ล้มเหลวระหว่างการออกจากระบบด้วย Line -> ${error.message}`
    );
    throw new Error("ล้มเหลวระหว่างการออกจากระบบด้วย Line");
  }
}

export async function signInLineUser(lineIdToken: string) {
  if (!lineIdToken) throw new Error("Line ID token is required");

  setCookie(LINE_AUTH_TOKEN_COOKIE_NAME, lineIdToken);
}

export async function generateLineOAuthUrl(
  redirectUrl: string,
  scopes: string[] = ["profile", "openid", "email"]
): Promise<ServerActionResponse<string>> {
  if (!redirectUrl) throw new Error("Redirect URL is required");

  const randomState = v4();

  const url = `${LINE_AUTH_URL}?response_type=code&client_id=${LINE_CLIENT_ID}&redirect_uri=${redirectUrl}&state=${randomState}&scope=${joinLineOAuthScopes(
    scopes
  )}`;

  return {
    data: url,
    isError: false,
    error: "",
  };
}

export async function retrieveLineIdToken(authorizationCode: string) {
  try {
    const redirectUri = `${await getRequestOriginUrl()}/auth/callback/line`;

    const {
      data: { id_token },
      status,
    } = await axios.post(
      `${LINE_BASE_URL}/token`,
      {
        grant_type: "authorization_code",
        code: authorizationCode,
        client_id: process.env.NEXT_PUBLIC_LINE_CHANNEL_ID!,
        client_secret: process.env.LINE_CHANNEL_SECRET!,
        redirect_uri: redirectUri,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return { id_token, status };
  } catch (error: any) {
    console.error(
      `ล้มเหลวระหว่างการดึงข้อมูล Line ID Token -> ${getLineResponseErrorMessage(
        error
      )} (parameters : ${JSON.stringify({
        authorizationCode,
      })})`
    );
    return { data: null, status: StatusCodes.INTERNAL_SERVER_ERROR };
  }
}

export async function getLineUserProfile(idToken: any): Promise<{
  data: LineUser;
  status: number;
}> {
  try {
    const { data, status } = await axios.post(
      `${LINE_BASE_URL}/verify`,
      {
        id_token: idToken,
        client_id: process.env.NEXT_PUBLIC_LINE_CHANNEL_ID!,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return { data, status };
  } catch (error: any) {
    console.error(getLineResponseErrorMessage(error));
    throw new Error("ล้มเหลวในการดึงข้อมูลผู้ใช้งานด้วย Line");
  }
}

export async function lineUserSignOut() {
  try {
    cookies().delete(LINE_AUTH_TOKEN_COOKIE_NAME);
  } catch (error: any) {
    console.error(getLineResponseErrorMessage(error));
    throw new Error("ล้มเหลวระหว่างการออกจากระบบด้วย Line");
  }
}
