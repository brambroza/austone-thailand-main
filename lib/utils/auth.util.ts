import { LineUser, User, UserInfoView } from "@/models/user.model";

export function isLineUser(user: LineUser | User): user is LineUser {
  return "sub" in user;
}

export function joinLineOAuthScopes(scopes: string[]): string {
  return scopes.join("%20");
}

export function validateUserProfile(user: User): {
  message: string;
  isValid: boolean;
} {
  const isPersonsalInfoValid =
    user.full_name &&
    user.phone_number &&
    user.date_of_birth &&
    user.gender &&
    user.province &&
    user.store_name;

  if (!isPersonsalInfoValid)
    return { message: "กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วน", isValid: false };

  if (!user.verified_at) {
    return { message: "กรุณายืนยันหมายเลขโทรศัพท์ของท่าน", isValid: false };
  }

  return { message: "", isValid: true };
}

export function hasUserVerifiedPhoneNumber(user: User | null | undefined) {
  if (!user) return false;

  return Boolean(user.verified_at);
}

export function isUserAdmin(user: UserInfoView | null | undefined) {
  return user?.role_title === "ADMIN";
}

export function isUserBillManager(user: UserInfoView | null | undefined) {
  return user?.role_title === "BILL_MANAGEMENT";
}


