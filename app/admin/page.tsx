import {
  getClaimedRewardHistoriesUnzline,
  getTotalNumberOfClaimedRewardsNew,
} from "@/actions/queries/claimed_reward_histories.action";
import { getAllScannedBarcodes } from "@/actions/queries/scanned-barcodes.action";
import { getTotalUserScoresNew } from "@/actions/queries/score.action";
import {
  fetchUserInfolist,
  getTotalUsersNumberNew,
} from "@/actions/queries/users.action";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DailyScannedBarcodeChart from "./_components/DailyScannedBarcodeChart";
import { RedemptionsTable } from "./_components/redemptions-table";
import { StatsCards } from "./_components/stats-cards";
import TopProvincesChart from "./_components/TopProvincesChart";
import { UserPointsTable } from "./_components/user-points-table";
import DailyClaimedRewards from "./users/_components/DailyClaimedRewards";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboard() {
  try {
 
    const [
      totalUsersResult,
      totalUserScoresResult,
      totalClaimedRewardsResult,
      scannedBarcodesResult,
      userInfosResult,
      claimedRewardHistoriesResult,
    ] = await Promise.all([
      getTotalUsersNumberNew(),
      getTotalUserScoresNew(),
      getTotalNumberOfClaimedRewardsNew(),
      getAllScannedBarcodes(),
      fetchUserInfolist(),
      getClaimedRewardHistoriesUnzline(undefined),
    ]);




    const totalUsers = totalUsersResult?.data;

    const totalUserScores = totalUserScoresResult?.data;

    const totalClaimedRewards = totalClaimedRewardsResult;

    const scannedBarcodes = scannedBarcodesResult?.data;

    const userInfos = userInfosResult?.data;

    const claimedRewardHistories =  claimedRewardHistoriesResult?.data ?? [];



    if (!totalUsers || !totalUserScores || !totalClaimedRewards) {
      throw new Error("ล้มเหลวระหว่างดึงข้อมูลหน้า Dashboard");
    }

    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">รายงานภาพรวม</h1>
        <StatsCards
          totalUsers={totalUsers}
          totalUserScores={totalUserScores}
          totalClaimedRewards={totalClaimedRewards}
        />
        <div className="grid gap-6 md:grid-cols-2">
          <DailyScannedBarcodeChart scannedBarcodes={scannedBarcodes ?? []} />

          <TopProvincesChart userInfos={userInfos ?? []} />

          <DailyClaimedRewards />
        </div>

        <Card>
          <CardContent className="pt-6">
            <Tabs defaultValue="redemptions" className="space-y-4">
              <TabsList>
                <TabsTrigger value="redemptions">
                  ประวัติการแลกของรางวัล
                </TabsTrigger>
                <TabsTrigger value="points">ยอดแต้มสะสมรายบุคคล</TabsTrigger>
              </TabsList>

              <TabsContent value="redemptions">
                <RedemptionsTable
                  claimedRewardHistories={claimedRewardHistories ?? []}
                />
              </TabsContent>

              <TabsContent value="points">
                <UserPointsTable users={userInfos ?? []} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {

    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            ไม่สามารถโหลดข้อมูลได้
          </h2>
          <p className="text-gray-600">
            กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ
          </p>
        </div>
      </div>
    );
  }
}
