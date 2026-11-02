import { transferUserScores } from "@/actions/queries/score.action";
import { Alert } from "@/components/ui/alert-message-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFetchUserInfos } from "@/hooks/fetch-data/useFetchUserInfos";
import { User, UserInfoView } from "@/models/user.model";
import { Search } from "lucide-react";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ITransferUserScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
  sourceUserId: User["user_id"];
}

const TransferUserScoreModal = ({
  isOpen,
  onClose,
  onRefreshData,
  sourceUserId,
}: ITransferUserScoreModalProps) => {
  const [targetUserId, setTargetUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: users } = useFetchUserInfos();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers =
    users?.filter(
      (user) =>
        user.user_id !== sourceUserId &&
        (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.store_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phone_number?.includes(searchQuery))
    ) || [];

  async function handleTransferScore() {
    try {
      if (!targetUserId) {
        Alert.error("กรุณาเลือกเป้าหมายผู้ใช้");
        return;
      }

      setIsLoading(true);
      const { error } = await transferUserScores(targetUserId, sourceUserId);

      if (error) {
        Alert.error(error);
        return;
      }

      Alert.success("โอนคะแนนสำเร็จ");
      onRefreshData();
      onClose();
    } catch (error: any) {
      Alert.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>โอนคะแนนผู้ใช้</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาผู้ใช้"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <Select value={targetUserId} onValueChange={setTargetUserId}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกผู้ใช้ที่ต้องการโอนคะแนนไปให้" />
            </SelectTrigger>
            <SelectContent>
              {filteredUsers.length === 0
                ? null
                : filteredUsers.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.full_name || "ไม่ระบุชื่อ"} -{" "}
                      {user.store_name || "ไม่ระบุร้านค้า"}
                      {user.phone_number ? ` (${user.phone_number})` : ""}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>

          <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md">
            <p>
              คำเตือน: การโอนคะแนนจะไม่สามารถย้อนกลับได้
              กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนดำเนินการ
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleTransferScore}
            disabled={!targetUserId || isLoading}
          >
            {isLoading ? "กำลังโอนคะแนน..." : "ยืนยันการโอนคะแนน"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferUserScoreModal;
