import { describe, expect, it } from "@jest/globals";
import { buildSupabaseAccessTokenCookie } from "@/lib/utils/supabase-cookie.util";

describe("buildSupabaseAccessTokenCookie", () => {
  it("writes the token for 7 days", () => {
    expect(buildSupabaseAccessTokenCookie("abc.def", false)).toBe(
      "supabase_access_token=abc.def; path=/; max-age=604800; SameSite=Lax"
    );
  });

  it("adds Secure on https", () => {
    expect(buildSupabaseAccessTokenCookie("abc", true)).toMatch(/; Secure$/);
  });

  it("expires the cookie when there is no token", () => {
    expect(buildSupabaseAccessTokenCookie(null, false)).toBe(
      "supabase_access_token=; path=/; max-age=0; SameSite=Lax"
    );
  });
});
