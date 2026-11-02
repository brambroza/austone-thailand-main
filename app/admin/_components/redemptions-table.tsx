"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { searchClaimedRewardHistories } from "@/features/claimed-reward-history/helpers/claimed-reward-histories.helper";
import { ClaimedRewardHistory } from "@/models/reward.model";
import { ArrowUpDown, Search } from "lucide-react";
import { useState } from "react";
const formatNumber = (num: number) => {
  return num.toLocaleString("th-TH");
};

interface IRedemptionsTableProps {
  claimedRewardHistories: ClaimedRewardHistory[];
}

export function RedemptionsTable({
  claimedRewardHistories,
}: IRedemptionsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const filteredRedemptions = searchClaimedRewardHistories(
    searchQuery,
    claimedRewardHistories ?? []
  );

  const sortedRedemptions = filteredRedemptions?.sort((a, b) => {
    const scoreA = a.rewards.required_score;
    const scoreB = b.rewards.required_score;
    return sortDirection === "asc" ? scoreA - scoreB : scoreB - scoreA;
  });

  if (!sortedRedemptions) return <h3>ไม่พบข้อมูล</h3>;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ค้นหาประวัติการแลก..."
          className="pl-8 bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ผู้ใช้</TableHead>
              <TableHead>ชื่อร้านค้า</TableHead>
              <TableHead>ชื่อร้านค้าตัวแทนจำหน่าย</TableHead>
              <TableHead>ของรางวัล</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                  }
                  className="h-8 px-2"
                >
                  แต้มที่ใช้
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>วันที่</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRedemptions?.length > 0 ? (
              sortedRedemptions.map((redemption) => (
                <TableRow key={redemption.id}>
                  <TableCell>{redemption.users.full_name}</TableCell>
                  <TableCell>
                    {Boolean(redemption.users.store_name)
                      ? redemption.users.store_name
                      : "ไม่ระบุ"}
                  </TableCell>
                  <TableCell>
                    {Boolean(redemption.users.agent_store_name)
                      ? redemption.users.agent_store_name
                      : "ไม่ระบุ"}
                  </TableCell>
                  <TableCell>{redemption.rewards.title}</TableCell>
                  <TableCell>
                    {formatNumber(redemption.rewards.required_score)}
                  </TableCell>
                  <TableCell>
                    {new Date(redemption.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
