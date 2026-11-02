import { UserInfoView } from "@/models/user.model";

export function searchUser(searchQuery: string, users: UserInfoView[]) {
  return users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone_number?.includes(searchQuery) ||
      user.store_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.agent_store_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
}
