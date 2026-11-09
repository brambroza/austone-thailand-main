"use client";

import { DatePicker } from "@/app/components/ui/date-picker";
import { Alert } from "@/components/ui/alert-message-dialog";
import { Button } from "@/components/ui/button";
import { LoadingModal } from "@/components/ui/loading-modal";
import { useFetchClaimedRewardHistories } from "@/hooks/fetch-data/useFetchClaimedRewardHistories";
import { useFetchUserInfo } from "@/hooks/fetch-data/useFetchUserInfo";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import ClaimedRewardsTable from "./_components/ClaimedRewardsTable";

export default function ClaimedRewardsPage() {
  const searchParams = useSearchParams();

  const userId = searchParams.get("user_id");

  const { data: userInfo } = useFetchUserInfo(userId as string);

  const { data: histories, isLoading, refetch } = useFetchClaimedRewardHistories();

  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const handleStartDateChange = (date?: Date) => {
    setStartDate(date);
    if (date && endDate && endDate < date) {
      setEndDate(date);
    }
  };

  const handleEndDateChange = (date?: Date) => {
    setEndDate(date);
  };

  const filteredHistories = histories?.filter((history) => {
    const matchesUser = userId ? history.user_id === userId : true;

    const createdAt = new Date(history.created_at);
    const matchesStartDate = startDate
      ? createdAt >= new Date(new Date(startDate).setHours(0, 0, 0, 0))
      : true;
    const matchesEndDate = endDate
      ? createdAt <= new Date(new Date(endDate).setHours(23, 59, 59, 999))
      : true;

    return matchesUser && matchesStartDate && matchesEndDate;
  });

  /**
   * Export ประวัติการแลกของรางวัลตามตัวกรองปัจจุบันเป็นไฟล์ .xlsx
   * ใช้ XLSX.writeFile ดาวน์โหลดเอง ไม่ใช้ file-saver เพราะ dynamic import
   * ของ file-saver (CommonJS) คืน { default } เท่านั้น ทำให้ saveAs เป็น undefined
   */
  async function handleExportExcel() {
    try {
      // โหลด library ตอนกด export เพราะมีขนาดใหญ่และทำให้หน้าเปิดช้า
      const XLSX = await import("xlsx");

      const rows = (filteredHistories ?? []).map((history) => ({
        "ชื่อรางวัล": history.rewards.title,
        "ชื่อผู้แลก": history.users.full_name,
        "ชื่อร้านค้า": history.users.store_name ?? "ไม่ระบุ",
        "ชื่อร้านค้าตัวแทนจำหน่าย": history.users.agent_store_name || "ไม่ระบุ",
        "อีเมล": history.email || "-",
        "ที่อยู่จัดส่ง": history.shipping_address || "-",
        "สถานะ": history.status,
        "วันที่แลก": new Date(history.created_at).toLocaleString("th-TH"),
      }));

      const ws = XLSX.utils.json_to_sheet(rows, {
        header: [
          "ชื่อรางวัล",
          "ชื่อผู้แลก",
          "ชื่อร้านค้า",
          "ชื่อร้านค้าตัวแทนจำหน่าย",
          "อีเมล",
          "ที่อยู่จัดส่ง",
          "สถานะ",
          "วันที่แลก",
        ],
      });

      ws["!cols"] = [
        { wch: 24 },
        { wch: 20 },
        { wch: 22 },
        { wch: 26 },
        { wch: 24 },
        { wch: 30 },
        { wch: 16 },
        { wch: 20 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "ประวัติการแลกของรางวัล");

      // ห้ามใช้ toLocaleDateString("th-TH") เพราะได้ "9/11/2569" ซึ่งมี "/" ในชื่อไฟล์
      const toFileDate = (date: Date) => format(date, "yyyy-MM-dd");
      const period =
        startDate && endDate
          ? `${toFileDate(startDate)}_${toFileDate(endDate)}`
          : toFileDate(new Date());

      XLSX.writeFile(wb, `claimed-rewards-${period}.xlsx`, { compression: true });
    } catch (error) {
      console.error("Export claimed rewards failed", error);
      Alert.error("Export Excel ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-semibold">
          {userId && userInfo
            ? `ประวัติการแลกของรางวัล: ${userInfo.full_name}`
            : "ประวัติการแลกของรางวัลทั้งหมด"
          }
        </h1>

        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex gap-2 items-center">
            <DatePicker
              value={startDate}
              onChange={handleStartDateChange}
              placeholder="วันที่เริ่มต้น"
            />
            <span>ถึง</span>
            <DatePicker
              value={endDate}
              onChange={handleEndDateChange}
              placeholder="วันที่สิ้นสุด"
              minDate={startDate}
            />
          </div>

          <Button onClick={handleExportExcel}>
            <Download className="w-4 h-4 mr-2" />
            Export เป็น Excel
          </Button>
        </div>
      </div>

      <div>
        {filteredHistories && (
          <ClaimedRewardsTable
            histories={filteredHistories}
            onRefresh={() => refetch()}
          />
        )}
      </div>

      <LoadingModal
        isOpen={isLoading}
        message="กำลังโหลดข้อมูลประวัติการแลกของรางวัล..."
      />
    </div>
  );
}
