"use client";
import {
  buildExternalBrowserUrl,
  buildOpenInChromeUrl,
} from "@/lib/utils/open-in-browser.util";

const PreventLinePage = () => {
  function openChrome() {
    window.location.assign(
      buildOpenInChromeUrl(window.location.href, navigator.userAgent)
    );
  }

  function openExternalBrowser() {
    window.location.assign(buildExternalBrowserUrl(window.location.href));
  }
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto text-red-500"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          ไม่สามารถเข้าใช้งานผ่าน LINE Browser ได้
        </h1>

        <p className="text-gray-600 mb-6">
          กรุณาเปิดเว็บไซต์ผ่านเบราว์เซอร์อื่น เช่น Chrome, Safari หรือ Firefox
          เพื่อความปลอดภัยและประสบการณ์การใช้งานที่ดีที่สุด
        </p>

        <div className="flex flex-col gap-3">
          <button
            className="bg-yellow-400 text-black px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
            onClick={openChrome}
          >
            เปิดด้วย Chrome
          </button>
          <button
            className="bg-white border border-gray-300 text-black px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={openExternalBrowser}
          >
            เปิดด้วยเบราว์เซอร์อื่น
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreventLinePage;
