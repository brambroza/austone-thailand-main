import { UserInfoView } from "@/models/user.model";
import { create } from "zustand";

interface UserStore {
  searchQuery: string;
  isDeleteDialogOpen: boolean;
  userToDelete: UserInfoView | null;
  isEditDialogOpen: boolean;
  editingUser: UserInfoView | null;
}

interface UserStoreActions {
  setSearchQuery: (query: string) => void;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
  setEditingUser: (user: UserInfoView | null | ((prev: UserInfoView | null) => UserInfoView | null)) => void;
  setIsEditDialogOpen: (isOpen: boolean) => void;
  onDeleteClick: (user: UserInfoView) => void;
  onEditClick: (user: UserInfoView) => void;
}

const initialState: UserStore = {
  searchQuery: "",
  isDeleteDialogOpen: false,
  userToDelete: null,
  isEditDialogOpen: false,
  editingUser: null,
};

export const useManageUserPageStore = create<UserStore & UserStoreActions>(
  (set) => ({
    ...initialState,
    setSearchQuery: (query) => set({ searchQuery: query }),
    setIsDeleteDialogOpen: (isOpen) => set({ isDeleteDialogOpen: isOpen }),
    setEditingUser: (userOrUpdater) => 
      set((state) => ({ 
        editingUser: typeof userOrUpdater === 'function' 
          ? userOrUpdater(state.editingUser) 
          : userOrUpdater 
      })),
    setIsEditDialogOpen: (isOpen) => set({ isEditDialogOpen: isOpen }),
    onDeleteClick: (user) =>
      set({ userToDelete: user, isDeleteDialogOpen: true }),
    onEditClick: (user) => set({ editingUser: user, isEditDialogOpen: true }),
  })
);
