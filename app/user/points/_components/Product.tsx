import React from "react";
import { Product as ProductType } from "../_type";
import { usePointsPageStore } from "../_store";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  product: ProductType;
};

const Product = ({ product }: Props) => {
  const deleteProduct = usePointsPageStore((state) => state.deleteProduct);

  const usedProductIds = usePointsPageStore((state) => state.usedProductIds);

  const isUsed = usedProductIds.includes(product.id);

  const { id, points } = product;
  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex items-center justify-between p-2 px-4 border rounded-lg bg-white",
          isUsed && "border-red-700"
        )}
      >
        <div className="flex items-center space-x-4">
          <span className="truncate max-w-[200px]">รหัสสินค้า {id}</span>
          <span className="text-sm text-muted-foreground">+{points} แต้ม</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => deleteProduct(id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {isUsed && <span className="text-sm text-red-500 mt-2">ถูกใช้แล้ว</span>}
    </div>
  );
};

export default Product;
