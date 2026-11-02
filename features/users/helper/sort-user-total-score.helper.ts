import { UserInfoView } from "@/models/user.model";

export function sortUserTotalScore(users: UserInfoView[], sortOrder: "asc" | "desc") {
  return users.sort((a, b) => {
    const scoreA = a.total_score || 0;
    const scoreB = b.total_score || 0;
    return sortOrder === "asc" ? scoreA - scoreB : scoreB - scoreA;
  });
}
