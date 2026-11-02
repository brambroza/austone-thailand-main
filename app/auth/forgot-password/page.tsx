"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendPasswordResetEmail } from "@/features/auth/services/auth.service";
import Link from "next/link";
import { useState } from "react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await sendPasswordResetEmail(
        email,
        `${window.location.origin}/auth/reset-password`
      );

      if (error) {
        setError(error);
        return;
      }

      setIsSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-300/10 p-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">ลืมรหัสผ่าน</h1>
          <p className="text-gray-500">
            กรอกอีเมลที่ใช้สมัครสมาชิก แล้วเราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ
          </p>
        </div>

        {isSent ? (
          <div className="space-y-4">
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
              ส่งลิงก์ตั้งรหัสผ่านใหม่แล้ว กรุณาตรวจสอบอีเมลของคุณ
            </div>
            <Button asChild className="w-full bg-[#FFE14D] text-black hover:bg-[#FFE14D]/90">
              <Link href="/auth/sign-in">กลับไปหน้าเข้าสู่ระบบ</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="กรอกอีเมลของคุณ"
                autoComplete="email"
                required
                disabled={isLoading}
              />
            </div>

            {error ? (
              <div className="rounded-md bg-red-100 p-3 text-sm text-red-500">{error}</div>
            ) : null}

            <Button
              type="submit"
              className="w-full bg-[#FFE14D] text-black hover:bg-[#FFE14D]/90"
              disabled={isLoading}
            >
              {isLoading ? "กำลังส่ง..." : "ส่งลิงก์ตั้งรหัสผ่านใหม่"}
            </Button>

            <p className="text-center text-sm text-gray-500">
              <Link href="/auth/sign-in" className="text-blue-600 hover:underline">
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </p>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
