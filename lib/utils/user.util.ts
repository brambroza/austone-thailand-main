import { LineUser } from "@/models/user.model";
import { User } from "@supabase/supabase-js";

export function preventUserBirthDateFromDecrementInDB(birthDate: Date): Date {
  return new Date(
    new Date(birthDate).getTime() - new Date().getTimezoneOffset() * 60000
  );
}

export function isLineUser(user: User | LineUser): user is LineUser {
  return "sub" in user;
}

export function isSupabaseUser(user: User | LineUser): user is User {
  return "id" in user;
}

export function getUserId(user: User | LineUser | null) {
  if (!user) return "";
  return isLineUser(user) ? user.sub : user.id;
}

export function getUserProfileImage(user: User | LineUser | null) {
  if (!user) return "";
  return isLineUser(user) ? user.picture : user.user_metadata.avatar_url;
}
