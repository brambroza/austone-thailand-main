"use client";

import { Alert } from "@/components/ui/alert-message-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Reward } from "@/models/reward.model";
import { useState } from "react";

interface ClaimRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (email: string, shippingAddress: string) => Promise<void>;
  reward: Reward;
}

export default function ClaimRewardModal({
  isOpen,
  onClose,
  onConfirm,
  reward,
}: ClaimRewardModalProps) {
  const [email, setEmail] = useState("");

  const [shippingAddress, setShippingAddress] = useState("");

  const [isClaiming, setIsClaiming] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      Alert.error("กรุณากรอกอีเมล");
      return;
    }

    if (!shippingAddress.trim()) {
      Alert.error("กรุณากรอกที่อยู่จัดส่ง");
      return;
    }

    try {
      setIsClaiming(true);

      await onConfirm(email, shippingAddress);

      onClose();

      setEmail("");

      setShippingAddress("");
    } catch (error: any) {
      Alert.error(error.message);
    } finally {
      setIsClaiming(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>แลกรางวัล: {reward.title}</DialogTitle>
            <DialogDescription>
              กรุณากรอกข้อมูลสำหรับการจัดส่งของรางวัล
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shipping-address">ที่อยู่จัดส่ง</Label>
              <Textarea
                id="shipping-address"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="กรุณากรอกที่อยู่จัดส่งที่สามารถติดต่อได้"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isClaiming}
            >
              ยกเลิก
            </Button>
            <Button type="submit" loading={isClaiming}>
              ยืนยัน
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
