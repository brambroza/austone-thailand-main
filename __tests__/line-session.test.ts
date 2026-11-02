import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  LINE_SESSION_MAX_AGE_SECONDS,
  createLineSession,
  verifyLineSession,
} from "@/lib/line-session";

const LINE_USER = {
  sub: "U123",
  name: "สมชาย",
  picture: "https://a.com/p.png",
  email: "a@a.com",
};

describe("line session", () => {
  beforeEach(() => {
    process.env.LINE_CHANNEL_SECRET = "test-secret";
  });

  it("round-trips a user including Thai names", () => {
    expect(verifyLineSession(createLineSession(LINE_USER))).toEqual(LINE_USER);
  });

  it("rejects missing or malformed values", () => {
    expect(verifyLineSession(undefined)).toBeNull();
    expect(verifyLineSession("garbage")).toBeNull();
    expect(verifyLineSession("a.b.c")).toBeNull();
  });

  it("rejects a forged user id", () => {
    const [, signature] = createLineSession(LINE_USER).split(".");
    const forged = Buffer.from(
      JSON.stringify({ sub: "ADMIN", exp: Date.now() + 1000 })
    ).toString("base64url");

    expect(verifyLineSession(`${forged}.${signature}`)).toBeNull();
  });

  it("rejects a session signed with another secret", () => {
    const session = createLineSession(LINE_USER);

    process.env.LINE_CHANNEL_SECRET = "other-secret";

    expect(verifyLineSession(session)).toBeNull();
  });

  it("rejects an expired session", () => {
    const issuedAt = 1_000_000;
    const session = createLineSession(LINE_USER, issuedAt);
    const maxAgeMs = LINE_SESSION_MAX_AGE_SECONDS * 1000;

    expect(verifyLineSession(session, issuedAt + maxAgeMs - 1)).not.toBeNull();
    expect(verifyLineSession(session, issuedAt + maxAgeMs)).toBeNull();
  });
});
