"use server";

import { supabaseAdminClient } from "@/lib/supabase";
import { twilioClient } from "@/lib/twilio";
import { getZodErrorMessage } from "@/lib/utils";
import { hasPassedOTPVerification } from "@/lib/utils/twilio.util";
import { ServerActionResponse } from "@/models/api.model";
import { OTPSchema } from "@/models/twilio.model";
import { z } from "zod";

export const sendOTP = async ({
  phoneNumber,
}: z.infer<typeof OTPSchema>): Promise<ServerActionResponse<null>> => {
  try {
    const validationResult = OTPSchema.safeParse({
      phoneNumber,
    });

    if (validationResult.error) {
      console.error(`ล้มเหลวระหว่างการยืนยันรหัส OTP -> ${validationResult.error.message}`);
      return {
        data: null,
        isError: true,
        error: getZodErrorMessage(validationResult.error),
      };
    }
    console.log(`process OTP1 -> ${twilioClient}` ,process.env.TWILIO_SERVICE_SID);
      console.log(`phoneNumber -> ${twilioClient}` ,phoneNumber);
    const otp = await twilioClient.verify.v2
      .services(process.env.TWILIO_SERVICE_SID!)
      .verifications.create({ to: phoneNumber, channel: "sms" });

    return { data: null, isError: false, error: "" };
  } catch (error: any) {
    console.error(`ล้มเหลวระหว่างการยืนยันรหัส OTP1 -> ${error.message}`);
    return { data: null, isError: true, error: error.message };
  }
};

const VerifyOTPSchema = z.object({
  code: z.string().length(6, { message: "รหัส OTP ควรมีจำนวน 6 หลัก" }),
  to: z.string().regex(/^\+66\d{9}$/, {
    message: "หมายเลขโทรศัพท์ต้องขึ้นต้นด้วย +66 และต้องมีจำนวน 10 หลัก",
  }),
  userId: z.string(),
});

export const verifyOTP = async ({
  code,
  to,
  userId,
}: z.infer<typeof VerifyOTPSchema>): Promise<ServerActionResponse<null>> => {
  try {
    const verificationValidationResult = VerifyOTPSchema.safeParse({
      code,
      to,
      userId,
    });

    if (verificationValidationResult.error) {
      return {
        data: null,
        isError: true,
        error: getZodErrorMessage(verificationValidationResult.error),
      };
    }

    const verificationResult = await twilioClient.verify.v2
      .services(process.env.TWILIO_SERVICE_SID!)
      .verificationChecks.create({ to, code });

    const isOTPCorrect = hasPassedOTPVerification(verificationResult.status);

    if (!isOTPCorrect) throw new Error("รหัส OTP ไม่ถูกต้อง");

    const verifyAccountResult = await supabaseAdminClient
      .from("users")
      .update({ verified_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (verifyAccountResult.error)
      throw new Error(verifyAccountResult.error.message);

    return { data: null, isError: false, error: "" };
  } catch (error: any) {

    return { data: null, isError: true, error: error.message };
  }
};
