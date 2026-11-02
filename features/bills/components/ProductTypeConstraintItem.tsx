import { ProductType } from "@/features/products/types/product.type";
import { cn } from "@/lib/utils";
import { useEditBillFormStore } from "../stores/useEditBillFormStore";
import { useEditBillHelpers } from "../hooks/useEditBillHelpers";
import { useEditBillForm } from "../hooks/useEditBillForm";
import { Bill } from "../types/bill.type";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface IProductTypeConstraintItemProps {
  productTypeConstraintId: ProductType["id"];
  billId: Bill["id"];
}

const ProductTypeConstraintItem = ({
  productTypeConstraintId,
  billId,
}: IProductTypeConstraintItemProps) => {
  const currentSelectedProductTypeConstraintId = useEditBillFormStore(
    (state) => state.currentSelectedProductTypeConstraintId
  );

  const onSelectProductTypeConstraint = useEditBillFormStore(
    (state) => state.onSelectProductTypeConstraint
  );

  const onEditProductTypeConstraint = useEditBillFormStore(
    (state) => state.onEditProductTypeConstraint
  );

  const deleteProductTypeConstraint = useEditBillFormStore(
    (state) => state.deleteProductTypeConstraint
  );

  const { listenToFormEditState } = useEditBillForm();

  const { handleGetProductTypeConstraintById } = useEditBillHelpers(billId);

  const productTypeConstraint = handleGetProductTypeConstraintById(
    productTypeConstraintId
  );

  const isSelected =
    currentSelectedProductTypeConstraintId === productTypeConstraintId;

  function handleDeleteProductTypeConstraint() {
    deleteProductTypeConstraint(productTypeConstraintId);
  }

  if (!productTypeConstraint) return null;

  return (
    <div
      className={cn(
        "p-2 rounded-md border bg-white cursor-pointer",
        isSelected && "bg-primary text-white"
      )}
      onClick={() => onSelectProductTypeConstraint(productTypeConstraintId)}
      key={productTypeConstraint.product_type?.id}
    >
      <div className="flex justify-between items-center">
        <span>{productTypeConstraint.product_type?.title}</span>
        <div className="flex gap-x-5">
          <input
            type="number"
            value={productTypeConstraint.amount}
            onChange={(e) =>
              onEditProductTypeConstraint(productTypeConstraintId, {
                ...productTypeConstraint,
                amount: Number(e.target.value),
              })
            }
            className="w-20 text-right"
            min={1}
            {...listenToFormEditState()}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleDeleteProductTypeConstraint}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductTypeConstraintItem;
