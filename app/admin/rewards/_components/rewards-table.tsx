"use client";

import { getRewardImageById } from "@/actions/storage/reward-storage.action";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { Reward } from "./types";

interface RewardRowProps {
  reward: Reward;
  onEdit: (reward: Reward) => void;
  onToggleStatus: (id: number, checked: boolean) => void;
  onToggleAlertEnable: (id: number, checked: boolean) => void;
}

function RewardRow({ reward, onEdit, onToggleStatus, onToggleAlertEnable }: RewardRowProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const result = await getRewardImageById({ id: reward.id });
        const url = SafeActionUtil.getData<string>(result);
        setImageUrl(url);
      } catch (error) {
        console.error(`Failed to fetch image for reward ${reward.id}:`, error);
      }
    };

    fetchImage();
  }, [reward.id]);

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={reward.name}
            className="h-10 w-10 object-cover rounded-md"
          />
        ) : (
          <div className="h-10 w-10 bg-muted rounded-md" />
        )}
      </TableCell>
      <TableCell className="font-medium">{reward.name}</TableCell>
      <TableCell>{reward.description}</TableCell>
      <TableCell>{reward.points.toLocaleString("th-TH")}</TableCell>
      <TableCell>{reward.amount.toLocaleString("th-TH")}</TableCell>
      <TableCell>
        {reward.availableAt
          ? format(reward.availableAt, "dd MMMM yyyy", {
            locale: th,
          })
          : "ไม่มีกำหนด"}
      </TableCell>
      <TableCell>
        {reward.expirationDate
          ? format(reward.expirationDate, "dd MMMM yyyy", {
            locale: th,
          })
          : "ไม่มีกำหนด"}
      </TableCell>
      <TableCell>
        <Switch
          checked={reward.isActive}
          onCheckedChange={(checked) => onToggleStatus(reward.id, checked)}
        />

      </TableCell>
      <TableCell>
        <Switch
          checked={reward.isAlertEnabled}
          onCheckedChange={(checked) => onToggleAlertEnable(reward.id, checked)}
        />

      </TableCell>
      <TableCell>
        <Button variant="ghost" size="icon" onClick={() => onEdit(reward)}>
          <Pencil className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

interface RewardsTableProps {
  rewards: Reward[];
  onEdit: (reward: Reward) => void;
  onToggleStatus: (reward: Reward) => void;
  onToggleAlertEnable: (reward: Reward) => void;
}

export function RewardsTable({
  rewards,
  onEdit,
  onToggleStatus,
  onToggleAlertEnable,
}: RewardsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>รูปภาพ</TableHead>
          <TableHead>ชื่อของรางวัล</TableHead>
          <TableHead>รายละเอียด</TableHead>
          <TableHead>แต้มที่ใช้</TableHead>
          <TableHead>จำนวนคูปองที่ใช้ได้</TableHead>
          <TableHead>วันที่เริ่มใช้งานได้</TableHead>
          <TableHead>วันหมดอายุ</TableHead>
          <TableHead>แสดงในหน้าเว็บ</TableHead>
          <TableHead>แจ้งเตือน</TableHead>
          <TableHead>จัดการ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rewards.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="h-32 text-center">
              ไม่พบข้อมูลของรางวัล
            </TableCell>
          </TableRow>
        ) : (
          rewards.map((reward) => (
            <RewardRow
              key={reward.id}
              reward={reward}
              onEdit={onEdit}
              onToggleStatus={() => onToggleStatus(reward)}
              onToggleAlertEnable={() => onToggleAlertEnable(reward)}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
}
