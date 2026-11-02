import { useUserProtectedRoute } from "@/components/protected/UserProtectedRoute";
import { useFetchScannedBarcodeHistoriesByUserId } from "@/hooks/fetch-data/useFetchScannedBarcodeHistories";
import { getUserId } from "@/lib/utils/user.util";
import { format } from "date-fns";
import { FC } from "react";
import { DateRange } from "react-day-picker";
type Props = {
  date: DateRange | undefined;
};

const ScannedBarcodeHistories: FC<Props> = ({ date }) => {
  const { user } = useUserProtectedRoute();
  
  const { data: scannedBarcodeHistories } =
    useFetchScannedBarcodeHistoriesByUserId({
      user_id: getUserId(user),
      filter: {
        from: date?.from?.toISOString(),
        to: date?.to?.toISOString(),
      },
    });
  return (
    <>
      {scannedBarcodeHistories?.map((scannedBarcodeHistory) => (
        <div
          key={scannedBarcodeHistory.id}
          className="flex items-center justify-between p-4 border rounded-lg bg-white"
        >
          <div className="space-y-1">
            <p className="font-medium">
              {scannedBarcodeHistory.product_score_option.title}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(scannedBarcodeHistory.created_date, "dd/MM/yyyy")}
            </p>
          </div>
          <span className="text-red-600">
            +{scannedBarcodeHistory.product_score_option.score} แต้ม
          </span>
        </div>
      ))}
    </>
  );
};

export default ScannedBarcodeHistories;
