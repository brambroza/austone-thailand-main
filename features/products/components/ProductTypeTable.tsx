"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductType } from "../types/product.type";
import { Pencil, Trash2 } from "lucide-react";

interface ProductTypeTableProps {
  productTypes: ProductType[];
  onEdit: (productType: ProductType) => void;
  onDelete: (productType: ProductType) => void;
  isProcessing: boolean;
}

export default function ProductTypeTable({
  productTypes,
  onEdit,
  onDelete,
  isProcessing,
}: ProductTypeTableProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>รหัส</TableHead>
            <TableHead>ชื่อประเภทสินค้า</TableHead>
            <TableHead className="text-right">จัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productTypes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                ไม่พบข้อมูลประเภทสินค้า
              </TableCell>
            </TableRow>
          ) : (
            productTypes.map((productType) => (
              <TableRow key={productType.id}>
                <TableCell>{productType.id}</TableCell>
                <TableCell>{productType.title}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(productType)}
                    disabled={isProcessing}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    แก้ไข
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(productType)}
                    disabled={isProcessing}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    ลบ
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
} 