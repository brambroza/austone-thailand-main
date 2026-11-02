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
import { ADD_PRODUCT_METHOD } from "@/models/enums/product.enum";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    newProduct: Omit<Product, "created_at" | "updated_at">
  ) => Promise<void>;
}

export default function AddProductModal({
  isOpen,
  onClose,
  onAdd,
}: AddProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    product_type_id: "",
    bill_id: null as string | null,
    method: ADD_PRODUCT_METHOD.MANUAL,
    updated_by_user_id: null as string | null,
  });

  const { data: productTypes, isFetching: isFetchingProductTypes } =
    useFetchAllProductTypes();

  const handleSubmit = async () => {
    try {
      if (!formData.id) {
        throw new Error("กรุณากรอกรหัสสินค้า");
      }
      if (!formData.product_type_id) {
        throw new Error("กรุณาเลือกประเภทสินค้า");
      }

      setIsLoading(true);
      await onAdd({
        ...formData,
        product_type_id: parseInt(formData.product_type_id),
      });

      setFormData({
        id: "",
        product_type_id: "",
        bill_id: null,
        method: ADD_PRODUCT_METHOD.MANUAL,
        updated_by_user_id: null,
      }); // Reset form
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
          <DialogTitle>เพิ่มสินค้าใหม่</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>รหัสสินค้า</Label>
            <Input
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              placeholder="กรอกรหัสสินค้า"
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
                <SelectContent className="max-h-[300px] overflow-y-auto">
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
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-[#FFE14D] hover:bg-[#FFE14D]/90 text-black"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "เพิ่มสินค้า"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
