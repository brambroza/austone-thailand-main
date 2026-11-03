import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const queryResult: { data: unknown; error: { message: string } | null } = {
  data: [],
  error: null,
};
const inMock = jest.fn();

jest.mock("@/lib/supabase", () => ({
  supabaseAdminClient: {
    from: () => ({
      select: () => ({
        in: (...args: unknown[]) => {
          inMock(...args);
          return { returns: async () => queryResult };
        },
      }),
    }),
  },
}));

import { findNotCollectableProductIds } from "@/features/products/helpers/product-point-eligibility";

describe("findNotCollectableProductIds", () => {
  beforeEach(() => {
    inMock.mockClear();
    queryResult.data = [];
    queryResult.error = null;
  });

  it("returns only products whose type has collecting turned off", async () => {
    queryResult.data = [
      { id: "A", product_type: { can_collect_points: false } },
      { id: "B", product_type: { can_collect_points: true } },
      { id: "C", product_type: { can_collect_points: null } },
      { id: "D", product_type: null },
    ];

    await expect(findNotCollectableProductIds(["A", "B", "C", "D"])).resolves.toEqual(["A"]);
  });

  it("skips the query for an empty list and removes duplicates", async () => {
    await expect(findNotCollectableProductIds([])).resolves.toEqual([]);
    expect(inMock).not.toHaveBeenCalled();

    await findNotCollectableProductIds(["A", "A", ""]);
    expect(inMock).toHaveBeenCalledWith("id", ["A"]);
  });

  it("throws when the database query fails", async () => {
    queryResult.error = { message: "boom" };

    await expect(findNotCollectableProductIds(["A"])).rejects.toThrow("boom");
  });
});
