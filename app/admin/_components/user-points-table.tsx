"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { UserInfoView } from "@/models/user.model";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatThaiNumber } from "@/lib/utils";

interface IUserPointsTableProps {
  users: UserInfoView[];
}

export function UserPointsTable({ users }: IUserPointsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const filteredUsers = users?.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone_number?.includes(searchQuery) ||
      user.store_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.agent_store_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedUsers = filteredUsers?.sort((a, b) => {
    const scoreA = a.total_score ?? 0;
    const scoreB = b.total_score ?? 0;
    return sortDirection === "asc" ? scoreA - scoreB : scoreB - scoreA;
  });

  if (!sortedUsers) return <h3>ไม่พบข้อมูล</h3>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหา..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-white"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อผู้ใช้</TableHead>
              <TableHead>ชื่อร้านค้า</TableHead>
              <TableHead>ชื่อร้านค้าตัวแทนจำหน่าย</TableHead>
              <TableHead>เบอร์โทร</TableHead>
              <TableHead className="text-right">
                <Button
                  variant="ghost"
                  onClick={() =>
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                  }
                  className="h-8 px-2"
                >
                  แต้มสะสม
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            ) : (
              sortedUsers.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>{user.full_name ?? "ไม่ระบุ"}</TableCell>
                  <TableCell>
                    {Boolean(user.store_name) ? user.store_name : "ไม่ระบุ"}
                  </TableCell>
                  <TableCell>
                    {Boolean(user.agent_store_name)
                      ? user.agent_store_name
                      : "ไม่ระบุ"}
                  </TableCell>
                  <TableCell>{user.phone_number}</TableCell>
                  <TableCell className="text-right">
                    {formatThaiNumber(user.total_score ?? 0)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
