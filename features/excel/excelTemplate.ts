import ExcelJS from "exceljs";

export async function downloadImportTemplateXlsxWithUser(userId: string) {
  if (!userId?.trim()) throw new Error("userId ไม่ถูกต้อง");

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("import");

  ws.columns = [
    { header: "product_id", key: "product_id", width: 22 },
    { header: "user_id", key: "user_id", width: 18 },
    { header: "product_type_id", key: "product_type_id", width: 16 },
    { header: "bill_id", key: "bill_id", width: 12 },
    { header: "method", key: "method", width: 16 },
    { header: "product_score_option_id", key: "product_score_option_id", width: 22 },
    { header: "expire_years", key: "expire_years", width: 14 },
    { header: "point_multiplier", key: "point_multiplier", width: 16 },
  ];

  ws.getRow(1).font = { bold: true };

  // ใส่ user_id ให้เลยในตัวอย่าง 2 แถว (ผู้ใช้แก้ product_id ต่อได้)
  ws.addRow({
    product_id: "barcode No",
    user_id: userId,
    product_type_id: 1,
    bill_id: null,
    method: "อัปโหลดผ่าน EXCEL",
    product_score_option_id: 1,
    expire_years: 2,
    point_multiplier: 1,
  });
  

  // ถ้าต้องการให้ทั้งคอลัมน์ user_id ถูก “แนะนำ” เป็นค่าเดียวกัน:
  // (ExcelJS ทำ data validation list ได้ แต่บางโปรแกรมเปิดแล้วไม่รองรับครบ)
  // ปล่อยแบบนี้เรียบ ๆ จะชัวร์สุด

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const safeUser = userId.replace(/[^\w\-]/g, "_");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `template_import_${safeUser}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
