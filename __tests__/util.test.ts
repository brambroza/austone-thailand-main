import { getCalendarDateFromDate } from "@/lib/utils/date.util";
import { describe, expect, it } from "@jest/globals";
import { isBarcodeValid } from "@/features/scanned-barcodes/helpers/barcode.helper";

describe("isBarcodeValid", () => {
  describe("PCR (半钢) format validation", () => {
    it("should return true for valid 8-digit PCR barcodes", () => {
      expect(isBarcodeValid("04007591488")).toBe(true);
      expect(isBarcodeValid("90000000")).toBe(true);
      expect(isBarcodeValid("99999999")).toBe(true);
    });

    it("should return false for invalid 8-digit PCR barcodes", () => {
      expect(isBarcodeValid("81234567")).toBe(false);
      expect(isBarcodeValid("9000000a")).toBe(false);
      expect(isBarcodeValid("9999999")).toBe(false);
    });
  });

  describe("Invalid formats", () => {
    it("should return false for empty strings", () => {
      expect(isBarcodeValid("")).toBe(false);
    });

    it("should return false for strings with non-numeric characters", () => {
      expect(isBarcodeValid("1234a5678")).toBe(false);
      expect(isBarcodeValid("abcd12345")).toBe(false);
      expect(isBarcodeValid("12-345678")).toBe(false);
      expect(isBarcodeValid("12.345678")).toBe(false);
    });

    it("should return false for invalid TBR prefixes", () => {
      expect(isBarcodeValid("02123456789")).toBe(false);
      expect(isBarcodeValid("05123456789")).toBe(false);
      expect(isBarcodeValid("00123456789")).toBe(false);
    });

    it("should return false for invalid lengths", () => {
      expect(isBarcodeValid("1234567")).toBe(false); // 7 digits
      expect(isBarcodeValid("123456789")).toBe(false); // 9 digits
      expect(isBarcodeValid("12345678901")).toBe(false); // 11 digits but invalid prefix
      expect(isBarcodeValid("123456789012")).toBe(false); // 12 digits
    });
  });
});

describe("getCalendarDateFromDate", () => {
  it("should convert Date to CalendarDate correctly", () => {
    const testDate = new Date(2024, 0, 15);
    const result = getCalendarDateFromDate(testDate);

    expect(result.year).toBe(2024);
    expect(result.month).toBe(1);
    expect(result.day).toBe(15);
  });
});
