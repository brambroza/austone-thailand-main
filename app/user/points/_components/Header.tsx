import { CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import React from "react";
import { usePointsPageStore } from "../_store";
import { Product } from "../_type";

function sumTotalPoints(products: Product[]) {
  return products.reduce((sum, product) => sum + product.points, 0);
}

const Header = () => {
  const products = usePointsPageStore((state) => state.products);
  return (
    <CardHeader>
      <CardTitle>รายการสินค้าที่สแกน</CardTitle>
      <p className="text-lg font-medium text-muted-foreground">
        แต้มของคุณ: {sumTotalPoints(products)} แต้ม
      </p>
    </CardHeader>
  );
};

export default Header;
