"use client";

import { Alert } from "@/components/ui/alert-message-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/models/product.model";
import { useState } from "react";
import { useFetchAllProductTypes } from "@/features/products/hooks/queries/useFetchAllProductTypes";
import { Loader2 } from "lucide-react";

interface EditProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: Partial<Product>) => Promise<void>;
}

export default function EditProductModal({
  product,
  isOpen,
  onClose,
  onSave,
}: EditProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: product?.id.toString() || "",
    product_type_id: product?.product_type_id?.toString() || "",
  });

  const { data: productTypes, isFetching: isFetchingProductTypes } = useFetchAllProductTypes();

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave({
        ...formData,
        product_type_id: formData.product_type_id ? parseInt(formData.product_type_id) : null,
      });
      onClose();
    } catch (error: any) {
      Alert.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลสินค้า</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>รหัสสินค้า</Label>
            <Input
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              disabled
            />
          </div>

          {isFetchingProductTypes ? (
            <div className="flex justify-center">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>ประเภทสินค้า</Label>
              <Select
                value={formData.product_type_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, product_type_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทสินค้า" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-[#FFE14D] hover:bg-[#FFE14D]/90 text-black"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "บันทึก"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}