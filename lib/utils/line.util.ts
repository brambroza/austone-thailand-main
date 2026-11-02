import { generateLineOAuthUrl } from "@/actions/auth.action";
import { AxiosError, isAxiosError } from "axios";

export type LineResponseError = {
  error: string;
  error_description: string;
};

export function isOfTypeLineResponseError(
  error: unknown
): error is AxiosError<LineResponseError> {
  if (!isAxiosError(error)) return false;

  if (!error.response?.data) return false;

  const errorData = error.response.data;

  return (
    Object.keys(errorData).includes("error") &&
    Object.keys(errorData).includes("error_description")
  );
}

export function getLineResponseErrorMessage(error: unknown): string {
  const defaultErrorMessage = "ล้มเหลวในการเข้าสู่ระบบด้วย Line";

  if (!isOfTypeLineResponseError(error)) {
    return defaultErrorMessage;
  }

  return error.response?.data.error_description ?? defaultErrorMessage;
}

export async function navigateUserToLineLogIn() {
  const { data: lineOAuthUrl } = await generateLineOAuthUrl(
    `${window.location.origin}/auth/callback/line`
  );

  if (lineOAuthUrl) {
    window.location.assign(lineOAuthUrl);
  }
}
