import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sortUserTotalScore } from "@/features/users/helper/sort-user-total-score.helper";
import { UserInfoView } from "@/models/user.model";
import { useState } from "react";
import { useManageUserPageStore } from "../_store";
import UserRow from "./UserRow";
import TransferUserScoreModal from "@/features/users/components/TransferUserScoreModal";

interface UsersTableProps {
  users: UserInfoView[];
  onRefreshData: () => void;
  onScanallBarcode: (user: UserInfoView) => void;
}

export function UsersTable({ users, onRefreshData, onScanallBarcode }: UsersTableProps) {
  const onEditClick = useManageUserPageStore((state) => state.onEditClick);

  const onDeleteClick = useManageUserPageStore((state) => state.onDeleteClick);

  const [transferSourceUser, setTransferSourceUser] =
    useState<UserInfoView | null>(null);

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sortedUsers = sortUserTotalScore(users, sortOrder);

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
          {sortedUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center">
                ไม่พบข้อมูลผู้ใช้
              </TableCell>
            </TableRow>
          ) : (
            sortedUsers.map((user) => (
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
          className="cursor-pointer hover:bg-gray-100"
        >
          แต้มสะสม {sortOrder === "asc" ? "↑" : "↓"}
        </TableHead>
        <TableHead>จัดการ</TableHead>
      </TableRow>
    </TableHeader>
  );
};
