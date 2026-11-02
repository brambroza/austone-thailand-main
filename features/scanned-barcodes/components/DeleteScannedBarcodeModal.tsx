import { deleteScannedBarcodeAction } from "@/actions/queries/scanned-barcodes.action";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert } from "@/components/ui/alert-message-dialog";
import React from "react";
import { Button } from "@/components/ui/button";

interface IDeleteScannedBarcodeModalProps {
  id: number;
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  onRefreshScannedBarcodes: () => void;
}

const DeleteScannedBarcodeModal = ({
  id,
  isModalOpen,
  setIsModalOpen,
  onRefreshScannedBarcodes,
}: IDeleteScannedBarcodeModalProps) => {
  async function handleDeleteScannedBarcode() {
    try {
      const result = await deleteScannedBarcodeAction({ id });

      if (!result?.data) throw new Error("ไม่สามารถลบข้อมูลได้");

      const { data: isDeleteSuccessful, error: scannedBarcodesError } = result;

      if (scannedBarcodesError) throw new Error(scannedBarcodesError);

      if (!isDeleteSuccessful) throw new Error("ไม่สามารถลบข้อมูลได้");

      Alert.success("ลบข้อมูลสำเร็จ");

      onRefreshScannedBarcodes();
    } catch (error: any) {
      Alert.error(error.message);
    }
  }
  return (
    <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
          <AlertDialogDescription>
            คุณแน่ใจหรือว่าต้องการลบข้อมูลนี้?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="destructive" onClick={handleDeleteScannedBarcode}>
            {" "}
            ลบ{" "}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteScannedBarcodeModal;
