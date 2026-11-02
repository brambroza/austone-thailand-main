"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

interface ProductTypeHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
}

export default function ProductTypeHeader({
  searchQuery,
  onSearchChange,
  onAddClick,
}: ProductTypeHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ค้นหาประเภทสินค้า..."
          className="pl-8 bg-white"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button
        onClick={onAddClick}
        className="bg-[#FFE14D] hover:bg-[#FFE14D]/90 text-black"
      >
        <Plus className="h-4 w-4 mr-1" />
        เพิ่มประเภทสินค้า
      </Button>
    </div>
  );
} 