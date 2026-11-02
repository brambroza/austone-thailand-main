import { Card } from "@/components/ui/card";
import { useEditBillFormStore } from "../stores/useEditBillFormStore";
import BillProductList from "./BillProductList";

const BillTable = () => {
  const products = useEditBillFormStore((state) => state.products);

  return (
    <Card className="p-6 space-y-4">
      {products.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          ยังไม่มีรายการสินค้า
        </div>
      ) : (
        <BillProductList />
      )}
    </Card>
  );
};

export default BillTable;
