import { describe, expect, it } from "@jest/globals";
import {
  canReadUserData,
  isValidUserId,
  parseDateFilter,
} from "@/lib/utils/route-access.util";

describe("canReadUserData", () => {
  it("allows owners to read their own data", () => {
    expect(canReadUserData("u1", "u1", null)).toBe(true);
  });

  it("allows staff to read other users", () => {
    expect(canReadUserData("a", "u1", "ADMIN")).toBe(true);
    expect(canReadUserData("b", "u1", "BILL_MANAGEMENT")).toBe(true);
  });

  it("rejects other customers", () => {
    expect(canReadUserData("u2", "u1", "USER")).toBe(false);
    expect(canReadUserData("u2", "u1", null)).toBe(false);
  });
});

describe("isValidUserId", () => {
  it("accepts LINE and Supabase ids", () => {
    expect(isValidUserId("U4af4980629")).toBe(true);
    expect(isValidUserId("6d5f1a2e-1111-2222-3333-444455556666")).toBe(true);
  });

  it("rejects empty and oversized ids", () => {
    expect(isValidUserId("")).toBe(false);
    expect(isValidUserId("x".repeat(101))).toBe(false);
  });
});

describe("parseDateFilter", () => {
  it("returns an empty filter when no dates are given", () => {
    expect(parseDateFilter(new URLSearchParams())).toEqual({});
  });

  it("accepts ISO datetimes", () => {
    const from = "2026-01-01T00:00:00.000Z";

    expect(parseDateFilter(new URLSearchParams({ from }))).toEqual({ from });
  });

  it("rejects malformed dates", () => {
    expect(parseDateFilter(new URLSearchParams({ from: "x' OR 1=1" }))).toBeNull();
  });
});
