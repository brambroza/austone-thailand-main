import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react"; // Importing the trash icon
import { useState } from "react";
import DeleteScannedBarcodeModal from "./DeleteScannedBarcodeModal";

interface IDeleteScannedBarcodeButtonProps {
  id: number;
  onRefreshScannedBarcodes: () => void;
}

const DeleteScannedBarcodeButton = ({
  id,
  onRefreshScannedBarcodes,
}: IDeleteScannedBarcodeButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button variant="destructive" onClick={() => setIsModalOpen(true)}>
        <Trash2 className="mr-2 h-4 w-4" /> {/* Adding the trash icon */}
        ลบ
      </Button>
      <DeleteScannedBarcodeModal
        id={id}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onRefreshScannedBarcodes={onRefreshScannedBarcodes}
      />
    </>
  );
};

export default DeleteScannedBarcodeButton;
