"use client";

import { Alert } from "@/components/ui/alert-message-dialog";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatThaiDate } from "@/lib/utils/date.util";
import { EyeIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteBill } from "../actions/bills.action";
import { BILL_STATUS } from "../enums/bill.enum";
import { BillWithProductAndProductTypeAndProductTypeConstraint } from "../types/bill.type";
import SendBillPDFButton from "./SendBillPDFButton";

interface IBillRowProps {
  bill: BillWithProductAndProductTypeAndProductTypeConstraint;
}

const BillRow = ({ bill }: IBillRowProps) => {
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      Alert.confirm({
        title: "ลบบิล",
        description: "คุณต้องการลบบิลนี้หรือไม่",
        confirmText: "ลบ",
        cancelText: "ยกเลิก",
        onConfirm: async () => {
          setIsDeleting(true);
          await deleteBill(bill.id);
          Alert.success("ลบบิลสำเร็จ");
          router.refresh();
        },
      });
    } catch (error: any) {
      Alert.error(error.message);
      setIsDeleting(false);
    }
  };

  function handleNavigateToBillDetail() {
    router.push(`/admin/bills/${bill.id}`);
  }

  console.log(bill.productTypeConstraints);

  return (
    <TableRow>
      <TableCell>{bill.bill_no}</TableCell>
      <TableCell>{bill.customer_fullname}</TableCell>
      <TableCell>
        {bill.products?.length || 0} /{" "}
        {bill.productTypeConstraints?.reduce(
          (acc, curr) => acc + curr.amount,
          0
        ) ?? 0}
      </TableCell>
      <TableCell>
        {bill.created_at
          ? formatThaiDate(new Date(bill.created_at))
          : "ไม่ได้ระบุ"}
      </TableCell>
      <TableCell>
        {bill.document_date
          ? formatThaiDate(new Date(bill.document_date))
          : "ไม่ได้ระบุ"}
      </TableCell>
      <TableCell>
        <div
          className={cn(
            "px-2 py-1 rounded-md text-sm w-max",
            bill.status === BILL_STATUS.WAIT_FOR_SCAN
              ? "bg-yellow-500 text-white"
              : "bg-green-500 text-white"
          )}
        >
          {bill.status}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleNavigateToBillDetail}
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <SendBillPDFButton
            bill={bill}
            products={bill.productsWithProductTypes || []}
          />
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default BillRow;
