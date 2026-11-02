
import { fetchUserScorelist } from "@/actions/queries/users.action";
import { Alert } from "@/components/ui/alert-message-dialog";
import { apiGet } from "@/lib/utils/api-client.util";
import { SafeActionUtil } from "@/lib/utils/safe-action.util";
import { ProductScoreOption } from "@/models/product-score-option.model";
import { UserInfoView } from "@/models/user.model";
import { useQuery } from "@tanstack/react-query";

export function useFetchUserInfos() {
  const query = useQuery({
    queryKey: ["userInfos"],
    queryFn: async () => {
      try {
        return await apiGet<UserInfoView[]>("/api/admin/users");
      } catch (error: any) {
        Alert.error(error.message);
        return null;
      }
    },
    refetchOnWindowFocus: false,
  });

  return query;
}



export function useFetchUserPoint() {
  const query = useQuery({
    queryKey: ["userpoints"],
    queryFn: async () => {
      try {
        const result = await fetchUserScorelist();

        const userInfos = SafeActionUtil.getData<ProductScoreOption[]>(result);

        return userInfos;
      } catch (error: any) {
        Alert.error(error.message);
        return null;
      }
    },
  });

  return query;
}


