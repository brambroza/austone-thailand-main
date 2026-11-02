"use client";
import { UserProtectedRoute } from "@/components/protected/UserProtectedRoute";
import QueryProvider from "@/components/providers/QueryProvider";
import { useUser } from "@/hooks/useUser";
import NotificationPopup from "@/components/NotificationPopup";
import { ReactNode } from "react";

export default function UserLayout({ children }: { children: ReactNode }) {
  const useUserValue = useUser();

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
