import Loading from "@/app/loading";
import { useFetchUserInfo } from "@/hooks/fetch-data/useFetchUserInfo";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { getUserId } from "@/lib/utils/user.util";
import {
  Gift,
  History,
  Home,
  Package,
  Receipt,
  Settings,
  Users,
  Star,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const SideMenus = () => {
  const { user, isLoadingUser } = useUser();

  const { data: userInfo, isFetching: isFetchingUserInfo } = useFetchUserInfo(
    user ? getUserId(user) : ""
  );

  const pathname = usePathname();

  const menuItems = [
    { href: "/admin", icon: Home, label: "แดชบอร์ด", allowedRoles: ["ADMIN"] },
    {
      href: "/admin/rewards",
      icon: Gift,
      label: "จัดการของรางวัล",
      allowedRoles: ["ADMIN"],
    },
    {
      href: "/admin/claimed-rewards",
      icon: History,
      label: "ประวัติการแลกของรางวัล",
      allowedRoles: ["ADMIN"],
    },
    {
      href: "/admin/bills",
      icon: Receipt,
      label: "ระบบการจัดการบิล",
      allowedRoles: ["BILL_MANAGEMENT", "ADMIN"],
    },
    {
      href: "/admin/point-accumulate-histories",
      icon: Star,
      label: "ประวัติสะสมคะแนน",
      allowedRoles: ["ADMIN"],
    },
    {
      href: "/admin/point-histories",
      icon: Star,
      label: "ประวัติการแลกคะแนน",
      allowedRoles: ["ADMIN"],
    },
    {
      href: "/admin/products",
      icon: Package,
      label: "จัดการสินค้า",
      allowedRoles: ["BILL_MANAGEMENT", "ADMIN"],
    },
    {
      href: "/admin/users",
      icon: Users,
      label: "จัดการผู้ใช้",
      allowedRoles: ["ADMIN"],
    },
    {
      href: "/admin/settings",
      icon: Settings,
      label: "ตั้งค่าระบบ",
      allowedRoles: ["ADMIN"],
    },
  ];

  if (isLoadingUser || isFetchingUserInfo) return <Loading />;

  return (
    <nav className="flex-1 py-4">
      {menuItems.map((item) => {
        const isActive = pathname === item.href;

        const isAllowed = item.allowedRoles.includes(
          userInfo?.role_title ?? ""
        );

        if (!isAllowed) return null;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary border-r-2 border-primary"
                : "text-gray-600 hover:bg-gray-50 hover:text-primary"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default SideMenus;
