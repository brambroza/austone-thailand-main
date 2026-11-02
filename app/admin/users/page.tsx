"use client";

import { useRef, useState } from "react";
import { Search, Download, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingModal } from "@/components/ui/loading-modal";
import { Alert } from "@/components/ui/alert-message-dialog";

import { searchUser } from "@/features/users/helper/search-user.helper";
import { useFetchUserInfos } from "@/hooks/fetch-data/useFetchUserInfos";
import { useManageUserPageStore } from "./_store";
import { UsersTable } from "./_components/UsersTable";
import EditUserModal from "./_components/EditUserModal";
import DeleteUserDialog from "./_components/DeleteUserDialog";

import { UserInfoView } from "@/models/user.model";
import { AllScannedBarcodes } from "@/actions/queries/scanned-barcodes.action";
 
import { importExcelToSupabaseClientOnly } from "@/features/excel/importExcelClient";

import DownloadTemplateDialog from "./_components/DownloadTemplateDialog";

export default function UsersPage() {
  const searchQuery = useManageUserPageStore((s) => s.searchQuery);
  const setSearchQuery = useManageUserPageStore((s) => s.setSearchQuery);

  const { data: users, isFetching, refetch } = useFetchUserInfos();
  const filteredUsers = searchUser(searchQuery, users ?? []);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const [openDownload, setOpenDownload] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const handleScanallBarcode = async (user: UserInfoView) => {
    try {
      const res = await AllScannedBarcodes(user.user_id, 1, 2);
      if (res.isError) Alert.error(res.error);
      else Alert.success(`สแกนบาร์โค๊ดสินค้าเรียบร้อย (เพิ่ม ${res.data?.inserted ?? 0})`);
    } catch (e: any) {
      Alert.error(e?.message ?? "เกิดข้อผิดพลาด");
    }
  };


  const handlePickExcel = () => fileRef.current?.click();

  const handleUploadExcel = async (file: File) => {
    setUploading(true);
    try {
      const res = await importExcelToSupabaseClientOnly(file);
      Alert.success(`นำเข้า Excel สำเร็จ (อ่าน ${res.imported} แถว)`);
      // ถ้าต้อง refresh:
      // await refetch();
    } catch (e: any) {
      console.log("e?.messag" ,e?.message);
      Alert.error(e?.message ?? "นำเข้าไฟล์ล้มเหลว");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาผู้ใช้"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="bg-[#FFE14D] hover:bg-[#FFE14D]/90 text-black"
            onClick={() => {
              setReloadKey((prev) => prev + 1);
              setOpenDownload(true);}}
          >
            <Download className="mr-2 h-4 w-4" />
            ดาวน์โหลด Excel
          </Button>

          <input
            ref={fileRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]; 
              if (f) handleUploadExcel(f);
            }}
          />

          <Button onClick={handlePickExcel} variant="outline" disabled={uploading}>
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "กำลังนำเข้า..." : "นำเข้าไฟล์ Excel"}
          </Button>
        </div>
      </div>

      {filteredUsers && (
        <Card className="p-6">
          <UsersTable
            users={filteredUsers}
            onRefreshData={refetch}
            onScanallBarcode={handleScanallBarcode}
          />
        </Card>
      )}

      <EditUserModal onRefreshUsers={refetch} />
      <DeleteUserDialog />

      <LoadingModal
        isOpen={isFetching || uploading}
        message={uploading ? "กำลังนำเข้า Excel..." : "กำลังโหลดข้อมูลรายชื่อผู้ใช้..."}
      />

      <DownloadTemplateDialog
        key={reloadKey}
        open={openDownload}
        onOpenChange={setOpenDownload}
        users={users ?? []}  // หรือ users ?? [] ก็ได้
      />

    </div>
  );
}
