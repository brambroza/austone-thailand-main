"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatClaimedRewardHistories,
  sortClaimedRewardHistories,
} from "@/features/claimed-reward-history/helpers/claimed-reward-histories.helper";
import { useFetchClaimedRewardHistories } from "@/hooks/fetch-data/useFetchClaimedRewardHistories";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DailyClaimedRewards = () => {
  const currentYear = new Date().getFullYear();

  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const {
    data: claimedRewardHistories,
    isFetching: isFetchingRewardHistories,
  } = useFetchClaimedRewardHistories({
    month: selectedMonth,
    year: selectedYear,
  });

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const formattedClaimedRewardHistories = claimedRewardHistories
    ? sortClaimedRewardHistories(
        formatClaimedRewardHistories(claimedRewardHistories)
      )
    : null;

  if (isFetchingRewardHistories)
    return (
      <Loader
        className="h-[300px]"
        label="กำลังดึงข้อมูลประวัติการแลกของรางวัล"
      />
    );

  if (!formattedClaimedRewardHistories) return null;

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>การแลกของรางวัลรายวัน</CardTitle>
          <div className="flex gap-2">
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="เลือกปี" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="เลือกเดือน" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month.toString()}>
                    {new Date(2024, month - 1).toLocaleString("th-TH", {
                      month: "long",
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {claimedRewardHistories && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedClaimedRewardHistories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="rewards"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  name="จำนวนการแลก"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyClaimedRewards;
