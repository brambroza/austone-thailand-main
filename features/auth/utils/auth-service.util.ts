export function translateAuthErrorMessage(errorMessage: string): string {
  switch (errorMessage) {
    case "Invalid login credentials":
      return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
    case "Email not confirmed":
      return "กรุณายืนยันอีเมลของคุณเพื่อเข้าสู่ระบบ";
    default:
      return errorMessage;
  }
}
