import { Loader } from "@/components/ui/loader";
import { TabsContent } from "@/components/ui/tabs";
import { useFetchUserTotalScoreById } from "@/hooks/fetch-data/useFetchUserTotalScoreById";
import React from "react";

type Props = {
  userId: string;
};

const TotalPoint = ({ userId }: Props) => {
  const { data: totalScore, isFetching: isLoadingTotalScore } =
    useFetchUserTotalScoreById(userId);

  if (isLoadingTotalScore) return <Loader label="กำลังดึงข้อมูลคะแนนสะสม" />;

  return (
    <TabsContent value="points" className="space-y-4">
      <div className="p-6 border rounded-lg bg-white">
        <div className="text-center space-y-2">
          <p className="text-4xl font-bold text-primary">
            {totalScore?.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">แต้มสะสมทั้งหมด</p>
        </div>
      </div>
    </TabsContent>
  );
};

export default TotalPoint;
