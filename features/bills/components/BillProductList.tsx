import { useEditBillFormStore } from "../stores/useEditBillFormStore";
import BiillProductRow from "./BiillProductRow";

const BillProductList = () => {
  const products = useEditBillFormStore((state) => state.products);

  return (
    <div className="grid grid-cols-3 gap-3">
      {products.map((product, index) => (
        <BiillProductRow key={index} product={product} />
      ))}
    </div>
  );
};

export default BillProductList;
