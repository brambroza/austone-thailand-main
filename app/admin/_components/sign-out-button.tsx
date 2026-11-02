import { Button } from "@/components/ui/button";
import { signOut } from "@/features/auth/services/auth.service";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const SignOutButton = () => {
  const router = useRouter();
  const handleLogout = async () => {
    await signOut();

    router.push("/");
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
      onClick={handleLogout}
    >
      <LogOut className="w-5 h-5 mr-3" />
      ออกจากระบบ
    </Button>
  );
};

export default SignOutButton;
