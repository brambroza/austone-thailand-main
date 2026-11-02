"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDailyScannedBarcodeData } from "@/features/scanned-barcodes/helpers/barcode.helper";
import { ScannedBarcode } from "@/models/scanned-barcodes.model";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface IDailyScannedBarcodeChartProps {
  scannedBarcodes: Pick<ScannedBarcode, "created_date">[];
}

const DailyScannedBarcodeChart = ({
  scannedBarcodes,
}: IDailyScannedBarcodeChartProps) => {
  const dailyScannedBarcodeData =
    formatDailyScannedBarcodeData(scannedBarcodes);

    console.log(dailyScannedBarcodeData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>จำนวนครั้งการสะสมแต้มรายวัน</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyScannedBarcodeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="จำนวนการสะสมแต้ม"
                fill="#0ea5e9"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyScannedBarcodeChart;
