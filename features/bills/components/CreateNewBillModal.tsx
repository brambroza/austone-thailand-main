import React from "react";
import { useForm } from "react-hook-form";
import { BillSchema } from "../types/bill.type";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert-message-dialog";
import { createBillInfoAction } from "../actions/bills.action";
import { ServerActionResponse } from "@/models/api.model";
import { Bill } from "../types/bill.type";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { BILL_STATUS } from "../enums/bill.enum";

const FormSchema = BillSchema.pick({
  bill_no: true,
  customer_fullname: true,
  customer_email: true,
  document_date: true,
  status: true,
});

type FormFields = z.infer<typeof FormSchema>;

interface ICreateNewBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshBillData: () => void;
}

const CreateNewBillModal = ({
  isOpen,
  onClose,
  onRefreshBillData,
}: ICreateNewBillModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      status: BILL_STATUS.WAIT_FOR_SCAN,
    },
  });

  async function onSubmit(data: FormFields) {
    try {
      const result = await createBillInfoAction(data);

      const { isError, error } =
        SafeActionUtil.getData<ServerActionResponse<Bill>>(result);

      if (isError) throw new Error(error);

      Alert.success("สร้างบิลเรียบร้อย");

      onClose();

      onRefreshBillData();
    } catch (error: any) {
      Alert.error(error.message);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>สร้างบิลใหม่</DialogTitle>
        </DialogHeader>
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="bill_no">เลขที่บิล</Label>
              <Input
                id="bill_no"
                {...register("bill_no")}
                placeholder="เลขที่บิล"
              />
              {errors.bill_no && (
                <p className="text-red-500">{errors.bill_no.message}</p>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="customer_fullname">ชื่อลูกค้า</Label>
            <Input
              id="customer_fullname"
              {...register("customer_fullname")}
              placeholder="ชื่อลูกค้า"
            />
            {errors.customer_fullname && (
              <p className="text-red-500">{errors.customer_fullname.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="customer_email">อีเมลลูกค้า</Label>
            <Input
              id="customer_email"
              {...register("customer_email")}
              placeholder="อีเมลลูกค้า"
            />
            {errors.customer_email && (
              <p className="text-red-500">{errors.customer_email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="document_date">วันที่เอกสาร</Label>
            <Input
              id="document_date"
              type="date"
              {...register("document_date")}
            />
            {errors.document_date && (
              <p className="text-red-500">{errors.document_date.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              ยกเลิก
            </Button>
            <Button type="submit">สร้างบิล</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewBillModal;
