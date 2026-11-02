"use client";
import { Alert } from "@/components/ui/alert-message-dialog";
import { validateUserProfile } from "@/lib/utils/auth.util";
import { User } from "@/models/user.model";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function usePreventInvalidUserProfile(
  user: User | null,
  isLoadingUser: boolean
) {
  const router = useRouter();

  useEffect(() => {
    if (isLoadingUser) return;

    if (!user) {
      router.push("/user/profile");
      return;
    }

    const { message, isValid: isUserProfileValid } = validateUserProfile(user);

    if (!isUserProfileValid) {
      Alert.error(message);

      router.push("/user/profile");

      return;
    }
  }, [user, isLoadingUser]);
}
