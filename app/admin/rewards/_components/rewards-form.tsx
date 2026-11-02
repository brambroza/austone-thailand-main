"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingModal } from "@/components/ui/loading-modal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Reward } from "./types";
import { Alert } from "@/components/ui/alert-message-dialog";

interface RewardsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reward: Reward) => void;
  editingReward: Reward | null;
  isLoading?: boolean;
  loadingMessage?: string;
}

export function RewardsForm({
  isOpen,
  onClose,
  onSubmit,
  editingReward,
  isLoading = false,
  loadingMessage = "กำลังบันทึกข้อมูล...",
}: RewardsFormProps) {
  const [expirationDate, setExpirationDate] = useState<Date | null>(
    editingReward?.expirationDate || null
  );

  const [availableAt, setAvailableAt] = useState<Date | null>(
    editingReward?.availableAt || null
  );

  const [imagePreview, setImagePreview] = useState<string | null>(
    editingReward?.image || null
  );

  useEffect(() => {
    setExpirationDate(editingReward?.expirationDate || null);
    setAvailableAt(editingReward?.availableAt || null);
    setImagePreview(editingReward?.image || null);
  }, [editingReward]);

  const formatDateOnly = (date: Date | null) => {
    if (!date) return null;

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    if (!expirationDate) {
      Alert.error("กรุณาเลือกวันหมดอายุ");
      return;
    }

    if (!availableAt) {
      Alert.error("กรุณาเลือกวันที่เริ่มใช้งานได้");
      return;
    }

    if (!imagePreview) {
      Alert.error("กรุณาเลือกรูปภาพ");
      return;
    }

    if (availableAt >= expirationDate) {
      Alert.error("วันที่เริ่มใช้งานต้องมาก่อนวันหมดอายุ");
      return;
    }

    const reward: Reward = {
      id: editingReward?.id || 0,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      points: parseInt(formData.get("points") as string),
      image: imagePreview,
      isActive: editingReward?.isActive || true,
      /*    expirationDate: expirationDate,
         availableAt: availableAt, */
      expirationDate: formatDateOnly(expirationDate) as any,
      availableAt: formatDateOnly(availableAt) as any,
      amount: parseInt(formData.get("amount") as string),
      isAlertEnabled: editingReward?.isAlertEnabled || false,
    };

    console.log("reward", reward);

    onSubmit(reward);
  };

  const [openAvailable, setOpenAvailable] = useState(false);
  const [openExpiration, setOpenExpiration] = useState(false);

  const toDateOrNull = (value: Date | string | null | undefined) => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };




  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }

    try {
      const base64 = await convertFileToBase64(file);
      setImagePreview(base64);
    } catch (error) {
      console.error("Error converting image to base64:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          const base64String = reader.result.split(",")[1];
          resolve(base64String);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const getImageSrc = (preview: string) => {
    if (preview.startsWith("http")) {
      return preview;
    }
    if (preview.startsWith("data:")) {
      return preview;
    }
    return `data:image/png;base64,${preview}`;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingReward?.id ? "แก้ไขของรางวัล" : "เพิ่มของรางวัล"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อของรางวัล</Label>
              <Input
                id="name"
                name="name"
                defaultValue={editingReward?.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingReward?.description}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="points">แต้มที่ใช้</Label>
              <Input
                id="points"
                name="points"
                type="number"
                min={0}
                defaultValue={editingReward?.points}
                disabled={editingReward?.id !== undefined}
                required
              />
              {editingReward?.id && (
                <p className="text-sm text-muted-foreground">
                  * ไม่สามารถแก้ไขแต้มได้เพื่อรักษาประวัติการแลกของรางวัล
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">จำนวนคูปองที่ใช้ได้</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min={0}
                defaultValue={editingReward?.amount}
                required
              />
            </div>
            {/* <div className="space-y-2">
              <Label>
                วันที่เริ่มใช้งานได้ <span className="text-red-500">*</span>
              </Label>

              <Popover open={openAvailable} onOpenChange={setOpenAvailable}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !availableAt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {availableAt
                      ? format(availableAt, "dd MMMM yyyy", { locale: th })
                      : "เลือกวันที่เริ่มใช้งานได้"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                  <Calendar
                    mode="single"
                    selected={availableAt ?? undefined}
                    onSelect={(date) => {
                      setAvailableAt(date ?? null);

                      if (expirationDate && date && expirationDate <= date) {
                        setExpirationDate(null);
                      }

                      setOpenAvailable(false);
                    }}
                    locale={th}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div> */}
            <div className="space-y-2">
              <Label>
                วันที่เริ่มใช้งานได้ <span className="text-red-500">*</span>
              </Label>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !availableAt && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {availableAt
                      ? format(availableAt, "dd MMMM yyyy", { locale: th })
                      : "เลือกวันที่เริ่มใช้งานได้"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                  <Calendar
                    mode="single"
                    selected={availableAt ?? undefined}
                    onSelect={(date) => {
                      setAvailableAt(date ?? null);
                    }}
                    locale={th}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/*           <div className="space-y-2">
              <Label>
                วันหมดอายุ <span className="text-red-500">*</span>
              </Label>

              <Popover open={openExpiration} onOpenChange={setOpenExpiration}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expirationDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expirationDate
                      ? format(expirationDate, "dd MMMM yyyy", { locale: th })
                      : "เลือกวันหมดอายุ"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                  <Calendar
                    mode="single"
                    selected={expirationDate ?? undefined}
                    onSelect={(date) => {
                      setExpirationDate(date ?? null);
                      setOpenExpiration(false);
                    }}
                    locale={th}
                    disabled={(date) => {
                      if (!availableAt) return false;
                      return date <= availableAt;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
 */}

            <div className="space-y-2">
              <Label>
                วันหมดอายุ <span className="text-red-500">*</span>
              </Label>
              <Popover modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !expirationDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expirationDate
                      ? format(expirationDate, "dd MMMM yyyy", { locale: th })
                      : "เลือกวันหมดอายุ"}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                  <Calendar
                    mode="single"
                    selected={expirationDate ?? undefined}
                    onSelect={(date) => {
                      setExpirationDate(date ?? null);
                    }}
                    locale={th}
                    disabled={(date) => {
                      if (!availableAt) return false;
                      return date <= availableAt;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>


            <div className="space-y-2">
              <Label htmlFor="image">
                รูปภาพ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={!imagePreview}
              />
              {imagePreview && (
                <div className="relative">
                  <img
                    src={getImageSrc(imagePreview)}
                    alt="Preview"
                    className="h-20 w-20 object-cover rounded-md mt-2"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isLoading}>
                {editingReward?.id ? "บันทึก" : "เพิ่ม"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <LoadingModal isOpen={isLoading} message={loadingMessage} />
    </>
  );
}
