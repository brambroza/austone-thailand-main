import { Bill } from "../types/bill.type";
import { useEditBillFormStore } from "../stores/useEditBillFormStore";
import ProductTypeConstraintItem from "./ProductTypeConstraintItem";

interface IAvailableProductTypeConstraintsProps {
  billId: Bill["id"];
}

const AvailableProductTypeConstraints = ({
  billId,
}: IAvailableProductTypeConstraintsProps) => {
  const productTypeConstraints = useEditBillFormStore(
    (state) => state.productTypeConstraints
  );

  return (
    <div className="flex flex-col gap-2">
      {productTypeConstraints?.map((constraint) => (
        <ProductTypeConstraintItem
          key={constraint.product_type?.id}
          productTypeConstraintId={constraint.product_type?.id}
          billId={billId}
        />
      ))}
    </div>
  );
};

export default AvailableProductTypeConstraints;
