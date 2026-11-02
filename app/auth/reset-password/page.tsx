"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword } from "@/features/auth/services/auth.service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await updatePassword(password);

      if (error) {
        setError(error);
        return;
      }

      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
      router.push("/auth/sign-in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-300/10 p-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">ตั้งรหัสผ่านใหม่</h1>
          <p className="text-gray-500">กรอกรหัสผ่านใหม่สำหรับบัญชีของคุณ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่านใหม่</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={6}
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
            {isLoading ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
          </Button>

          <p className="text-center text-sm text-gray-500">
            <Link href="/auth/sign-in" className="text-blue-600 hover:underline">
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
