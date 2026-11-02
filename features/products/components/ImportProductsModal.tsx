"use client";

import { Alert } from "@/components/ui/alert-message-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { useFetchAllProductTypes } from "@/features/products/hooks/queries/useFetchAllProductTypes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ImportProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
  isImporting: boolean;
  importProgress?: string;
}

export default function ImportProductsModal({
  isOpen,
  onClose,
  onImport,
  isImporting,
  importProgress,
}: ImportProductsModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { data: productTypes, isFetching: isFetchingProductTypes } =
    useFetchAllProductTypes();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && file.type !== "text/csv") {
      Alert.error("กรุณาเลือกไฟล์ CSV เท่านั้น");
      return;
    }

    setSelectedFile(file || null);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    await onImport(selectedFile);
    setSelectedFile(null);
  };

  const handleDownloadTemplate = () => {
    // Create CSV content
    const headers = "id,product_type_id\n";
    const example = "123456,1\n789012,2";
    const csvContent = headers + example;

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product_import_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>นำเข้าสินค้าจากไฟล์ CSV</DialogTitle>
          <DialogDescription>
            อัปโหลดไฟล์ CSV เพื่อนำเข้าสินค้าจำนวนมาก
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              ดาวน์โหลดเทมเพลต
            </Button>
          </div>

          <div className="space-y-2">
            <Label>เลือกไฟล์ CSV</Label>
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isImporting}
            />
          </div>

          <div className="space-y-2">
            <Label>ตารางอ้างอิงประเภทสินค้า</Label>
            {isFetchingProductTypes ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="flex h-[300px] flex-col overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>รหัสประเภทสินค้า</TableHead>
                      <TableHead>ชื่อประเภทสินค้า</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productTypes?.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell>{type.id}</TableCell>
                        <TableCell>{type.title}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          {importProgress && (
            <span className="mr-auto text-sm text-muted-foreground">
              {importProgress}
            </span>
          )}
          <Button variant="outline" onClick={onClose} disabled={isImporting}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || isImporting}
            className="bg-[#FFE14D] hover:bg-[#FFE14D]/90 text-black gap-2"
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            นำเข้าสินค้า
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
