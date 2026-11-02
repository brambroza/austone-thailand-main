/**
 * สร้างลิงก์สำหรับเปิดหน้าปัจจุบันใน Chrome จาก browser ในแอป LINE
 * iOS ใช้ googlechromes สำหรับ https และ googlechrome สำหรับ http
 * Android ใช้ intent URL เพราะไม่รองรับ scheme ของ iOS
 *
 * @param href - URL เต็มของหน้าปัจจุบัน
 * @param userAgent - user agent ของ browser
 * @returns ลิงก์สำหรับเปิด Chrome
 */
export function buildOpenInChromeUrl(href: string, userAgent: string): string {
  const url = new URL(href);
  const scheme = url.protocol.replace(":", "");
  const hostAndPath = `${url.host}${url.pathname}${url.search}`;

  if (/android/i.test(userAgent)) {
    const fallbackUrl = encodeURIComponent(href);

    return `intent://${hostAndPath}#Intent;scheme=${scheme};package=com.android.chrome;S.browser_fallback_url=${fallbackUrl};end`;
  }

  return `${scheme === "https" ? "googlechromes" : "googlechrome"}://${hostAndPath}`;
}

/**
 * เติมพารามิเตอร์ของ LINE เพื่อขอให้เปิดลิงก์ใน browser ภายนอก
 *
 * @param href - URL เต็มของหน้าปัจจุบัน
 * @returns URL ที่มี openExternalBrowser=1
 */
export function buildExternalBrowserUrl(href: string): string {
  const url = new URL(href);

  url.searchParams.set("openExternalBrowser", "1");

  return url.toString();
}
