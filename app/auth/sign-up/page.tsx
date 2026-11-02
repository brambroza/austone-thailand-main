"use client";
import { Alert } from "@/components/ui/alert-message-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpWithEmailAndPassword } from "@/features/auth/services/auth.service";
import { navigateUserToLineLogIn } from "@/lib/utils/line.util";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const SignUpPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error("รหัสผ่านไม่ตรงกัน");
      }

      const { error } = await signUpWithEmailAndPassword(
        formData.email,
        formData.password
      );

      if (error) {
        Alert.error(error);
        return;
      }

      // Redirect to sign-in page after successful registration
      toast.success("กรุณายืนยันอีเมลของคุณเพื่อเข้าสู่ระบบ");
      router.push("/auth/sign-in");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-yellow-300/10 p-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">สมัครสมาชิก</h1>
          <p className="text-gray-500">สร้างบัญชีใหม่เพื่อเริ่มใช้งาน</p>
        </div>

        <Button
          onClick={navigateUserToLineLogIn}
          className="w-full bg-[#00B900] hover:bg-[#00B900]/90 text-white"
          disabled={isLoading}
        >
          สมัครสมาชิกด้วย LINE
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">หรือ</span>
          </div>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="กรอกอีเมลของคุณ"
              required
              className="bg-white"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="กรอกรหัสผ่านของคุณ"
              required
              className="bg-white"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
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
            {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิกด้วยอีเมล"}
          </Button>

          <p className="text-center text-sm text-gray-500">
            มีบัญชีอยู่แล้ว?{" "}
            <Link
              href="/auth/sign-in"
              className="text-blue-600 hover:underline"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default SignUpPage;
