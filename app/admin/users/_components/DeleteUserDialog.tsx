import { deleteUser } from "@/actions/queries/users.action";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert } from "@/components/ui/alert-message-dialog";
import { useManageUserPageStore } from "../_store";

export default function DeleteUserDialog() {
  const isDeleteDialogOpen = useManageUserPageStore(
    (state) => state.isDeleteDialogOpen
  );

  const setIsDeleteDialogOpen = useManageUserPageStore(
    (state) => state.setIsDeleteDialogOpen
  );

  const userToDelete = useManageUserPageStore((state) => state.userToDelete);

  async function handleDeleteUser() {
    try {
      if (!userToDelete?.user_id) {
        throw new Error("กรุณาเลือกผู้ใช้งานที่จะลบ");
      }
      await deleteUser({ user_id: userToDelete.user_id });
      Alert.success("ลบผู้ใช้งานสำเร็จ");
    } catch (error: any) {
      Alert.error(error.message);
    }
  }

  return (
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการลบผู้ใช้</AlertDialogTitle>
          <AlertDialogDescription>
            คุณต้องการลบผู้ใช้ {userToDelete?.full_name} ใช่หรือไม่?
            การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteUser}
            className="bg-red-500 hover:bg-red-600"
          >
            ลบผู้ใช้
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
