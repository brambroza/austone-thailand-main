"use client";

import { DatePicker } from "@/app/components/ui/date-picker";
import Loading from "@/app/loading";
import { THAILAND_PROVINCES } from "@/app/user/profile/_constant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/components/ui/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useFetchUserPointAccumulateHistories } from "@/features/scanned-barcodes/hooks/queries/useFetchUserPointHistories";
import { UserPointAccumulateHistory } from "@/features/scanned-barcodes/types/user-point-history.type";
import { useTablePagination } from "@/hooks/useTablePagination";
import { monthIndexToMonthName } from "@/lib/utils/date.util";
import { ArrowUpDown, Download } from "lucide-react";
import { useMemo, useState } from "react";

type TimeFilter = "monthly" | "quarterly" | "yearly";
type SortField = "total_points" | "used_points" | "available_points";
type SortDirection = "asc" | "desc";

const TimeFilterSelect = ({
    timeFilter,
    setTimeFilter,
}: {
    timeFilter: TimeFilter;
    setTimeFilter: (value: TimeFilter) => void;
}) => (
    <Select
        value={timeFilter}
        onValueChange={(value) => setTimeFilter(value as TimeFilter)}
    >
        <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="เลือกช่วงเวลา" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="monthly">รายเดือน</SelectItem>
            <SelectItem value="quarterly">รายไตรมาส</SelectItem>
            <SelectItem value="yearly">รายปี</SelectItem>
        </SelectContent>
    </Select>
);

const YearSelect = ({
    selectedYear,
    setSelectedYear,
    years,
}: {
    selectedYear: number;
    setSelectedYear: (year: number) => void;
    years: number[];
}) => (
    <Select
        value={selectedYear.toString()}
        onValueChange={(value) => setSelectedYear(parseInt(value))}
    >
        <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="ปี" />
        </SelectTrigger>
        <SelectContent>
            {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                    {year}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);

const MonthSelect = ({
    selectedMonth,
    setSelectedMonth,
}: {
    selectedMonth: number;
    setSelectedMonth: (month: number) => void;
}) => {
    const months = Array.from({ length: 12 }, (_, i) => i);

    return (
        <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
        >
            <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="เดือน" />
            </SelectTrigger>
            <SelectContent>
                {months.map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                        {monthIndexToMonthName(month)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

const QuarterSelect = ({
    selectedQuarter,
    setSelectedQuarter,
}: {
    selectedQuarter: number;
    setSelectedQuarter: (quarter: number) => void;
}) => {
    const quarters = [1, 2, 3, 4];

    return (
        <Select
            value={selectedQuarter.toString()}
            onValueChange={(value) => setSelectedQuarter(parseInt(value))}
        >
            <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="ไตรมาส" />
            </SelectTrigger>
            <SelectContent>
                {quarters.map((quarter) => (
                    <SelectItem key={quarter} value={quarter.toString()}>
                        ไตรมาส {quarter}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

const ProvinceSelect = ({
    selectedProvince,
    setSelectedProvince,
}: {
    selectedProvince: string;
    setSelectedProvince: (province: string) => void;
}) => (
    <Select
        value={selectedProvince}
        onValueChange={(value) => setSelectedProvince(value)}
    >
        <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="เลือกจังหวัด" />
        </SelectTrigger>
        <SelectContent>
            <SelectItem value="all">ทั้งหมด</SelectItem>
            {THAILAND_PROVINCES.map((province) => (
                <SelectItem key={province} value={province}>
                    {province}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);

const PointHistoryTable = ({
    userPointHistories,
    sortConfig,
    onSort,
}: {
    userPointHistories: UserPointAccumulateHistory[];
    sortConfig: { field: SortField; direction: SortDirection };
    onSort: (field: SortField) => void;
}) => {
    const getSortIcon = (field: SortField) => {
        if (sortConfig.field === field) {
            return (
                <ArrowUpDown
                    className={`ml-2 h-4 w-4 inline ${sortConfig.direction === "desc" ? "transform rotate-180" : ""
                        }`}
                />
            );
        }
        return <ArrowUpDown className="ml-2 h-4 w-4 inline opacity-20" />;
    };

    const SortableHeader = ({
        field,
        children,
    }: {
        field: SortField;
        children: React.ReactNode;
    }) => (
        <TableHead
            className="cursor-pointer text-right hover:text-gray-900"
            onClick={() => onSort(field)}
        >
            <div className="flex items-center justify-end">
                {children}
                {getSortIcon(field)}
            </div>
        </TableHead>
    );

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>ชื่อผู้ใช้</TableHead>
                    <TableHead>ชื่อร้านค้า</TableHead>
                    <TableHead>ตัวแทน</TableHead>
                    <TableHead>โทร</TableHead>
                    <TableHead>จังหวัด</TableHead>
                    <SortableHeader field="total_points">คะแนนสะสมก่อนหน้า</SortableHeader>
                    <SortableHeader field="used_points">คะแนนสะสม</SortableHeader>
                    <SortableHeader field="total_points">คะแนนทั้งหมด</SortableHeader>
                    <SortableHeader field="used_points">ที่ใช้ไป</SortableHeader>
                    <SortableHeader field="available_points">คงเหลือ</SortableHeader>
                </TableRow>
            </TableHeader>
            <TableBody>
                {userPointHistories.map((history) => (
                    <TableRow key={history.user_id}>
                        <TableCell>{history.full_name ?? "-"}</TableCell>
                        <TableCell>{history.store_name ?? "-"}</TableCell>
                        <TableCell>{history.agent_store_name ?? "-"}</TableCell>
                        <TableCell>{history.phone_number ?? "-"}</TableCell>
                        <TableCell>{history.province ?? "-"}</TableCell>
                        <TableCell className="text-right tabular-nums">{Number(history.bf_points ?? 0).toLocaleString("th-TH")}</TableCell>
                        <TableCell className="text-right tabular-nums">{Number(history.accumulate_points ?? 0).toLocaleString("th-TH")}</TableCell>
                        <TableCell className="text-right tabular-nums">{Number(history.total_points ?? 0).toLocaleString("th-TH")}</TableCell>
                        <TableCell className="text-right tabular-nums">{Number(history.used_points ?? 0).toLocaleString("th-TH")}</TableCell>
                        <TableCell className="text-right tabular-nums">{Number(history.available_points ?? 0).toLocaleString("th-TH")}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

const PointHistoriesPage = () => {
    const [timeFilter, setTimeFilter] = useState<TimeFilter>("monthly");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedQuarter, setSelectedQuarter] = useState(
        Math.floor(new Date().getMonth() / 3) + 1
    );
    const [selectedProvince, setSelectedProvince] = useState("all");
    const [agentStoreNameFilter, setAgentStoreNameFilter] = useState("");
    const [storeNameFilter, setStoreNameFilter] = useState("");
    const [startDate, setStartDate] = useState<Date>(new Date());
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [sortConfig, setSortConfig] = useState<{
        field: SortField;
        direction: SortDirection;
    }>({
        field: "total_points",
        direction: "asc",
    });

    const handleStartDateChange = (date?: Date) => {
        if (date) {
            setStartDate(date);
            // If end date is before new start date, update it
            if (endDate < date) {
                setEndDate(date);
            }
        }
    };

    const handleEndDateChange = (date?: Date) => {
        if (date) {
            setEndDate(date);
        }
    };

    const getDateRange = () => {
        let start: Date;
        let end: Date;

        switch (timeFilter) {
            case "monthly":
                start = startDate;
                end = endDate;
                break;
            case "quarterly":
                start = new Date(selectedYear, (selectedQuarter - 1) * 3, 1);
                end = new Date(selectedYear, selectedQuarter * 3, 0);
                break;
            case "yearly":
                start = new Date(selectedYear, 0, 1);
                end = new Date(selectedYear, 11, 31);
                break;
        }

        return { startDate: start, endDate: end };
    };

    const handleTimeFilterChange = (value: TimeFilter) => {
        setTimeFilter(value);
        if (value !== "monthly") {
            // Reset dates and set default dates based on the new filter
            const today = new Date();
            switch (value) {
                case "quarterly":
                    const currentQuarter = Math.floor(today.getMonth() / 3) + 1;
                    setStartDate(
                        new Date(today.getFullYear(), (currentQuarter - 1) * 3, 1)
                    );
                    setEndDate(new Date(today.getFullYear(), currentQuarter * 3, 0));
                    break;
                case "yearly":
                    setStartDate(new Date(today.getFullYear(), 0, 1));
                    setEndDate(new Date(today.getFullYear(), 11, 31));
                    break;
            }
        }
    };

    const { startDate: filteredStartDate, endDate: filteredEndDate } =
        getDateRange();
    const years = Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i);

    const { data: userPointHistories, isLoading: isLoadingUserPointHistories } =
        useFetchUserPointAccumulateHistories({
            startDate: filteredStartDate,
            endDate: filteredEndDate,
        });

    const handleSort = (field: SortField) => {
        setSortConfig((prevConfig) => ({
            field,
            direction:
                prevConfig.field === field && prevConfig.direction === "asc"
                    ? "desc"
                    : "asc",
        }));
    };

    const filteredAndSortedHistories = useMemo(
        () =>
            userPointHistories
        ? userPointHistories
            .filter((history) => {
                const matchesProvince =
                    selectedProvince === "all" || history.province === selectedProvince;

                const matchesStore =
                    !storeNameFilter ||
                    history.store_name
                        ?.toLowerCase()
                        .includes(storeNameFilter.toLowerCase());

                const matchesAgentStore =
                    !agentStoreNameFilter ||
                    history.agent_store_name
                        ?.toLowerCase()
                        .includes(agentStoreNameFilter.toLowerCase());

                return matchesProvince && matchesAgentStore && matchesStore;
            })
            .sort((a, b) => {
                const aValue = a[sortConfig.field] ?? 0;
                const bValue = b[sortConfig.field] ?? 0;
                return sortConfig.direction === "asc"
                    ? aValue - bValue
                    : bValue - aValue;
            })
        : [],
        [
            userPointHistories,
            selectedProvince,
            storeNameFilter,
            agentStoreNameFilter,
            sortConfig,
        ]
    );

    // export ยังใช้ทุกแถวที่กรองแล้ว ตัดหน้าเฉพาะตอนแสดงผล
    const { pageRows, pagination } = useTablePagination(
        filteredAndSortedHistories,
        [selectedProvince, storeNameFilter, agentStoreNameFilter, sortConfig.field, sortConfig.direction].join("|")
    );

    /*   function handleExportExcel() { 
          const csvContent = [
             
              [
                  "ชื่อผู้ใช้",
                  "ชื่อร้านค้า",
                  "ตัวแทน",
                  "โทร",
                  "จังหวัด",
                  "คะแนนสะสมก่อนหน้า",
                  "คะแนนสะสม",
                  "คะแนนทั้งหมด",
                  "ที่ใช้ไป",
                  "คงเหลือ",
              ].join(","),
               
              ...filteredAndSortedHistories.map((history) =>
                  [
                      history.full_name || "-",
                      history.store_name || "-",
                      history.agent_store_name || "-",
                      history.phone_number || "-",
                      history.province || "-",
                      history.bf_points || 0,
                      history.accumulate_points || 0,
                      history.total_points || 0,
                      history.used_points || 0,
                      history.available_points || 0,
                  ].join(",")
              ),
          ].join("\n");
  
          
          const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          const url = URL.createObjectURL(blob);
  
          
          let period = "";
          if (timeFilter === "monthly") {
              period = `${selectedYear}-${(selectedMonth + 1)
                  .toString()
                  .padStart(2, "0")}`;
          } else if (timeFilter === "quarterly") {
              period = `${selectedYear}-Q${selectedQuarter}`;
          } else {
              period = selectedYear.toString();
          }
  
          link.setAttribute("href", url);
          link.setAttribute("download", `point-accumuhistories-${period}.csv`);
          document.body.appendChild(link);
          link.click();
          link.remove();
      } */

    async function handleExportExcel() {
        // โหลด library ตอนกด export เพราะมีขนาดใหญ่และทำให้หน้าเปิดช้า
        const [XLSX, { saveAs }] = await Promise.all([
            import("xlsx"),
            import("file-saver"),
        ]);

        // 1) แปลงข้อมูลเป็น array ของ object (หัวคอลัมน์เป็นภาษาไทย)
        const rows = filteredAndSortedHistories.map((h) => ({
            "ชื่อผู้ใช้": h.full_name ?? "-",
            "ชื่อร้านค้า": h.store_name ?? "-",
            "ตัวแทน": h.agent_store_name ?? "-",
            "โทร": h.phone_number ?? "-",
            "จังหวัด": h.province ?? "-",
            "คะแนนสะสมก่อนหน้า": Number(h.bf_points ?? 0),
            "คะแนนสะสม": Number(h.accumulate_points ?? 0),
            "คะแนนทั้งหมด": Number(h.total_points ?? 0),
            "ที่ใช้ไป": Number(h.used_points ?? 0),
            "คงเหลือ": Number(h.available_points ?? 0),
        }));

        // 2) สร้าง filename ตามช่วงเวลา
        let period = "";
        if (timeFilter === "monthly") {
            period = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
        } else if (timeFilter === "quarterly") {
            period = `${selectedYear}-Q${selectedQuarter}`;
        } else {
            period = String(selectedYear);
        }

        // 3) สร้าง worksheet + workbook
        const ws = XLSX.utils.json_to_sheet(rows, {
            header: [
                "ชื่อผู้ใช้",
                "ชื่อร้านค้า",
                "ตัวแทน",
                "โทร",
                "จังหวัด",
                "คะแนนสะสมก่อนหน้า",
                "คะแนนสะสม",
                "คะแนนทั้งหมด",
                "ที่ใช้ไป",
                "คงเหลือ",
            ],
        });

        // 4) ตั้งความกว้างคอลัมน์ (ปรับได้ตามชอบ)
        ws["!cols"] = [
            { wch: 18 }, // ชื่อผู้ใช้
            { wch: 22 }, // ชื่อร้านค้า
            { wch: 20 }, // ตัวแทน
            { wch: 14 }, // โทร
            { wch: 14 }, // จังหวัด
            { wch: 18 }, // คะแนนสะสมก่อนหน้า
            { wch: 12 }, // คะแนนสะสม
            { wch: 12 }, // คะแนนทั้งหมด
            { wch: 10 }, // ที่ใช้ไป
            { wch: 10 }, // คงเหลือ
        ];

        // 5) ฟอร์แมตตัวเลข (ให้เป็น Number จริง + ใส่รูปแบบ)
        //    ช่วงคอลัมน์คะแนน: F(6) ถึง J(10)
        const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
        for (let R = range.s.r + 1; R <= range.e.r; R++) {
            for (let C = 5; C <= 9; C++) {
                const addr = XLSX.utils.encode_cell({ r: R, c: C });
                const cell = ws[addr];
                if (!cell) continue;
                cell.t = "n";
                cell.z = "#,##0"; // คั่นหลักพัน
            }
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "ประวัติแต้มสะสม");

        // 6) เขียนเป็นไฟล์ แล้วดาวน์โหลด
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(blob, `point-accumuhistories-${period}.xlsx`);
    }


    if (isLoadingUserPointHistories)
        return <Loading message="กำลังดึงข้อมูลประวัติการแลกคะแนน..." />;

    if (!userPointHistories) return <div>ไม่พบข้อมูล</div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">ประวัติสะสมคะแนน</h1>
                <div className="flex gap-4">
                    <div className="flex gap-2">
                        <TimeFilterSelect
                            timeFilter={timeFilter}
                            setTimeFilter={handleTimeFilterChange}
                        />
                        {timeFilter !== "monthly" && (
                            <YearSelect
                                selectedYear={selectedYear}
                                setSelectedYear={setSelectedYear}
                                years={years}
                            />
                        )}

                        {timeFilter === "monthly" && (
                            <div className="flex gap-2 items-center">
                                <DatePicker
                                    value={startDate}
                                    onChange={handleStartDateChange}
                                    placeholder="วันที่เริ่มต้น"
                                />
                                <span>ถึง</span>
                                <DatePicker
                                    value={endDate}
                                    onChange={handleEndDateChange}
                                    placeholder="วันที่สิ้นสุด"
                                    minDate={startDate}
                                />
                            </div>
                        )}

                        {timeFilter === "quarterly" && (
                            <QuarterSelect
                                selectedQuarter={selectedQuarter}
                                setSelectedQuarter={setSelectedQuarter}
                            />
                        )}
                    </div>

                    <Button onClick={handleExportExcel}>
                        <Download className="w-4 h-4 mr-2" />
                        Export เป็น Excel
                    </Button>
                </div>
            </div>

            <div className="flex gap-4 items-center">
                <ProvinceSelect
                    selectedProvince={selectedProvince}
                    setSelectedProvince={setSelectedProvince}
                />
                <Input
                    placeholder="ค้นหาร้านค้า..."
                    value={storeNameFilter}
                    onChange={(e) => setStoreNameFilter(e.target.value)}
                    className="w-[300px]"
                />
                <Input
                    placeholder="ค้นหาตัวแทน..."
                    value={agentStoreNameFilter}
                    onChange={(e) => setAgentStoreNameFilter(e.target.value)}
                    className="w-[300px]"
                />
            </div>

            <div>
                <PointHistoryTable
                    userPointHistories={pageRows}
                    sortConfig={sortConfig}
                    onSort={handleSort}
                />
                <TablePagination pagination={pagination} />
            </div>
        </div>
    );
};

export default PointHistoriesPage;
