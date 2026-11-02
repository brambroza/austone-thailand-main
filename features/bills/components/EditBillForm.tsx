"use client";

import Loading from "@/app/loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFetchAllProductTypes } from "@/features/products/hooks/queries/useFetchAllProductTypes";
import { formatThaiDate } from "@/lib/utils/date.util";
import { PDFViewer } from "@react-pdf/renderer";
import { Download, Eye } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFetchBillById } from "../hooks/queries/useFetchBillById";
import { useAddProductToBill } from "../hooks/useAddProductToBill";
import { useEditBillForm } from "../hooks/useEditBillForm";
import { useEditBillHelpers } from "../hooks/useEditBillHelpers";
import { useEditBillFormStore } from "../stores/useEditBillFormStore";
import { BillPDF } from "./BillPDF";
import BillTable from "./BillTable";
import SelectProductTypeInput from "./SelectProductTypeInput";

import { BILL_STATUS } from "../enums/bill.enum";

export function EditBillForm() {
  const router = useRouter();

  const { slug: billId } = useParams();

  const [showPreview, setShowPreview] = useState(false);

  const { data: bill, isFetching: isFetchingBill } = useFetchBillById(
    billId as string
  );

  const {
    register,
    syncFormData,
    syncBillProducts,
    syncBillProductTypeConstraints,
  } = useEditBillForm();

  const formState = useEditBillFormStore((state) => state);

  const reset = useEditBillFormStore((state) => state.reset);

  const { getRequiredProductAmount, handleUpdateBill, isUpdatingBill } =
    useEditBillHelpers(parseInt(billId as string));

  const { data: productTypes, isFetching: isFetchingAllProductTypes } =
    useFetchAllProductTypes();

  useAddProductToBill({
    productTypes: productTypes || [],
    billId: parseInt(billId as string),
  });

  useEffect(() => {
    reset();
    if (bill) {
      syncFormData(bill);
      syncBillProducts(bill.products || []);
      syncBillProductTypeConstraints(bill.product_type_constraints || []);
    }
  }, [JSON.stringify(bill)]);

  const handleExportToExcel = () => {
    const headers = ["รหัสสินค้า", "ประเภทสินค้า", "วิธีการเพิ่มสินค้า"];
    const csvContent = [
      "\ufeff" + headers.join(","), // Add BOM for Excel UTF-8 compatibility
      ...formState.products.map((product) => [
        product.id,
        (product.product_type?.title || "").replace(/,/g, ""), // Escape commas
        product.method.replace(/,/g, ""), // Escape commas
      ].join(",")),
    ].join("\r\n"); // Use CRLF line endings for Windows

    // Create a blob with UTF-8 BOM
    const blob = new Blob([csvContent], { 
      type: "text/csv;charset=utf-8;" 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bill_${formState.bill_no}_products.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  if (isFetchingBill) {
    return <Loading />;
  }

  if (!bill) {
    return <div>ไม่พบข้อมูลบิล</div>;
  }

  return (
    <>
      {showPreview ? (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8">
          <div className="bg-white rounded-lg p-4 w-full h-full relative">
            <Button
              variant="outline"
              className="absolute right-6 top-6 z-10"
              onClick={() => setShowPreview(false)}
            >
              ปิด
            </Button>
            <PDFViewer className="w-full h-full">
              <BillPDF
                billNumber={formState.bill_no}
                customerName={formState.customer_fullname}
                customerEmail={formState.customer_email}
                products={formState.products}
                billDate={formatThaiDate(new Date())}
              />
            </PDFViewer>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleUpdateBill} className="max-w-5xl mx-auto space-y-8">
        <nav className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            แก้ไขข้อมูลบิล {formatThaiDate(new Date())}
          </h1>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleExportToExcel}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              ส่งออกเป็น Excel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(true)}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              ดูตัวอย่าง PDF
            </Button>
          </div>
        </nav>

        <Card className="p-8 bg-white/50 backdrop-blur-sm shadow-lg">
          <div className="space-y-6">
            <h2 className="text-lg font-medium pb-2 border-b">ข้อมูลบิล</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="bill_number" className="text-sm font-medium">
                  เลขที่บิล
                </Label>
                <Input
                  className="bg-white/70 backdrop-blur-sm"
                  id="bill_no"
                  {...register("bill_no")}
                  placeholder="กรอกเลขที่บิล"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_name" className="text-sm font-medium">
                  ชื่อลูกค้า
                </Label>
                <Input
                  className="bg-white/70 backdrop-blur-sm"
                  id="customer_fullname"
                  {...register("customer_fullname")}
                  placeholder="กรอกชื่อลูกค้า"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer_email" className="text-sm font-medium">
                  อีเมลลูกค้า
                </Label>
                <Input
                  className="bg-white/70 backdrop-blur-sm"
                  id="customer_email"
                  type="email"
                  {...register("customer_email")}
                  placeholder="กรอกอีเมลลูกค้า"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bill_status" className="text-sm font-medium">
                  สถานะของบิล
                </Label>
                <select
                  id="bill_status"
                  className="w-full px-3 py-2 border rounded-md bg-white/70 backdrop-blur-sm"
                  {...register("status")}
                >
                  {Object.values(BILL_STATUS).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document_date" className="text-sm font-medium">
                วันที่บิล
              </Label>
              <Input
                className="bg-white/70 backdrop-blur-sm"
                id="document_date"
                type="date"
                {...register("document_date")}
              />
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-medium pb-2 border-b mb-4">
              กำหนดประเภทสินค้า
            </h2>
            {isFetchingAllProductTypes ? (
              <Loading />
            ) : (
              productTypes && (
                <SelectProductTypeInput
                  productTypes={productTypes}
                  billId={bill.id}
                />
              )
            )}
          </div>
        </Card>

        <Card className="p-8 bg-white/50 backdrop-blur-sm shadow-lg">
          <h2 className="text-lg font-medium pb-2 border-b mb-4">
            สแกนสินค้ามาแล้ว ({formState.products.length} /{" "}
            {getRequiredProductAmount()})
          </h2>
          <BillTable />
        </Card>

        <footer className="flex items-center justify-end gap-4 w-full">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            ยกเลิก
          </Button>
          <Button
            loading={isUpdatingBill}
            type="submit"
            className="bg-[#FFE14D] hover:bg-[#FFE14D]/90 text-black"
          >
            บันทึกบิล
          </Button>
        </footer>
      </form>
    </>
  );
}
