import { Alert } from "@/components/ui/alert-message-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductType } from "@/features/products/types/product.type";
import { useEffect, useState } from "react";
import { useEditBillForm } from "../hooks/useEditBillForm";
import { useEditBillFormStore } from "../stores/useEditBillFormStore";
import AvailableProductTypeConstraintsList from "./AvailableProductTypeConstraintList";
import { Bill } from "../types/bill.type";
import { Search } from "lucide-react";
import { toast } from "sonner";

interface SelectProductTypeInputProps {
  productTypes: ProductType[];
  billId: Bill["id"];
}

const SelectProductTypeInput = ({
  productTypes,
  billId,
}: SelectProductTypeInputProps) => {
  const [selectedProductType, setSelectedProductType] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { listenToFormEditState } = useEditBillForm();

  const productTypeConstraints = useEditBillFormStore(
    (state) => state.productTypeConstraints
  );

  const products = useEditBillFormStore((state) => state.products);

  const addProductTypeConstraint = useEditBillFormStore(
    (state) => state.addProductTypeConstraint
  );

  // For debugging
  useEffect(() => {
    console.log("Selected product type changed:", selectedProductType);
  }, [selectedProductType]);

  const handleSelectProductType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("Selecting product type:", e.target.value);
    setSelectedProductType(e.target.value);
  };

  const handleAddConstraint = () => {
    const selectedType = productTypes?.find(
      (pt) => pt.id === Number(selectedProductType)
    );

    if (!selectedType) {
      Alert.error("กรุณาเลือกประเภทสินค้า");
      return;
    }

    // Check if constraint already exists
    const existingConstraint = productTypeConstraints.find(
      (c) => c.product_type.id === selectedType.id
    );
    if (existingConstraint) {
      Alert.error("ประเภทสินค้านี้ถูกกำหนดไว้แล้ว");
      return;
    }

    // Count products of selected type
    const productsOfType = products.filter(
      (p) => p.product_type_id === selectedType.id
    ).length;

    // Check if current products exceed new constraint
    if (productsOfType > Number(amount)) {
      Alert.error(
        `จำนวนสินค้าในรายการ (${productsOfType}) เกินกว่าที่กำหนด (${amount})`
      );
      return;
    }

    addProductTypeConstraint({
      product_type: selectedType,
      amount: Number(amount),
      product_type_id: selectedType.id,
      bill_id: billId,
      created_at: new Date().toISOString(),
      id: 0,
    });

    // Reset form
    setSelectedProductType("");
    setAmount("");
    toast.success("เพิ่มประเภทสินค้าเรียบร้อย");
  };

  // Filter product types based on search query
  const filteredProductTypes = productTypes?.filter((type) =>
    type.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!productTypes) return <div>ไม่พบข้อมูลประเภทสินค้า</div>;

  return (
    <div className="space-y-4 mt-4">
      <AvailableProductTypeConstraintsList billId={billId} />
      <div className="flex gap-4 items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="productType">ประเภทสินค้า</Label>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <Input
              type="text"
              placeholder="ค้นหาประเภทสินค้า..."
              className="pl-10 mb-2 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              {...listenToFormEditState()}
            />
          </div>
          
          <select
            id="productType"
            className="w-full p-2 border rounded-md bg-white"
            value={selectedProductType}
            onChange={handleSelectProductType}
            {...listenToFormEditState()}
          >
            <option value="">เลือกประเภทสินค้า</option>
            {filteredProductTypes.map((type) => (
              <option key={type.id} value={type.id.toString()}>
                {type.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <Label htmlFor="amount">จำนวน</Label>
          <Input
            className="bg-white"
            id="amount"
            type="number"
            value={amount}
            {...listenToFormEditState()}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="ระบุจำนวน"
            min="1"
          />
        </div>

        <Button
          onClick={handleAddConstraint}
          disabled={!selectedProductType || !amount}
          className="text-white"
        >
          เพิ่ม
        </Button>
      </div>
    </div>
  );
};

export default SelectProductTypeInput;
