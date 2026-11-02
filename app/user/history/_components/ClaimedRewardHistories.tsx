import { useUserProtectedRoute } from "@/components/protected/UserProtectedRoute";
import { Loader } from "@/components/ui/loader";
import ClaimedRewardHistoryStatusTag from "@/features/claimed-reward-history/components/ClaimedRewardHistoryStatusTag";
import { useFetchClaimedRewardHistoriesByUserId } from "@/hooks/fetch-data/useFetchClaimedRewardHistoriesByUserId";
import { getUserId } from "@/lib/utils/user.util";
import { format } from "date-fns";
import { FC } from "react";
import { DateRange } from "react-day-picker";

type Props = {
  selectedDateRange: DateRange | undefined;
};

const ClaimedRewardHistories: FC<Props> = ({ selectedDateRange }) => {
  const { user } = useUserProtectedRoute();

  const { data: userClaimedRewardHistories, isFetching } =
    useFetchClaimedRewardHistoriesByUserId({
      user_id: user ? getUserId(user) : "",
      filter: selectedDateRange
        ? {
            from: selectedDateRange.from?.toISOString() ?? "",
            to: selectedDateRange.to?.toISOString() ?? "",
          }
        : undefined,
    });

  const isHistoryEmpty =
    !userClaimedRewardHistories || userClaimedRewardHistories.length === 0;

  if (isFetching)
    return <Loader label="กำลังดึงข้อมูลประวัติการแลกของรางวัล" />;

  if (isHistoryEmpty)
    return (
      <p className="text-center text-gray-500 text-sm py-5">
        คุณยังไม่มีประวัติการแลกของรางวัล
      </p>
    );

  return (
    <>
      {userClaimedRewardHistories.map((claimedRewardHistory) => (
        <div
          key={claimedRewardHistory.id}
          className="flex items-center justify-between p-4 border rounded-lg bg-white"
        >
          <div className="space-y-1">
            <p className="font-medium">{claimedRewardHistory.rewards.title}</p>
            <p className="text-sm text-muted-foreground">
              {format(claimedRewardHistory.created_at, "dd/MM/yyyy")}
            </p>
          </div>
          <div className="flex flex-col items-end justify-between">
            <span className="text-red-600">
              -{claimedRewardHistory.rewards.required_score} แต้ม
            </span>

            <ClaimedRewardHistoryStatusTag
              status={claimedRewardHistory.status}
            />
          </div>
        </div>
      ))}
    </>
  );
};

export default ClaimedRewardHistories;
