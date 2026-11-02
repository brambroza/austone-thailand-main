import { describe, expect, it } from "@jest/globals";
import {
  buildExternalBrowserUrl,
  buildOpenInChromeUrl,
} from "@/lib/utils/open-in-browser.util";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Line/14.0";
const ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 8) Line/14.0";

describe("buildOpenInChromeUrl", () => {
  it("uses googlechromes for https on iOS and keeps the path", () => {
    expect(buildOpenInChromeUrl("https://a.com/user/points?x=1", IPHONE)).toBe(
      "googlechromes://a.com/user/points?x=1"
    );
  });

  it("uses googlechrome for http on iOS", () => {
    expect(buildOpenInChromeUrl("http://a.com/", IPHONE)).toBe(
      "googlechrome://a.com/"
    );
  });

  it("uses an intent URL with a fallback on Android", () => {
    const url = buildOpenInChromeUrl("https://a.com/user/points", ANDROID);

    expect(url).toContain("intent://a.com/user/points#Intent;scheme=https;");
    expect(url).toContain("package=com.android.chrome;");
    expect(url).toContain(
      "S.browser_fallback_url=https%3A%2F%2Fa.com%2Fuser%2Fpoints;"
    );
  });
});

describe("buildExternalBrowserUrl", () => {
  it("adds the parameter and keeps the existing query", () => {
    expect(buildExternalBrowserUrl("https://a.com/p?x=1")).toBe(
      "https://a.com/p?x=1&openExternalBrowser=1"
    );
  });
});
