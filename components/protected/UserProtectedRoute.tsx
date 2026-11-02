"use client";
import { useUser } from "@/hooks/useUser";
import { LineUser } from "@/models/user.model";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useContext } from "react";
import { Loader } from "../ui/loader";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | LineUser | null;
  isLoadingUser: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

type UserProtectedRouteProps = {
  children: ReactNode;
  useUserValue: ReturnType<typeof useUser>;
};

export function UserProtectedRoute({
  children,
  useUserValue,
}: UserProtectedRouteProps) {
  const { user, isLoadingUser } = useUserValue;
  const router = useRouter();

  if (user === null && isLoadingUser === false) {
    router.push("/auth/sign-in");
  }

  if (isLoadingUser) {
    return <Loader />;
  }

  if (user === null) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, isLoadingUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUserProtectedRoute() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

 
  return context;
}
