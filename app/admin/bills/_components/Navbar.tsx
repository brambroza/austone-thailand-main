"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  return (
    <nav className="flex items-center justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="ค้นหาบิล..." className="pl-8 bg-white" />
      </div>
      <Button
        className="bg-[#FFE14D] hover:bg-[#FFE14D]/90 text-black"
        onClick={() => router.push("/admin/bills/create")}
      >
        <Plus className="mr-2 h-4 w-4" />
        สร้างบิลใหม่
      </Button>
    </nav>
  );
};

export default Navbar;
