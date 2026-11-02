import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertDialogContent } from "@/components/ui/alert-dialog";
import React from "react";

interface DeleteProductInBillConfirmModalProps {
  showConfirm: boolean;
  setShowConfirm: (showConfirm: boolean) => void;
  handleDelete: () => void;
}

const DeleteProductInBillConfirmModal = ({
  showConfirm,
  setShowConfirm,
  handleDelete,
}: DeleteProductInBillConfirmModalProps) => {
  return (
    <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
          <AlertDialogDescription>
            คุณแน่ใจหรือว่าต้องการลบสินค้านี้?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>ลบ</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProductInBillConfirmModal;
