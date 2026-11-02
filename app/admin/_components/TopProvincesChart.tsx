"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserInfoView } from "@/models/user.model";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = [
  "#0ea5e9", // sky-500
  "#ec4899", // pink-500
  "#8b5cf6", // violet-500
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
  "#6366f1", // indigo-500
  "#f43f5e", // rose-500
  "#14b8a6", // teal-500
  "#a855f7", // purple-500
  "#84cc16", // lime-500
];

interface ITopProvincesChartProps {
  userInfos: UserInfoView[];
}

const TopProvincesChart = ({ userInfos }: ITopProvincesChartProps) => {
  const provinceData = userInfos?.reduce((acc, user) => {
    if (!user.province) return acc;
    acc[user.province] = (acc[user.province] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formattedProvinceData = provinceData
    ? Object.entries(provinceData)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>10 อันดับจังหวัดที่มีผู้ใช้มากที่สุด</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedProvinceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value, percent }) =>
                  `${name} (${value} คน, ${(percent * 100).toFixed(0)}%)`
                }
              >
                {formattedProvinceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopProvincesChart;
