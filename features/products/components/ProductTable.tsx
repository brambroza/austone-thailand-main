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
import { ProductWithScanner } from "@/models/product.model";
import { formatThaiDate } from "@/lib/utils/date.util";
import { Pencil, Trash2 } from "lucide-react";

interface ProductTableProps {
  products: ProductWithScanner[];
  onEdit: (product: ProductWithScanner) => void;
  onDelete: (product: ProductWithScanner) => void;
  deletingProductId: string | null;
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  deletingProductId,
}: ProductTableProps) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>รหัสสินค้า</TableHead>
            <TableHead>เลขบิล</TableHead>
            <TableHead>วันที่สร้าง</TableHead>
            <TableHead>วันที่อัพเดท</TableHead>
            <TableHead>วิธีการเพิ่มสินค้า</TableHead>
            <TableHead>ชื่อผู้สแกน</TableHead>
            <TableHead className="text-right">จัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                ไม่พบข้อมูลสินค้า
              </TableCell>
            </TableRow>
          )}
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium text-gray-900">{product.id}</TableCell>
              <TableCell>{product.bill_no || "ไม่มีเลขบิล"}</TableCell>
              <TableCell>
                {product.created_at
                  ? formatThaiDate(new Date(product.created_at))
                  : "ไม่ระบุ"}
              </TableCell>
              <TableCell>
                {product.updated_at
                  ? formatThaiDate(new Date(product.updated_at))
                  : "ไม่ระบุ"}
              </TableCell>
              <TableCell>{product.method}</TableCell>
              <TableCell>{product.full_name ?? "ยังไม่ถูกสแกน"}</TableCell>
              <TableCell className="text-right space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  title="แก้ไข"
                  aria-label="แก้ไข"
                  onClick={() => onEdit(product)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="ลบ"
                  aria-label="ลบ"
                  className="hover:bg-red-100 hover:text-red-600"
                  onClick={() => onDelete(product)}
                  disabled={deletingProductId === product.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
