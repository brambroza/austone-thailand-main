import { ProductWithScanner } from "@/models/product.model";

/** เพดานแถวต่อไฟล์ เพราะ exceljs สร้างไฟล์ใน browser และกินหน่วยความจำตามจำนวนแถว */
export const PRODUCT_EXPORT_MAX_ROWS = 50_000;

const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;
const HEADER_FILL = "FFFFE14D";
const BORDER_COLOR = "FFD9D9D9";

export interface ProductExportRow {
  index: number;
  id: string;
  productType: string;
  billNo: string;
  method: string;
  scannerName: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

const COLUMNS: {
  header: string;
  key: keyof ProductExportRow;
  width: number;
  isDate?: boolean;
  isCentered?: boolean;
}[] = [
  { header: "ลำดับ", key: "index", width: 8, isCentered: true },
  { header: "รหัสสินค้า", key: "id", width: 26 },
  { header: "ประเภทสินค้า", key: "productType", width: 24 },
  { header: "เลขบิล", key: "billNo", width: 18 },
  { header: "วิธีการเพิ่มสินค้า", key: "method", width: 22 },
  { header: "ชื่อผู้สแกน", key: "scannerName", width: 28 },
  { header: "วันที่สร้าง", key: "createdAt", width: 20, isDate: true, isCentered: true },
  { header: "วันที่อัพเดท", key: "updatedAt", width: 20, isDate: true, isCentered: true },
];

/**
 * แปลงเวลาจากฐานข้อมูลเป็นเวลาไทยสำหรับเซลล์ Excel
 * Excel ไม่มี timezone และ exceljs เขียนค่าตาม UTC จึงต้องบวก 7 ชั่วโมงเอง
 *
 * @param value - เวลาแบบ ISO จากฐานข้อมูล
 * @returns Date ที่แสดงเป็นเวลาไทยใน Excel หรือ null ถ้าไม่มีค่าหรืออ่านไม่ได้
 */
export function toExcelBangkokDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return null;

  return new Date(time + BANGKOK_OFFSET_MS);
}

/**
 * จัดสินค้าเป็นแถวสำหรับไฟล์ Excel เรียงคอลัมน์เหมือนตารางหน้า admin
 *
 * @param products - สินค้าที่ตรงกับตัวกรอง
 * @param productTypeTitles - ชื่อประเภทสินค้าตาม id
 * @returns แถวพร้อมเขียนลงไฟล์
 */
export function buildProductExportRows(
  products: ProductWithScanner[],
  productTypeTitles: Map<number, string>
): ProductExportRow[] {
  return products.map((product, i) => ({
    index: i + 1,
    id: product.id,
    productType:
      product.product_type_id == null
        ? "-"
        : productTypeTitles.get(product.product_type_id) ?? `#${product.product_type_id}`,
    billNo: product.bill_no || "ไม่มีเลขบิล",
    method: product.method ?? "-",
    scannerName: product.full_name ?? "ยังไม่ถูกสแกน",
    createdAt: toExcelBangkokDate(product.created_at),
    updatedAt: toExcelBangkokDate(product.updated_at),
  }));
}

/**
 * ตั้งชื่อไฟล์ตามวันที่และคำค้น ตัดอักขระที่ใช้ในชื่อไฟล์ไม่ได้ออก
 *
 * @param search - คำค้นที่ใช้กรอง
 * @param now - เวลาที่ส่งออก
 * @returns ชื่อไฟล์ .xlsx
 */
export function buildProductExportFileName(search: string, now = new Date()): string {
  const stamp = new Date(now.getTime() + BANGKOK_OFFSET_MS)
    .toISOString()
    .slice(0, 16)
    .replace("T", "_")
    .replace(":", "");
  const safeSearch = search.trim().replace(/[\\/:*?"<>|\s]+/g, "_").slice(0, 40);

  return `products_${safeSearch ? `${safeSearch}_` : ""}${stamp}.xlsx`;
}

/**
 * สร้างไฟล์ Excel รายการสินค้าแล้วสั่งดาวน์โหลดใน browser
 *
 * @param rows - แถวจาก buildProductExportRows
 * @param search - คำค้นที่ใช้กรอง แสดงในหัวไฟล์และชื่อไฟล์
 */
export async function downloadProductsExcel(rows: ProductExportRow[], search: string) {
  // โหลด exceljs ตอนกดเท่านั้น เพราะ library ใหญ่
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("สินค้า", {
    views: [{ state: "frozen", ySplit: 3 }],
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });

  sheet.columns = COLUMNS.map(({ key, width }) => ({ key, width }));

  // แถว 1-2 เป็นหัวรายงาน แถว 3 เป็นหัวคอลัมน์
  const lastColumn = sheet.getColumn(COLUMNS.length).letter;
  sheet.mergeCells(`A1:${lastColumn}1`);
  sheet.getCell("A1").value = "รายการสินค้า";
  sheet.getCell("A1").font = { bold: true, size: 14 };

  const exportedAt = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
  sheet.mergeCells(`A2:${lastColumn}2`);
  sheet.getCell("A2").value =
    `ตัวกรอง: ${search.trim() || "ทั้งหมด"}  |  จำนวน ${rows.length.toLocaleString("th-TH")} รายการ  |  ส่งออกเมื่อ ${exportedAt}`;
  sheet.getCell("A2").font = { size: 10, color: { argb: "FF666666" } };

  const headerRow = sheet.getRow(3);
  headerRow.values = COLUMNS.map((column) => column.header);
  headerRow.height = 22;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      top: { style: "thin", color: { argb: BORDER_COLOR } },
      bottom: { style: "thin", color: { argb: BORDER_COLOR } },
      left: { style: "thin", color: { argb: BORDER_COLOR } },
      right: { style: "thin", color: { argb: BORDER_COLOR } },
    };
  });

  sheet.addRows(rows);

  COLUMNS.forEach((column, i) => {
    const sheetColumn = sheet.getColumn(i + 1);
    if (column.isDate) sheetColumn.numFmt = "dd/mm/yyyy hh:mm";
    // รหัสสินค้าเป็น barcode ยาว ต้องเก็บเป็นข้อความไม่ให้ Excel แปลงเป็นเลขยกกำลัง
    if (column.key === "id" || column.key === "billNo") sheetColumn.numFmt = "@";
    if (column.isCentered) sheetColumn.alignment = { horizontal: "center" };
  });
  headerRow.eachCell((cell) => {
    cell.numFmt = "General";
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  sheet.autoFilter = {
    from: { row: 3, column: 1 },
    to: { row: 3, column: COLUMNS.length },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = buildProductExportFileName(search);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
