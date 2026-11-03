import { describe, expect, it } from "@jest/globals";
import {
  buildProductExportFileName,
  buildProductExportRows,
  toExcelBangkokDate,
} from "@/features/products/helpers/product-export.helper";
import { ADD_PRODUCT_METHOD } from "@/models/enums/product.enum";
import { ProductWithScanner } from "@/models/product.model";

/** สร้างสินค้าตัวอย่าง ทับค่าบางช่องได้ */
function makeProduct(overrides: Partial<ProductWithScanner> = {}): ProductWithScanner {
  return {
    id: "8850000000001",
    created_at: "2026-11-01T17:30:00.000Z",
    updated_at: "2026-11-02T03:00:00.000Z",
    method: ADD_PRODUCT_METHOD.CSV,
    product_type_id: 1,
    updated_by_user_id: null,
    bill_id: null,
    full_name: "สมชาย ใจดี",
    bill_no: "B-001",
    ...overrides,
  };
}

describe("toExcelBangkokDate", () => {
  it("shifts UTC time to Bangkok wall-clock time", () => {
    const date = toExcelBangkokDate("2026-11-01T17:30:00.000Z");

    expect(date?.toISOString()).toBe("2026-11-02T00:30:00.000Z");
  });

  it("returns null for empty or invalid values", () => {
    expect(toExcelBangkokDate(null)).toBeNull();
    expect(toExcelBangkokDate("")).toBeNull();
    expect(toExcelBangkokDate("not a date")).toBeNull();
  });
});

describe("buildProductExportRows", () => {
  const titles = new Map([[1, "กระเบื้องพื้น"]]);

  it("maps every column in table order with running index", () => {
    const rows = buildProductExportRows(
      [makeProduct(), makeProduct({ id: "8850000000002" })],
      titles
    );

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      index: 1,
      id: "8850000000001",
      productType: "กระเบื้องพื้น",
      billNo: "B-001",
      method: ADD_PRODUCT_METHOD.CSV,
      scannerName: "สมชาย ใจดี",
    });
    expect(rows[1].index).toBe(2);
  });

  it("fills placeholders for missing bill, scanner and product type", () => {
    const [row] = buildProductExportRows(
      [
        makeProduct({
          bill_no: null,
          full_name: null as unknown as string,
          product_type_id: null,
        }),
      ],
      titles
    );

    expect(row.billNo).toBe("ไม่มีเลขบิล");
    expect(row.scannerName).toBe("ยังไม่ถูกสแกน");
    expect(row.productType).toBe("-");
  });

  it("shows the type id when the title is unknown", () => {
    const [row] = buildProductExportRows([makeProduct({ product_type_id: 99 })], titles);

    expect(row.productType).toBe("#99");
  });
});

describe("buildProductExportFileName", () => {
  const now = new Date("2026-11-03T02:05:00.000Z");

  it("uses Bangkok time without a search term", () => {
    expect(buildProductExportFileName("", now)).toBe("products_2026-11-03_0905.xlsx");
  });

  it("strips characters that are not allowed in file names", () => {
    expect(buildProductExportFileName(' a/b:c "d" ', now)).toBe(
      "products_a_b_c_d__2026-11-03_0905.xlsx"
    );
  });
});
