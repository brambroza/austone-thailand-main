import { z } from "zod";

export const OTPSchema = z.object({
  phoneNumber: z.string().regex(/^\+66\d{9}$/, {
    message: "หมายเลขโทรศัพท์ต้องขึ้นต้นด้วย +66 และต้องมีจำนวน 10 หลัก",
  }),
});

export type OTP = z.infer<typeof OTPSchema>;
