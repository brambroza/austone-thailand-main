"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ProductType } from "../types/product.type";

interface DeleteProductTypeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
  isProcessing: boolean;
  productType: ProductType | null;
}

export default function DeleteProductTypeConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
  productType,
}: DeleteProductTypeConfirmModalProps) {
  if (!productType) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ยืนยันการลบประเภทสินค้า</DialogTitle>
          <DialogDescription>
            คุณต้องการลบประเภทสินค้า "{productType.title}" ใช่หรือไม่?
            การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            ยกเลิก
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : (
              "ลบประเภทสินค้า"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 