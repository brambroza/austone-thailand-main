"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert-message-dialog";
import { Input } from "@/components/ui/input";
import { useFetchBarcodeScannerSettings } from "@/features/settings/hooks/queries/useMutateBarcodeScannerSettings";
import {
  toggleBarcodeScannerSetting,
  updateBarcodeScannerMessage,
} from "@/features/settings/actions/barcode-scanner-settings.action";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { getUserId } from "@/lib/utils/user.util";
export default function SettingsPage() {
  const {
    data: barcodeScannerSettings,
    refetch: refetchBarcodeScannerSettings,
  } = useFetchBarcodeScannerSettings();

  const { user } = useUser();

  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState(barcodeScannerSettings?.message);

  const handleToggleGlobalScan = async () => {
    try {
      setIsUpdating(true);

      if (!message) {
        Alert.error("กรุณาระบุเหตุผลในการปิดใช้งานการสแกน");
        return;
      }

      const { error, isError } = await toggleBarcodeScannerSetting(
        user ? getUserId(user) : "",
        message ?? ""
      );

      if (isError) throw new Error(error);

      refetchBarcodeScannerSettings();

      Alert.success(`บันทึกสำเร็จ`);
    } catch (error: any) {
      Alert.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  async function handleUpdateMessage() {
    try {
      setIsUpdating(true);

      const { error, isError } = await updateBarcodeScannerMessage(
        user ? getUserId(user) : "",
        message ?? ""
      );

      if (isError) throw new Error(error);

      refetchBarcodeScannerSettings();

      Alert.success(`บันทึกสำเร็จ`);
    } catch (error: any) {
      Alert.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    setMessage(barcodeScannerSettings?.message);
  }, [barcodeScannerSettings]);

  return (
    <div className="space-y-8 p-8 bg-yellow-300 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-left text-black">ตั้งค่าระบบ</h1>

      <Card className="p-8 bg-white shadow-md rounded-md">
        <div className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-black pb-3 border-b border-yellow-300">
              การสแกนบาร์โค้ด
            </h2>

            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Label className="text-lg text-black">
                  อนุญาตให้สแกนบาร์โค้ดทั้งระบบ
                </Label>
                <p className="text-sm text-gray-600">
                  เมื่อเปิดใช้งาน ผู้ใช้ทุกคนจะสามารถสแกนบาร์โค้ดได้
                </p>
                <div className="flex gap-x-3">
                  <Input
                    type="text"
                    placeholder="ระบุเหตุผลในการปิดใช้งาน"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isUpdating}
                    className="border border-yellow-300 rounded-md"
                  />
                  <Button
                    variant={"secondary"}
                    disabled={isUpdating}
                    onClick={handleUpdateMessage}
                  >
                    บันทึกข้อความ
                  </Button>
                </div>
              </div>
              <Switch
                disabled={isUpdating}
                checked={barcodeScannerSettings?.is_enabled}
                onCheckedChange={handleToggleGlobalScan}
                className="transform scale-125"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
