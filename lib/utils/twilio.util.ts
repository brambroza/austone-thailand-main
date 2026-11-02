export function hasPassedOTPVerification(verificationStatus: string): boolean {
  return verificationStatus === "approved";
}

export function convertPhoneNumberToE164Format(phoneNumber: string) {
  return `+66${phoneNumber.replace(/\D/g, "").slice(-9)}`;
}
