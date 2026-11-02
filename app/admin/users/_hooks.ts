import { UserInfoView } from "@/models/user.model";
import { useManageUserPageStore } from "./_store";

export function useEditUser() {
  const editingUser = useManageUserPageStore((state) => state.editingUser);

  const setEditingUser = useManageUserPageStore(
    (state) => state.setEditingUser
  );

  const setIsEditDialogOpen = useManageUserPageStore(
    (state) => state.setIsEditDialogOpen
  );

  const handleUpdateField = (field: keyof UserInfoView, value: any) => {
    setEditingUser((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleClose = () => {
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };

  return {
    editingUser,
    handleUpdateField,
    handleClose,
  };
}
