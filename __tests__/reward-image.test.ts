import { describe, expect, it } from "@jest/globals";
import { getRewardImageUrl } from "@/lib/utils/reward-image.util";

describe("getRewardImageUrl", () => {
  it("returns a stable URL so browsers can cache customer images", () => {
    expect(getRewardImageUrl(7)).toBe(getRewardImageUrl(7));
    expect(getRewardImageUrl(7)).toMatch(
      /\/storage\/v1\/object\/public\/rewards\/7\.png$/
    );
  });

  it("appends the cache buster when one is given", () => {
    expect(getRewardImageUrl(7, 123)).toMatch(/7\.png\?v=123$/);
  });

  it("keeps a cache buster of zero", () => {
    expect(getRewardImageUrl(7, 0)).toMatch(/\?v=0$/);
  });
});
