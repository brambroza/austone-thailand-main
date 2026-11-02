"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpDown, History, Pencil, Trash2, Barcode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { UserInfoView } from "@/models/user.model";

type Props = {
  user: UserInfoView;
  onEditClick: (user: UserInfoView) => void;
  onDeleteClick: (user: UserInfoView) => void;
  onTransferScoreClick: () => void;
  onScanallBarcode: (user : UserInfoView) => void;
};

export default function UserRow({
  user,
  onEditClick,
  onDeleteClick,
  onTransferScoreClick,
  onScanallBarcode,
}: Props) {
  const count = useMemo(() => Number(user?.scorewithoutscan ?? 0), [user]);

  const [openScanConfirm, setOpenScanConfirm] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleConfirmScanAll = async () => {
    try {
      setIsScanning(true);
      // เรียกจริง (ของเดิมคุณไม่ได้เรียก)
      await Promise.resolve(onScanallBarcode(user));
      setOpenScanConfirm(false);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <TableRow key={user.user_id} className="hover:bg-muted/50">
      <TableCell className="font-medium">{user.full_name ?? "ไม่ระบุ"}</TableCell>
      <TableCell>{user.store_name || "ไม่ระบุ"}</TableCell>
      <TableCell>{user.agent_store_name || "ไม่ระบุ"}</TableCell>
      <TableCell>{user.phone_number ?? "ไม่ระบุ"}</TableCell>
      <TableCell>{user.province ?? "ไม่ระบุ"}</TableCell>
      <TableCell>{user.total_score?.toLocaleString("th-TH") ?? 0}</TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          {/* Scan All Barcode + Confirm */}
          <AlertDialog open={openScanConfirm} onOpenChange={setOpenScanConfirm}>
          {/*   <div className="relative inline-flex">
              <AlertDialogTrigger asChild>
                <Button
                  disabled={count === 0 || isScanning}
                  variant="ghost"
                  size="icon"
                  title={
                    count === 0
                      ? "ไม่มีรายการที่ยังไม่ได้สแกน"
                      : "สแกนบาร์โค้ดทั้งหมดที่ยังไม่ได้สแกน"
                  }
                >
                  <Barcode className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>

              {count > 0 && (
                <span className="absolute -right-2 -top-2 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-[18px] text-white ring-2 ring-background">
                  {count > 999 ? "999+" : count}
                </span>
              )}
            </div> */}

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>ยืนยันการสแกนบาร์โค้ดทั้งหมด</AlertDialogTitle>
                <AlertDialogDescription>
                  ระบบจะทำการสแกนรายการบาร์โค้ดที่ยังไม่ได้สแกนจำนวน{" "}
                  <span className="font-semibold text-foreground">
                    {count.toLocaleString("th-TH")}
                  </span>{" "}
                  รายการ สำหรับผู้ใช้{" "}
                  <span className="font-semibold text-foreground">
                    {user.full_name ?? "ไม่ระบุชื่อ"}
                  </span>
                  <br />
                  <span className="text-destructive">
                    การทำรายการนี้อาจย้อนกลับไม่ได้
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isScanning}>ยกเลิก</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmScanAll}
                  disabled={isScanning}
                >
                  {isScanning ? "กำลังสแกน..." : "ยืนยันสแกนทั้งหมด"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* History */}
          <Link href={`/admin/users/${user.user_id}/scanned-barcodes`}>
            <Button variant="ghost" size="icon" title="ดูประวัติการสแกน/แลกของรางวัล">
              <History className="h-4 w-4" />
            </Button>
          </Link>

          {/* Edit */}
          <Button variant="ghost" size="icon" onClick={() => onEditClick(user)} title="แก้ไข">
            <Pencil className="h-4 w-4" />
          </Button>

          {/* Delete */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteClick(user)}
            className="hover:bg-red-100 hover:text-red-600"
            title="ลบผู้ใช้"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          {/* Transfer Score */}
          <Button variant="ghost" size="icon" onClick={onTransferScoreClick} title="โอนคะแนน">
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
