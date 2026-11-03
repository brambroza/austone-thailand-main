"use client";
import QueryProvider from "@/components/providers/QueryProvider";
import { ReactNode } from "react";
import AuthGuard from "./_components/auth-guard";
import Header from "./_components/header";
import SideMenus from "./_components/side-menus";
import SignOutButton from "./_components/sign-out-button"; 

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider> 
        <AuthGuard>
          <div className="flex h-screen bg-background">
            <aside className="w-64 bg-card border-r border-border flex flex-col">
              <Header />
              <SideMenus />
              <footer className="p-4 border-t border-border">
                <SignOutButton />
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  เวอร์ชั่น 1.4.3
                </p>
              </footer>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">{children}</main>
          </div>
        </AuthGuard>
       
    </QueryProvider>
  );
}
