import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formatNumber = (num: number) => {
  return num.toLocaleString("th-TH");
};

interface IStatsCardsProps {
  totalUsers: number;
  totalUserScores: number;
  totalClaimedRewards: number;
}

export function StatsCards({
  totalUsers,
  totalUserScores,
  totalClaimedRewards,
}: IStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            จำนวนผู้ใช้ทั้งหมด
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(totalUsers ?? 0)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">แต้มสะสมทั้งหมด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(totalUserScores ?? 0)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            จำนวนการแลกของรางวัล
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(totalClaimedRewards ?? 0)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
