import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NextRequest, NextResponse } from "next/server";
import { getThaiMonthRange } from "@/features/dashboard/dashboard.queries";
import { createAdminReadHandler, requireAdminSession } from "@/lib/route-auth";
import { preventUnauthorizedUser } from "@/actions/util.action";

const mockGetUser = jest.fn<(token: string) => Promise<any>>();
const mockMaybeSingle = jest.fn<() => Promise<any>>();
const mockCookieGet = jest.fn<(name: string) => { value: string } | undefined>();
const mockFetchUserInfo = jest.fn<(input: { user_id: string }) => Promise<any>>();

jest.mock("@/lib/supabase", () => ({
  supabaseAdminClient: {
    auth: { getUser: (token: string) => mockGetUser(token) },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: () => mockMaybeSingle() }) }),
    }),
  },
}));

jest.mock("@/actions/auth.action", () => ({
  getLineUser: jest.fn(),
  getLineUserProfile: jest.fn(),
}));

jest.mock("@/actions/queries/users.action", () => ({
  fetchUserInfo: (input: { user_id: string }) => mockFetchUserInfo(input),
}));

jest.mock("next/headers", () => ({
  cookies: () => ({ get: (name: string) => mockCookieGet(name) }),
  headers: jest.fn(),
}));

/** เรียก handler ของ admin ด้วย token ที่กำหนด */
function callAdminRoute(read: () => Promise<unknown>, bearer?: string) {
  const headers = new Headers();

  if (bearer) headers.set("authorization", `Bearer ${bearer}`);

  return createAdminReadHandler(read)(
    new NextRequest("http://localhost/api/admin/dashboard", { headers })
  );
}

describe("createAdminReadHandler", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
  });

  it("rejects anonymous callers before reading data", async () => {
    const read = jest.fn(async () => ({}));

    expect((await callAdminRoute(read)).status).toBe(401);
    expect(read).not.toHaveBeenCalled();
  });

  it.each(["USER", "BILL_MANAGEMENT", null])("rejects role %s", async (role) => {
    mockMaybeSingle.mockResolvedValue({ data: { role_title: role } });
    const read = jest.fn(async () => ({}));

    expect((await callAdminRoute(read, "token")).status).toBe(403);
    expect(read).not.toHaveBeenCalled();
  });

  it("returns data to admins", async () => {
    mockMaybeSingle.mockResolvedValue({ data: { role_title: "ADMIN" } });

    const response = await callAdminRoute(async () => ({ total: 1 }), "token");

    expect(await response.json()).toEqual({ total: 1 });
  });

  it("lets a listed extra role read", async () => {
    mockMaybeSingle.mockResolvedValue({ data: { role_title: "BILL_MANAGEMENT" } });

    const response = await createAdminReadHandler(
      async () => ({ total: 1 }),
      ["ADMIN", "BILL_MANAGEMENT"]
    )(
      new NextRequest("http://localhost/api/admin/bills", {
        headers: { authorization: "Bearer token" },
      })
    );

    expect(response.status).toBe(200);
  });

  it("passes a response from the read function through unchanged", async () => {
    mockMaybeSingle.mockResolvedValue({ data: { role_title: "ADMIN" } });

    const response = await callAdminRoute(
      async () => NextResponse.json({ error: "Invalid query" }, { status: 400 }),
      "token"
    );

    expect(response.status).toBe(400);
  });

  it("hides read errors from the response", async () => {
    mockMaybeSingle.mockResolvedValue({ data: { role_title: "ADMIN" } });

    const response = await callAdminRoute(async () => {
      throw new Error("db password");
    }, "token");

    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("db password");
  });
});

describe("requireAdminSession", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("rejects a caller without cookies", async () => {
    await expect(requireAdminSession()).rejects.toThrow();
  });

  it("rejects a non-admin", async () => {
    mockCookieGet.mockReturnValue({ value: "token" });
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    mockMaybeSingle.mockResolvedValue({ data: { role_title: "USER" } });

    await expect(requireAdminSession()).rejects.toThrow();
  });

  it("accepts an admin", async () => {
    mockCookieGet.mockReturnValue({ value: "token" });
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    mockMaybeSingle.mockResolvedValue({ data: { role_title: "ADMIN" } });

    await expect(requireAdminSession()).resolves.toBeUndefined();
  });

  it("accepts a listed extra role and still rejects it by default", async () => {
    mockCookieGet.mockReturnValue({ value: "token" });
    mockGetUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });
    mockMaybeSingle.mockResolvedValue({ data: { role_title: "BILL_MANAGEMENT" } });

    await expect(
      requireAdminSession(["ADMIN", "BILL_MANAGEMENT"])
    ).resolves.toBeUndefined();
    await expect(requireAdminSession()).rejects.toThrow();
  });
});

describe("preventUnauthorizedUser", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("rejects a missing user instead of letting them through", async () => {
    await expect(preventUnauthorizedUser({ id: "" })).rejects.toThrow();
  });

  it("rejects a non-admin email user", async () => {
    mockFetchUserInfo.mockResolvedValue({
      data: { data: { role_title: "USER" } },
    });

    await expect(preventUnauthorizedUser({ id: "email-user" })).rejects.toThrow();
  });

  it("accepts an admin", async () => {
    mockFetchUserInfo.mockResolvedValue({
      data: { data: { role_title: "ADMIN" } },
    });

    await expect(preventUnauthorizedUser({ id: "a1" })).resolves.toBeUndefined();
  });
});

describe("getThaiMonthRange", () => {
  it("uses the Thai month near a UTC month boundary", () => {
    // 20:00 UTC วันที่ 31 ต.ค. คือวันที่ 1 พ.ย. ตามเวลาไทย
    expect(getThaiMonthRange(new Date("2026-10-31T20:00:00.000Z"))).toEqual({
      start: "2026-11-01T00:00:00.000Z",
      end: "2026-12-01T00:00:00.000Z",
    });
  });
});
