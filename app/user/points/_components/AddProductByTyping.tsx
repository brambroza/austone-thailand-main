import React, { useState } from "react";
import AddProductByTypingModal from "./AddProductByTypingModal";
import { Button } from "@/components/ui/button";
import { KeyboardIcon } from "lucide-react";
import { ProductScoreOption } from "@/models/product-score-option.model";
interface IAddProductByTypingProps {
  productScoreOption: ProductScoreOption;
  point_multiplier?: number;
}

const AddProductByTyping = ({
  productScoreOption,
  point_multiplier,
}: IAddProductByTypingProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        startIcon={<KeyboardIcon className="w-4 h-4" />}
        className="w-full"
        variant="outline"
        onClick={() => setIsOpen(true)}
      >
        เพิ่มสินค้าโดยการพิมพ์
      </Button>
      <AddProductByTypingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        productScoreOption={productScoreOption}
        point_multiplier={point_multiplier}
      />
    </>
  );
};

export default AddProductByTyping;
