"use client";

import { updateUser } from "@/actions/queries/users.action";
import { Alert } from "@/components/ui/alert-message-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { useEditUser } from "../_hooks";
import { useManageUserPageStore } from "../_store";
import { useFetchAllRoles } from "@/features/roles/hooks/queries/useFetchAllRoles";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useFetchUserPoint } from "@/hooks/fetch-data/useFetchUserInfos";

const provinces = [
  "กรุงเทพมหานคร",
  "สมุทรปราการ",
  "นนทบุรี",
  "ปทุมธานี",
  "พระนครศรีอยุธยา",
  "อ่างทอง",
  "ลพบุรี",
  "สิงห์บุรี",
  "ชัยนาท",
  "สระบุรี",
];

type Props = {
  onRefreshUsers: () => void;
};

const EditUserModal = ({ onRefreshUsers }: Props) => {
  const isEditDialogOpen = useManageUserPageStore(
    (state) => state.isEditDialogOpen
  );

  const { data: roles, isFetching: isFetchingRoles } = useFetchAllRoles();

  const { data: userpointoption, isFetching: isFetchingPointoption } = useFetchUserPoint();

  const setIsEditDialogOpen = useManageUserPageStore(
    (state) => state.setIsEditDialogOpen
  );

  const { editingUser, handleUpdateField, handleClose } = useEditUser();
 

  async function handleSaveUserProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      if (!editingUser?.user_id) {
        throw new Error("กรุณาเลือกผู้ใช้งานที่จะแก้ไข");
      }

      const { isError, error } = await updateUser({
        full_name: editingUser.full_name,
        phone_number: editingUser.phone_number,
        province: editingUser.province,
        user_id: editingUser.user_id,
        store_name: editingUser.store_name,
        agent_store_name: editingUser.agent_store_name,
        enabled_barcode_scan_at: editingUser.enabled_barcode_scan_at,
        role_id: roles
          ?.find((role) => role.title === editingUser.role_title)
          ?.id.toString(),
        point_multiplier: editingUser.point_multiplier,
      });

      if (isError) {
        Alert.error(error);
        return;
      }

      Alert.success("แก้ไขข้อมูลผู้ใช้งานสำเร็จ");

      setIsEditDialogOpen(false);

      onRefreshUsers();
    } catch (error: any) {
      Alert.error(error.message);
    }
  }

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลผู้ใช้</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSaveUserProfile} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อ</Label>
            <Input
              id="name"
              value={editingUser?.full_name}
              onChange={(e) => handleUpdateField("full_name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="store_name">ชื่อร้านค้า</Label>
            <Input
              id="store_name"
              value={editingUser?.store_name || ""}
              onChange={(e) => handleUpdateField("store_name", e.target.value)}
              placeholder="ไม่ระบุ"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agent_store_name">ชื่อร้านค้าตัวแทนจำหน่าย</Label>
            <Input
              id="agent_store_name"
              value={editingUser?.agent_store_name || ""}
              onChange={(e) =>
                handleUpdateField("agent_store_name", e.target.value)
              }
              placeholder="ไม่ระบุ"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
            <Input
              id="phone"
              value={editingUser?.phone_number}
              onChange={(e) =>
                handleUpdateField("phone_number", e.target.value)
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label>สิทธิ์การเข้าถึงการสแกนสินค้า</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="enabled_barcode_scan_at"
                checked={!!editingUser?.enabled_barcode_scan_at}
                onCheckedChange={(checked: boolean) =>
                  handleUpdateField(
                    "enabled_barcode_scan_at",
                    checked ? new Date().toISOString() : ""
                  )
                }
              />
              <Label htmlFor="enabled_barcode_scan_at">
                {editingUser?.enabled_barcode_scan_at
                  ? "เปิดใช้งาน"
                  : "ปิดใช้งาน"}
              </Label>
            </div>
          </div>



          <div className="space-y-2">
            <Label>จังหวัด</Label>
            <Select
              value={editingUser?.province}
              onValueChange={(value) => handleUpdateField("province", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกจังหวัด" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {provinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isFetchingRoles ? (
            <div className="flex justify-center">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="space-y-2 text-black">
              <Label htmlFor="role">สิทธิ์การเข้าถึง</Label>
              <Select
                value={editingUser?.role_title ?? ""}
                onValueChange={(value) =>
                  handleUpdateField("role_title", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสิทธิ์การเข้าถึง" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] overflow-y-auto">
                  {roles?.map((role) => (
                    <SelectItem key={role.title} value={role.title}>
                      {role.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2 text-black">
            <Label htmlFor="role">ระดับคะแนน</Label>
            <Select
              value={editingUser?.point_multiplier?.toString() ?? '1'}
              onValueChange={(value) =>
                handleUpdateField("point_multiplier", Number(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกระดับคะแนน" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {userpointoption?.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              ยกเลิก
            </Button>
            <Button
              className="bg-[#FFE14D] hover:bg-[#FFE14D]/90 text-black "
              type="submit"
            >
              บันทึก
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;
