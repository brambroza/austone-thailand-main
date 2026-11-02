import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { apiGet } from "@/lib/utils/api-client.util";

const mockGetSession = jest.fn<() => Promise<any>>();
const mockFetch = jest.fn<typeof fetch>();

jest.mock("@/lib/anon-supabase", () => ({
  supabaseAnonClient: { auth: { getSession: () => mockGetSession() } },
}));

describe("apiGet", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = mockFetch;
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockFetch.mockResolvedValue(new Response(JSON.stringify({ ok: true })));
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("drops empty query values", async () => {
    await apiGet("/api/test", { from: "a", to: undefined, other: "" });

    expect(mockFetch.mock.calls[0][0]).toBe("/api/test?from=a");
  });

  it("sends the current Supabase session as a bearer token", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "fresh-token" } },
    });

    await apiGet("/api/test");

    expect(mockFetch.mock.calls[0][1]?.headers).toEqual({
      Authorization: "Bearer fresh-token",
    });
  });

  it("omits the auth header for LINE users", async () => {
    await apiGet("/api/test");

    expect(mockFetch.mock.calls[0][1]?.headers).toBeUndefined();
  });

  it("throws on a failed response so React Query stops loading", async () => {
    mockFetch.mockResolvedValue(new Response("{}", { status: 500 }));

    await expect(apiGet("/api/test")).rejects.toThrow();
  });
});
