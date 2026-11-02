import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/ui/pagination";
import { sortUserTotalScore } from "@/features/users/helper/sort-user-total-score.helper";
import { useTablePagination } from "@/hooks/useTablePagination";
import { UserInfoView } from "@/models/user.model";
import { useMemo, useState } from "react";
import { useManageUserPageStore } from "../_store";
import UserRow from "./UserRow";
import TransferUserScoreModal from "@/features/users/components/TransferUserScoreModal";

interface UsersTableProps {
  users: UserInfoView[];
  searchQuery: string;
  onRefreshData: () => void;
  onScanallBarcode: (user: UserInfoView) => void;
}

export function UsersTable({ users, searchQuery, onRefreshData, onScanallBarcode }: UsersTableProps) {
  const onEditClick = useManageUserPageStore((state) => state.onEditClick);

  const onDeleteClick = useManageUserPageStore((state) => state.onDeleteClick);

  const [transferSourceUser, setTransferSourceUser] =
    useState<UserInfoView | null>(null);

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sortedUsers = useMemo(
    () => sortUserTotalScore(users, sortOrder),
    [users, sortOrder]
  );

  const { pageRows, pagination } = useTablePagination(
    sortedUsers,
    `${searchQuery}|${sortOrder}`
  );

  function toggleSort() {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  }

  return (
    <>
      <TransferUserScoreModal
        isOpen={Boolean(transferSourceUser)}
        onClose={() => setTransferSourceUser(null)}
        onRefreshData={onRefreshData}
        sourceUserId={transferSourceUser?.user_id ?? ""}
      />
      <Table>
        <Header onSortClick={toggleSort} sortOrder={sortOrder} />
        <TableBody>
          {pageRows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                ไม่พบข้อมูลผู้ใช้
              </TableCell>
            </TableRow>
          ) : (
            pageRows.map((user) => (
              <UserRow
                key={user.user_id}
                user={user}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
                onTransferScoreClick={() => setTransferSourceUser(user)}
                onScanallBarcode={onScanallBarcode}
              />
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination pagination={pagination} />
    </>
  );
}

const Header = ({
  onSortClick,
  sortOrder,
}: {
  onSortClick: () => void;
  sortOrder: "asc" | "desc";
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>ชื่อผู้ใช้</TableHead>
        <TableHead>ชื่อร้านค้า</TableHead>
        <TableHead>ชื่อร้านค้าตัวแทนจำหน่าย</TableHead>
        <TableHead>เบอร์โทรศัพท์</TableHead>
        <TableHead>จังหวัด</TableHead>
        <TableHead
          onClick={onSortClick}
          className="cursor-pointer text-right hover:text-gray-900"
        >
          แต้มสะสม {sortOrder === "asc" ? "↑" : "↓"}
        </TableHead>
        <TableHead>จัดการ</TableHead>
      </TableRow>
    </TableHeader>
  );
};
