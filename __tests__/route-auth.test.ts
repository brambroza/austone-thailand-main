import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NextRequest } from "next/server";

const getUser = jest.fn<(token: string) => Promise<any>>();
const maybeSingle = jest.fn<() => Promise<any>>();
const getLineUserProfile = jest.fn<(token: string) => Promise<any>>();

jest.mock("@/lib/supabase", () => ({
  supabaseAdminClient: {
    auth: { getUser: (token: string) => getUser(token) },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: () => maybeSingle() }) }),
    }),
  },
}));

jest.mock("@/actions/auth.action", () => ({
  getLineUserProfile: (token: string) => getLineUserProfile(token),
}));

import { createUserReadHandler } from "@/lib/route-auth";

const read = jest.fn<() => Promise<unknown>>();
const handler = createUserReadHandler(read as any);

function callHandler(userId: string, headers: Record<string, string> = {}) {
  return handler(new NextRequest("http://test.local/api", { headers }), {
    params: { userId },
  });
}

describe("createUserReadHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    read.mockResolvedValue({ data: "secret" });
    getUser.mockResolvedValue({ data: { user: null }, error: new Error("x") });
  });

  it("returns 401 and never reads when no credentials are sent", async () => {
    const response = await callHandler("u1");

    expect(response.status).toBe(401);
    expect(read).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid user id", async () => {
    expect((await callHandler("")).status).toBe(400);
  });

  it("lets an email user read their own data without a role lookup", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } }, error: null });

    const response = await callHandler("u1", { authorization: "Bearer t" });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: "secret" });
    expect(maybeSingle).not.toHaveBeenCalled();
  });

  it("lets a LINE user read their own data", async () => {
    getLineUserProfile.mockResolvedValue({ data: { sub: "u1" } });

    const response = await callHandler("u1", { cookie: "line_id_token=abc" });

    expect(response.status).toBe(200);
  });

  it("returns 401 when the LINE token cannot be verified", async () => {
    getLineUserProfile.mockRejectedValue(new Error("expired"));

    const response = await callHandler("u1", { cookie: "line_id_token=abc" });

    expect(response.status).toBe(401);
  });

  it("returns 403 when a customer reads another user", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u2" } }, error: null });
    maybeSingle.mockResolvedValue({ data: { role_title: "USER" } });

    const response = await callHandler("u1", { authorization: "Bearer t" });

    expect(response.status).toBe(403);
    expect(read).not.toHaveBeenCalled();
  });

  it("lets an admin read another user", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "a" } }, error: null });
    maybeSingle.mockResolvedValue({ data: { role_title: "ADMIN" } });

    const response = await callHandler("u1", { authorization: "Bearer t" });

    expect(response.status).toBe(200);
  });
});
