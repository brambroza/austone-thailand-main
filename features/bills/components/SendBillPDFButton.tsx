import { Alert } from "@/components/ui/alert-message-dialog";
import { Button } from "@/components/ui/button";
import { FileIcon } from "lucide-react";
import { BillPDF } from "./BillPDF";
import { sendBillPdfToUserEmail } from "../actions/bills.action";
import { usePDF } from "@react-pdf/renderer";
import { convertProductToBillProduct } from "@/features/products/helpers/product.helper";
import { Bill } from "../types/bill.type";
import { ProductWithProductType } from "@/models/product.model";
import { formatThaiDate } from "../../../lib/utils/date.util";
import { useState } from "react";

interface ISendBillPDFButtonProps {
  bill: Bill;
  products: ProductWithProductType[];
}

const SendBillPDFButton = ({ bill, products }: ISendBillPDFButtonProps) => {
  const [pdfInstance] = usePDF({
    document: (
      <BillPDF
        billNumber={bill.bill_no}
        customerName={bill.customer_fullname}
        customerEmail={bill.customer_email || ""}
        billDate={formatThaiDate(new Date(bill.created_at || ""))}
        products={products?.map(convertProductToBillProduct) || []}
      />
    ),
  });
  const [isSendingPDF, setIsSendingPDF] = useState(false);

  const handleSendPDF = async () => {
    try {
      setIsSendingPDF(true);

      if (!pdfInstance.blob) {
        Alert.error("ไม่พบข้อมูล PDF");
        return;
      }

      const pdfArrayBuffer = await pdfInstance.blob.arrayBuffer();

      const pdfBuffer = Buffer.from(pdfArrayBuffer);

      const { isError, error } = await sendBillPdfToUserEmail(
        bill.id,
        pdfBuffer
      );

      if (isError) {
        Alert.error(error);
        return;
      }

      Alert.success("ส่ง PDF ไปยังอีเมลสำเร็จ");
    } catch (error: any) {
      Alert.error("ล้มเหลวในการส่ง PDF ไปยังอีเมล");
    } finally {
      setIsSendingPDF(false);
    }
  };
  return (
    <Button
      variant="outline"
      onClick={handleSendPDF}
      loading={isSendingPDF}
      disabled={isSendingPDF}
    >
      <FileIcon className="h-4 w-4" />
      ส่ง PDF
    </Button>
  );
};

export default SendBillPDFButton;
