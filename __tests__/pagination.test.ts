import { describe, expect, it } from "@jest/globals";
import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  chunkItems,
  escapeLikePattern,
  getPaginationInfo,
  paginateRows,
  toOrIlikeValue,
} from "@/lib/utils/pagination.util";

const rows = Array.from({ length: 25 }, (_, index) => index + 1);

describe("page size options", () => {
  it("offers 10, 20, 30, all and defaults to 10", () => {
    expect(PAGE_SIZE_OPTIONS).toEqual([10, 20, 30, "all"]);
    expect(DEFAULT_PAGE_SIZE).toBe(10);
  });
});

describe("getPaginationInfo", () => {
  it("describes a middle page", () => {
    expect(getPaginationInfo(25, 2, 10)).toEqual({
      page: 2,
      totalPages: 3,
      totalItems: 25,
      startItem: 11,
      endItem: 20,
    });
  });

  it("stops at the last row on the last page", () => {
    expect(getPaginationInfo(25, 3, 10).endItem).toBe(25);
  });

  it("clamps a page past the end, such as after deleting rows", () => {
    expect(getPaginationInfo(25, 9, 10).page).toBe(3);
  });

  it("clamps a page below 1", () => {
    expect(getPaginationInfo(25, 0, 10).page).toBe(1);
  });

  it("handles an empty table", () => {
    expect(getPaginationInfo(0, 3, 10)).toEqual({
      page: 1,
      totalPages: 1,
      totalItems: 0,
      startItem: 0,
      endItem: 0,
    });
  });

  it("treats all as one page", () => {
    expect(getPaginationInfo(25, 4, "all")).toMatchObject({
      page: 1,
      totalPages: 1,
      startItem: 1,
      endItem: 25,
    });
  });
});

describe("paginateRows", () => {
  it("returns the requested page", () => {
    expect(paginateRows(rows, 2, 10)).toEqual(rows.slice(10, 20));
  });

  it("returns the remainder on the last page", () => {
    expect(paginateRows(rows, 2, 20)).toEqual(rows.slice(20));
  });

  it("returns the last page when the page is past the end", () => {
    expect(paginateRows(rows, 9, 10)).toEqual(rows.slice(20));
  });

  it("returns every row for all", () => {
    expect(paginateRows(rows, 2, "all")).toHaveLength(25);
  });

  it("returns nothing for an empty table", () => {
    expect(paginateRows([], 1, 10)).toEqual([]);
  });
});

describe("chunkItems", () => {
  it("keeps order and every item across chunks", () => {
    const chunks = chunkItems(rows, 10);

    expect(chunks.map((chunk) => chunk.length)).toEqual([10, 10, 5]);
    expect(chunks.flat()).toEqual(rows);
  });

  it("returns no chunks for no items", () => {
    expect(chunkItems([], 10)).toEqual([]);
  });
});

describe("escapeLikePattern", () => {
  it("escapes LIKE wildcards", () => {
    expect(escapeLikePattern("50%_a\\b")).toBe("50\\%\\_a\\\\b");
  });

  it("leaves a normal barcode alone", () => {
    expect(escapeLikePattern("8851234567890")).toBe("8851234567890");
  });
});

describe("toOrIlikeValue", () => {
  it("quotes the value so filter syntax stays literal", () => {
    expect(toOrIlikeValue("a,b)")).toBe('"%a,b)%"');
  });

  it("escapes a double quote so it cannot end the value", () => {
    expect(toOrIlikeValue('a"b')).toBe('"%a\\"b%"');
  });
});
