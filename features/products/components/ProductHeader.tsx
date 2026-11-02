"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Upload } from "lucide-react";

interface ProductHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onImportClick: () => void;
  onAddClick: () => void;
}

export default function ProductHeader({
  searchQuery,
  onSearchChange,
  onImportClick,
  onAddClick,
}: ProductHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ค้นหาสินค้า..."
          className="pl-8 bg-white"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onImportClick}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          นำเข้า CSV
        </Button>
        <Button
          onClick={onAddClick}
          className="bg-[#FFE14D] hover:bg-[#FFE14D]/90 text-black"
        >
          <Plus className="h-4 w-4 mr-1" />
          เพิ่มสินค้า
        </Button>
      </div>
    </div>
  );
} 