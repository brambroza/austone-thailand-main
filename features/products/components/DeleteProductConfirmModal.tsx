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

interface DeleteProductConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  productId: string;
}

export default function DeleteProductConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  productId,
}: DeleteProductConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ยืนยันการลบสินค้า</DialogTitle>
          <DialogDescription>
            คุณต้องการลบสินค้ารหัส {productId} ใช่หรือไม่?
            การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            ยกเลิก
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="animate-spin" /> : "ลบสินค้า"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 