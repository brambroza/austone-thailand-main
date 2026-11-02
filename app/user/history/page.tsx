"use client";

import { useUserProtectedRoute } from "@/components/protected/UserProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFetchUserInfo } from "@/hooks/fetch-data/useFetchUserInfo";
import { usePreventInvalidUserProfile } from "@/hooks/usePreventInvalidUserProfile";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import ClaimedRewardHistories from "./_components/ClaimedRewardHistories";
import FilterDateInput from "./_components/FilterDateInput";
import ScannedBarcodeHistories from "./_components/ScannedBarcodeHistories";
import TotalPoint from "./_components/TotalPoint";
import { getUserId } from "@/lib/utils/user.util";
export default function HistoryPage() {
  const { user } = useUserProtectedRoute();

  const { data: userInfo, isFetching: isLoadingUserInfo } = useFetchUserInfo(
    getUserId(user)
  );

  usePreventInvalidUserProfile(userInfo ?? null, isLoadingUserInfo);

  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ประวัติและแต้มสะสม</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="points" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="points">แต้มสะสม</TabsTrigger>
              <TabsTrigger value="redemption">ของรางวัล</TabsTrigger>
              <TabsTrigger value="scan">สแกนสินค้า</TabsTrigger>
            </TabsList>
            <TotalPoint userId={getUserId(user)} />
            <TabsContent value="redemption" className="space-y-4">
              <FilterDateInput date={date} setDate={setDate} />
              <ClaimedRewardHistories selectedDateRange={date} />
            </TabsContent>
            <TabsContent value="scan" className="space-y-4">
              <FilterDateInput date={date} setDate={setDate} />
              <ScannedBarcodeHistories date={date} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
