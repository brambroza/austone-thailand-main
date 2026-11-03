"use client";

import { Alert } from "@/components/ui/alert-message-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ProductType, ProductTypePromotion } from "../types/product.type";
import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";


type ProductTypePayload =
  | { id: number; title: string; can_collect_points: boolean }
  | { title: string; can_collect_points: boolean };

type SavePayload = {
  productType: ProductTypePayload;
  promotions: ProductTypePromotion[]; // เปลี่ยนเป็น type จริงของคุณ
};

interface ProductTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: SavePayload) => Promise<boolean>;
  productType?: ProductType | null;
  isProcessing: boolean;
  productTypePromotions?: ProductTypePromotion[]
}



function toLocalDateValue(d: Date) {
  // สำหรับ input type="date" ต้องรูปแบบ YYYY-MM-DD
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// แปลง "YYYY-MM-DD" ให้เป็น ISO โดย "ยึดเวลา local" กัน timezone เพี้ยน
function localDateToISOStart(dateStr: string) {
  // 00:00:00.000 (local)
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
  return dt.toISOString();
}

function localDateToISOEnd(dateStr: string) {
  // 23:59:59.999 (local)
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1, 23, 59, 59, 999);
  return dt.toISOString();
}

function uuid() {
  return crypto.randomUUID();
}

export default function ProductTypeModal({
  isOpen,
  onClose,
  onSave,
  productType,
  isProcessing,
  productTypePromotions,
}: ProductTypeModalProps) {
  const [title, setTitle] = useState("");
  const [canCollectPoints, setCanCollectPoints] = useState(true);
  const isEditing = !!productType;

  const datapromotions = productTypePromotions?.filter((e) => e.product_type_id === productType?.id) ?? [];

  

  const [rows, setRows] = useState<ProductTypePromotion[]>(datapromotions);

  useEffect(() => {
    if (productType) setTitle(productType.title);
    else setTitle("");
    setCanCollectPoints(productType?.can_collect_points ?? true);

    // เปิด modal แล้วให้มี 1 row เริ่มต้นเสมอ (จะได้ไม่ว่าง)
    /* if (isOpen) {
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      setRows([
        {
          id: uuid(),
          startLocal: toLocalDateValue(today),
          endLocal: toLocalDateValue(tomorrow),
          point: "1",
        },
      ]);
    } */
  }, [productType, isOpen]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.error("กรุณากรอกชื่อประเภทสินค้า");
      return;
    }


    const promotions = rows.map((r, i) => {
      if (!r.startdate || !r.enddate) {
        throw new Error(`ROW_${i}_DATE_REQUIRED`);
      }

      const startISO = localDateToISOStart(r.startdate); // 00:00 local -> ISO
      const endISO = localDateToISOEnd(r.enddate);       // 23:59 local -> ISO

      const s = new Date(startISO);
      const e = new Date(endISO);
      if (!(e > s)) throw new Error(`ROW_${i}_DATE_RANGE`);

      const point = Number(r.point ?? "1");
      if (!Number.isFinite(point) || point < 0 || point > 32767) {
        throw new Error(`ROW_${i}_POINT_INVALID`);
      }

      return {
        id: r.id,
        startdate: startISO,
        enddate: endISO,
        point,
        product_type_id: 0,
      };
    });


    promotions.sort((a, b) => +new Date(a.startdate) - +new Date(b.startdate));


    try {
      const success = await onSave({
        productType: isEditing
          ? { id: Number(productType!.id), title, can_collect_points: canCollectPoints }
          : { title, can_collect_points: canCollectPoints },
        promotions,
      });

      if (success) onClose();
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (msg.includes("DATE_REQUIRED")) return Alert.error("กรุณาเลือกวันเริ่มต้น/วันสิ้นสุดให้ครบ");
      if (msg.includes("DATE_RANGE")) return Alert.error("วันสิ้นสุดต้องมากกว่าวันเริ่มต้น");
      if (msg.includes("POINT_INVALID")) return Alert.error("Point ไม่ถูกต้อง");
      Alert.error("บันทึกไม่สำเร็จ");
    }
  };

  const addRow = () => {
    const base = rows[rows.length - 1];
    const start = base?.enddate ? base.enddate : toLocalDateValue(new Date());
    const next = new Date(new Date(start).getTime() + 24 * 60 * 60 * 1000);

    setRows((prev) => [
      ...prev,
      {
        id: uuid(),
        startdate: start,
        enddate: toLocalDateValue(next),
        point: 1,
        product_type_id: 0,
      },
    ]);
  };

  const removeRow = (id: string) => setRows((prev) => prev.filter((x) => x.id !== id));
  const updateRow = (id: string, patch: Partial<ProductTypePromotion>) =>
    setRows((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "แก้ไขประเภทสินค้า" : "เพิ่มประเภทสินค้า"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>ชื่อประเภทสินค้า</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="กรอกชื่อประเภทสินค้า"
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <div className="space-y-1">
              <Label htmlFor="can-collect-points">สแกนสะสมแต้มได้</Label>
              <p className="text-xs text-muted-foreground">
                ปิดไว้ ลูกค้าจะสแกนสินค้าประเภทนี้เพื่อสะสมแต้มไม่ได้ แต้มที่สะสมไปแล้วยังอยู่ครบ
              </p>
            </div>
            <Switch
              id="can-collect-points"
              checked={canCollectPoints}
              onCheckedChange={setCanCollectPoints}
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>รายการโปรโมชั่น</Label>
            <Button type="button" variant="outline" onClick={addRow} disabled={isProcessing}>
              <Plus className="mr-2 h-4 w-4" />
              เพิ่มรายการ
            </Button>
          </div>

          <div className="space-y-3">
            {rows.map((r, idx) => {
              const s = r.startdate;
              const e = r.enddate;
              const invalidRange = !!(s && e && !(e > s));

              return (
                <div key={r.id} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-semibold">รายการที่ {idx + 1}</div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeRow(r.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>วันเริ่มต้น</Label>
                      <Input
                        type="date"
                        value={toLocalDateValue(new Date(r.startdate))}
                        onChange={(e) => updateRow(r.id, { startdate: e.target.value })}
                        disabled={isProcessing}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>วันสิ้นสุด</Label>
                      <Input
                        type="date"
                        value={toLocalDateValue(new Date(r.enddate))}
                        onChange={(e) => updateRow(r.id, { enddate: e.target.value })}
                        disabled={isProcessing}
                      />
                      {invalidRange && (
                        <div className="text-xs text-red-600">วันสิ้นสุดต้องมากกว่าวันเริ่มต้น</div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Point</Label>
                      <Input
                        inputMode="numeric"
                        value={r.point}
                        onChange={(e) => updateRow(r.id, { point: Number(e.target.value) })}
                        placeholder="1"
                        disabled={isProcessing}
                      />
                      <div className="text-xs text-muted-foreground">smallint (เช่น 1, 2, 5)</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleSave}
            disabled={isProcessing || !title.trim()}
            className="bg-[#FFE14D] hover:bg-[#FFE14D]/90 text-black"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? "บันทึก" : "เพิ่ม"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}