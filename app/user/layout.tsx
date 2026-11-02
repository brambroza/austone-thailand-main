"use client";
import { UserProtectedRoute } from "@/components/protected/UserProtectedRoute";
import QueryProvider from "@/components/providers/QueryProvider";
import { useUser } from "@/hooks/useUser";
import NotificationPopup from "@/components/NotificationPopup";
import { ReactNode, useEffect, useState } from "react";
import PreventLinePage from "@/components/prevent-line-page";

export default function UserLayout({ children }: { children: ReactNode }) {
  const useUserValue = useUser();

  const [isLineBrowser, setIsLineBrowser] = useState(false);

  useEffect(() => {
    setIsLineBrowser(navigator.userAgent.includes("Line"));
  }, []);

  if (isLineBrowser) {
    return <PreventLinePage />;
  }

  return (
    <QueryProvider>
      <UserProtectedRoute useUserValue={useUserValue}>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow pb-20">{children}</main>
        </div>

        <NotificationPopup />
      </UserProtectedRoute>
    </QueryProvider>
  );
}
