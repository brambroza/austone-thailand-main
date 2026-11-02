import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NextRequest } from "next/server";
import { createUserReadHandler } from "@/lib/route-auth";
import {
  canReadUserData,
  isValidUserId,
  parseDateFilter,
} from "@/lib/utils/route-access.util";
import { createLineSession } from "@/lib/line-session";
import { getRewardImageUrl } from "@/lib/utils/reward-image.util";

const mockGetUser = jest.fn<(token: string) => Promise<any>>();
const mockMaybeSingle = jest.fn<() => Promise<any>>();
const mockGetLineUserProfile = jest.fn<(token: string) => Promise<any>>();

jest.mock("@/lib/supabase", () => ({
  supabaseAdminClient: {
    auth: { getUser: (token: string) => mockGetUser(token) },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: () => mockMaybeSingle() }) }),
    }),
  },
}));

jest.mock("@/actions/auth.action", () => ({
  getLineUserProfile: (token: string) => mockGetLineUserProfile(token),
}));

/** เรียก handler ของ route ด้วย header หรือ cookie ที่กำหนด */
function callRoute(
  targetUserId: string,
  init: { bearer?: string; lineCookie?: string; search?: string } = {}
) {
  const read = jest.fn(async () => ({ data: "secret" }));
  const headers = new Headers();

  if (init.bearer) headers.set("authorization", `Bearer ${init.bearer}`);
  if (init.lineCookie) headers.set("cookie", `line_id_token=${init.lineCookie}`);

  const request = new NextRequest(
    `http://localhost/api/users/${targetUserId}${init.search ?? ""}`,
    { headers }
  );

  return {
    read,
    response: createUserReadHandler(read)(request, {
      params: { userId: targetUserId },
    }),
  };
}

describe("createUserReadHandler", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error() });
  });

  it("rejects callers without credentials", async () => {
    const { read, response } = callRoute("user-1");

    expect((await response).status).toBe(401);
    expect(read).not.toHaveBeenCalled();
  });

  it("rejects an invalid or expired token", async () => {
    const { read, response } = callRoute("user-1", { bearer: "expired" });

    expect((await response).status).toBe(401);
    expect(read).not.toHaveBeenCalled();
  });

  it("rejects an invalid user id before checking credentials", async () => {
    const { response } = callRoute("x".repeat(101), { bearer: "token" });

    expect((await response).status).toBe(400);
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it("lets an email user read their own data", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });

    const { response } = callRoute("user-1", { bearer: "token" });
    const result = await response;

    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ data: "secret" });
  });

  it("lets a LINE user read their own data", async () => {
    mockGetLineUserProfile.mockResolvedValue({ data: { sub: "U123" } });

    const { response } = callRoute("U123", { lineCookie: "line-token" });

    expect((await response).status).toBe(200);
  });

  it("treats a failed LINE verification as unauthenticated", async () => {
    mockGetLineUserProfile.mockRejectedValue(new Error("expired"));

    const { read, response } = callRoute("U123", { lineCookie: "line-token" });

    expect((await response).status).toBe(401);
    expect(read).not.toHaveBeenCalled();
  });

  it("blocks a customer from reading another user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    mockMaybeSingle.mockResolvedValue({ data: { role_title: "USER" } });

    const { read, response } = callRoute("user-2", { bearer: "token" });

    expect((await response).status).toBe(403);
    expect(read).not.toHaveBeenCalled();
  });

  it("lets staff read another user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "admin-1" } }, error: null });
    mockMaybeSingle.mockResolvedValue({ data: { role_title: "ADMIN" } });

    const { response } = callRoute("user-2", { bearer: "token" });

    expect((await response).status).toBe(200);
  });
});

describe("canReadUserData", () => {
  it("allows owners and staff only", () => {
    expect(canReadUserData("a", "a", null)).toBe(true);
    expect(canReadUserData("a", "b", "ADMIN")).toBe(true);
    expect(canReadUserData("a", "b", "BILL_MANAGEMENT")).toBe(true);
    expect(canReadUserData("a", "b", "USER")).toBe(false);
    expect(canReadUserData("a", "b", null)).toBe(false);
  });
});

describe("isValidUserId", () => {
  it("rejects empty and oversized ids", () => {
    expect(isValidUserId("U123")).toBe(true);
    expect(isValidUserId("")).toBe(false);
    expect(isValidUserId("x".repeat(101))).toBe(false);
  });
});

describe("parseDateFilter", () => {
  it("accepts ISO dates and missing values", () => {
    const from = "2026-01-01T00:00:00.000Z";

    expect(parseDateFilter(new URLSearchParams({ from }))).toEqual({
      from,
      to: undefined,
    });
    expect(parseDateFilter(new URLSearchParams())).toEqual({
      from: undefined,
      to: undefined,
    });
  });

  it("rejects malformed dates", () => {
    expect(parseDateFilter(new URLSearchParams({ from: "' OR 1=1" }))).toBeNull();
  });
});

describe("getRewardImageUrl", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID = "project";
  });

  it("returns a stable cacheable URL by default", () => {
    expect(getRewardImageUrl(5)).toBe(
      "https://project.supabase.co/storage/v1/object/public/rewards/5.png"
    );
  });

  it("appends the cache buster when given", () => {
    expect(getRewardImageUrl(5, 123)).toMatch(/5\.png\?v=123$/);
  });
});

describe("line session cookie", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    process.env.LINE_CHANNEL_SECRET = "test-secret";
  });

  /** เรียก route ด้วย cookie session ที่กำหนด */
  function callWithSession(targetUserId: string, session: string) {
    return createUserReadHandler(async () => ({ data: "secret" }))(
      new NextRequest(`http://localhost/api/users/${targetUserId}`, {
        headers: new Headers({ cookie: `line_session=${session}` }),
      }),
      { params: { userId: targetUserId } }
    );
  }

  it("authorizes the owner without calling LINE", async () => {
    const session = createLineSession({
      sub: "U123",
      name: "a",
      picture: "",
      email: "",
    });

    expect((await callWithSession("U123", session)).status).toBe(200);
    expect(mockGetLineUserProfile).not.toHaveBeenCalled();
  });

  it("rejects a forged session", async () => {
    expect((await callWithSession("U123", "forged.value")).status).toBe(401);
  });
});
