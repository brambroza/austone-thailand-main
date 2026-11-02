"use client";

import { Alert } from "@/components/ui/alert-message-dialog";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatThaiDate } from "@/lib/utils/date.util";
import { EyeIcon, TrashIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteBill } from "../actions/bills.action";
import { BILL_STATUS } from "../enums/bill.enum";
import { BillWithProductAndProductTypeAndProductTypeConstraint } from "../types/bill.type";

// library สร้าง PDF ใหญ่กว่า 400 kB จึงโหลดแยกจากหน้ารายการบิล
const SendBillPDFButton = dynamic(() => import("./SendBillPDFButton"), {
  ssr: false,
});

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

  return (
    <TableRow>
      <TableCell className="font-medium text-gray-900">{bill.bill_no}</TableCell>
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
            "px-2.5 py-1 rounded-full text-xs font-medium w-max",
            bill.status === BILL_STATUS.WAIT_FOR_SCAN
              ? "bg-amber-100 text-amber-700"
              : "bg-green-100 text-green-700"
          )}
        >
          {bill.status}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            title="ดูรายละเอียด"
            aria-label="ดูรายละเอียด"
            onClick={handleNavigateToBillDetail}
          >
            <EyeIcon className="h-4 w-4" />
          </Button>
          <SendBillPDFButton
            bill={bill}
            products={bill.productsWithProductTypes || []}
          />
          <Button
            variant="ghost"
            size="icon"
            title="ลบบิล"
            aria-label="ลบบิล"
            className="hover:bg-red-100 hover:text-red-600"
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
