import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BillWithProductAndProductTypeAndProductTypeConstraint } from "../types/bill.type";
import BillRow from "./BillRow";

interface IBillListTableProps {
  bills: BillWithProductAndProductTypeAndProductTypeConstraint[] | null;
}

const BillListTable = ({ bills }: IBillListTableProps) => {
  if (!bills)
    return (
      <div className="w-full h-[200px] flex items-center justify-center">
        <p className="text-center text-gray-400">คุณยังไม่ได้สร้างบิล</p>
      </div>
    );

  return (
    <Card className="p-6">
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-white/70">
              <TableHead>เลขที่บิล</TableHead>
              <TableHead>ชื่อลูกค้า</TableHead>
              <TableHead>อีเมลลูกค้า</TableHead>
              <TableHead>วันที่สร้าง</TableHead>
              <TableHead>วันที่เอกสาร</TableHead>
              <TableHead>ตัวเลือก</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <BillRow key={bill.id} bill={bill} />
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default BillListTable;
