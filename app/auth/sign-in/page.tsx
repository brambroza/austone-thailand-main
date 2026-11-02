"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithEmailAndPassword } from "@/features/auth/services/auth.service";
import { navigateUserToLineLogIn } from "@/lib/utils/line.util";
import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useUser } from "@/hooks/useUser";
import Loading from "@/app/loading";
import { useRouter } from "next/navigation";

const SignInPage = () => {
  const { user, isLoadingUser } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await signInWithEmailAndPassword(email, password);

      if (error) {
        setError(error);
        return;
      }

      toast.success("เข้าสู่ระบบสำเร็จ");

      router.push("/user/profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingUser) return <Loading />;

  if (user) {
    router.push("/");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-300/10 p-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">เข้าสู่ระบบ</h1>
          <p className="text-gray-500">กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ</p>
        </div>

        <Button
          onClick={navigateUserToLineLogIn}
          className="w-full bg-[#00B900] hover:bg-[#00B900]/90 text-white"
          disabled={isLoading}
        >
          เข้าสู่ระบบด้วย LINE
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">หรือ</span>
          </div>
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="กรอกอีเมลของคุณ"
              required
              className="bg-white"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านของคุณ"
              required
              className="bg-white"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#FFE14D] hover:bg-[#FFE14D]/90 text-black"
            disabled={isLoading}
          >
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วยอีเมล"}
          </Button>

          <p className="text-center text-sm text-gray-500">
            ยังไม่มีบัญชี?{" "}
            <Link
              href="/auth/sign-up"
              className="text-blue-600 hover:underline"
            >
              สมัครสมาชิก
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default SignInPage;
