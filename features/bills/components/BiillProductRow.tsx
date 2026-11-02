import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";
import { useState } from "react";
import { useEditBillFormStore } from "../stores/useEditBillFormStore";
import { BillProduct } from "../types/bill.type";
import DeleteProductInBillConfirmModal from "./DeleteProductInBillConfirmModal";

interface IBillProductRowProps {
  product: BillProduct;
}

const BiillProductRow = ({ product }: IBillProductRowProps) => {
  const removeProduct = useEditBillFormStore((state) => state.removeProduct);

  const editProductId = useEditBillFormStore((state) => state.editProductId);

  const onStartEditProductId = useEditBillFormStore(
    (state) => state.onStartEditProductId
  );

  const onStopEditProductId = useEditBillFormStore(
    (state) => state.onStopEditProductId
  );

  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    removeProduct(product.id);
    setShowConfirm(false);
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="space-y-1">
        <Input
          className="font-medium bg-white w-48 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={product.id}
          onFocus={() => onStartEditProductId()}
          onBlur={() => onStopEditProductId()}
          onChange={(e) => {
            editProductId(product.id, e.target.value);
          }}
        />
        <div className="text-sm text-gray-500">
          {product.product_type?.title}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowConfirm(true)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors rounded-md p-2"
        >
          <Trash className="w-4 h-4" />
        </Button>
      </div>
      <DeleteProductInBillConfirmModal
        showConfirm={showConfirm}
        setShowConfirm={setShowConfirm}
        handleDelete={handleDelete}
      />
    </div>
  );
};

export default BiillProductRow;
