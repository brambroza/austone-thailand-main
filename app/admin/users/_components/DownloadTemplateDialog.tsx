"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

// ปรับ import ให้ตรงโปรเจกต์คุณ
import { Alert } from "@/components/ui/alert-message-dialog";
import type { UserInfoView } from "@/models/user.model";
import { searchUser } from "@/features/users/helper/search-user.helper";
import { downloadImportTemplateXlsxWithUser } from "@/features/excel/excelTemplate";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    users: UserInfoView[];
};

export default function DownloadTemplateDialog({ open, onOpenChange, users }: Props) {
    const [q, setQ] = useState("");
    const [selected, setSelected] = useState<UserInfoView | null>(null);
    const [downloading, setDownloading] = useState(false);

    const filtered = useMemo(() => searchUser(q, users ?? []), [q, users]);

    const handleDownload = async () => {
        try {
            if (!selected?.user_id) {
                Alert.error("กรุณาเลือกผู้ใช้ก่อน");
                return;
            }
            setDownloading(true);
            await downloadImportTemplateXlsxWithUser(selected.user_id);
            onOpenChange(false);
        } catch (e: any) {
            Alert.error(e?.message ?? "ดาวน์โหลด template ไม่สำเร็จ");
        } finally {
            setDownloading(false);
        }
    };

    const subtitle = selected
        ? `${selected.full_name ?? selected.store_name ?? ""} (${selected.user_id})`
        : "ยังไม่ได้เลือกผู้ใช้";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>ดาวน์โหลด Template Excel</DialogTitle>
                    <div className="text-sm text-muted-foreground">{subtitle}</div>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="ค้นหา user (ชื่อ/ร้าน/เบอร์/รหัส)"
                            className="pl-8"
                        />
                    </div>

                    <div className="max-h-[360px] overflow-auto space-y-2">
                        {filtered?.length ? (
                            filtered.map((u) => {
                                const active = selected?.user_id === u.user_id;
                                return (
                                    <Card
                                        key={u.user_id}
                                        className={`p-3 cursor-pointer hover:bg-muted/50 ${active ? "border-primary" : ""
                                            }`}
                                        onClick={() => setSelected(u)}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="font-medium truncate">
                                                    {u.full_name ?? u.store_name ?? "-"}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    ชื่อร้านค้า: {u.store_name} 
                                                   {'::'}  ( {u.agent_store_name} )
                                                </div>
                                                 <div className="text-xs text-muted-foreground truncate">
                                                    เบอร์โทร: {u.phone_number} 
                                                </div>
                                            </div>
                                            {active && (
                                                <div className="text-xs font-semibold text-primary">
                                                    เลือกแล้ว
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                );
                            })
                        ) : (
                            <div className="text-sm text-muted-foreground">
                                ไม่พบผู้ใช้ตามคำค้นหา
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleDownload}
                        disabled={!selected || downloading}
                        className="bg-[#FFE14D] hover:bg-[#FFE14D]/90 text-black"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        {downloading ? "กำลังสร้างไฟล์..." : "ดาวน์โหลด Template"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
