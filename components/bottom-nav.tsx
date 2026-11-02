"use client";
import Link from "next/link";
import { QrCode, Gift, History, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();

  if (pathname.includes("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#FFE14D] border-t border-[#FFE14D] z-50">
      <div className="max-w-4xl mx-auto flex justify-around p-4">
        <Link href="/user/points" className="flex flex-col items-center gap-1">
          <QrCode
            className={cn(
              "w-6 h-6 transition-colors",
              pathname === "/user/points" ? "text-[#1a1a1a]" : "text-[#666666]"
            )}
          />
          <span
            className={cn(
              "text-xs transition-colors",
              pathname === "/user/points" ? "text-[#1a1a1a] font-bold" : "text-[#666666]"
            )}
          >
            สะสมแต้ม
          </span>
        </Link>
        <Link href="/user/rewards" className="flex flex-col items-center gap-1">
          <Gift
            className={cn(
              "w-6 h-6 transition-colors",
              pathname === "/user/rewards" ? "text-[#1a1a1a]" : "text-[#666666]"
            )}
          />
          <span
            className={cn(
              "text-xs transition-colors",
              pathname === "/user/rewards" ? "text-[#1a1a1a] font-bold" : "text-[#666666]"
            )}
          >
            ของรางวัล
          </span>
        </Link>
        <Link href="/user/history" className="flex flex-col items-center gap-1">
          <History
            className={cn(
              "w-6 h-6 transition-colors",
              pathname === "/user/history" ? "text-[#1a1a1a]" : "text-[#666666]"
            )}
          />
          <span
            className={cn(
              "text-xs transition-colors",
              pathname === "/user/history" ? "text-[#1a1a1a] font-bold" : "text-[#666666]"
            )}
          >
            ประวัติ
          </span>
        </Link>
        <Link href="/user/profile" className="flex flex-col items-center gap-1">
          <User
            className={cn(
              "w-6 h-6 transition-colors",
              pathname === "/user/profile" ? "text-[#1a1a1a]" : "text-[#666666]"
            )}
          />
          <span
            className={cn(
              "text-xs transition-colors",
              pathname === "/user/profile" ? "text-[#1a1a1a] font-bold" : "text-[#666666]"
            )}
          >
            โปรไฟล์
          </span>
        </Link>
      </div>
    </nav>
  );
}
