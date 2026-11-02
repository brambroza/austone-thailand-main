"use client";
import { useUserProtectedRoute } from "@/components/protected/UserProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingModal } from "@/components/ui/loading-modal";
import { useFetchAvailableRewards } from "@/hooks/fetch-data/useFetchAvailableRewards";
import { useFetchUserInfo } from "@/hooks/fetch-data/useFetchUserInfo";
import { useFetchUserTotalScoreById } from "@/hooks/fetch-data/useFetchUserTotalScoreById";
import { usePreventInvalidUserProfile } from "@/hooks/usePreventInvalidUserProfile";
import { getUserId } from "@/lib/utils/user.util";
import Reward from "./_components/Reward";

function getLoadingMessage(
  isLoadingUserInfo: boolean,
  isLoadingRewards: boolean
) {
  if (isLoadingUserInfo) return "กำลังโหลดข้อมูลผู้ใช้...";
  if (isLoadingRewards) return "กำลังโหลดข้อมูลรางวัล...";
  return "";
}

export default function RewardsPage() {
  const { user } = useUserProtectedRoute();

  const {
    data: userInfo,
    isLoading: isLoadingUserInfo,
    refetch: refetchUserInfo,
  } = useFetchUserInfo(getUserId(user));

  const { data: totalUserScores, refetch: refetchTotalUserScores } =
    useFetchUserTotalScoreById(getUserId(user));

  const {
    data: rewards,
    isLoading: isLoadingRewards,
    refetch: refetchRewards,
  } = useFetchAvailableRewards();

  usePreventInvalidUserProfile(userInfo ?? null, isLoadingUserInfo);

  function handleRefreshData() {
    refetchUserInfo();
    refetchTotalUserScores();
    refetchRewards();
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-3xl">
      {/* Points Summary Card */}
      <Card className="text-primary-foreground">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-black font-medium text-center">
            แต้มสะสมของคุณ
          </CardTitle>
          <p className="text-3xl font-bold text-center mt-2 text-black">
            {totalUserScores?.toLocaleString("th-TH") ?? 0}
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">ของรางวัลที่สามารถแลกได้</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-1">
            {rewards?.map((reward) => (
              <Reward
                key={reward.id}
                userId={getUserId(user)}
                reward={reward}
                totalUserScores={totalUserScores ?? 0}
                onRefreshData={handleRefreshData}
              />
            ))}
          </div>

          {rewards?.length === 0 && !isLoadingRewards && (
            <div className="text-center py-8 text-muted-foreground">
              ไม่พบของรางวัลที่สามารถแลกได้ในขณะนี้
            </div>
          )}
        </CardContent>
      </Card>

      <LoadingModal
        isOpen={isLoadingUserInfo || isLoadingRewards}
        message={getLoadingMessage(isLoadingUserInfo, isLoadingRewards)}
      />
    </div>
  );
}
