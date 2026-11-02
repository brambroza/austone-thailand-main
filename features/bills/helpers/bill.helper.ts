export function translateBillErrorMessage(errorMessage: string) {
  switch (errorMessage) {
    case `duplicate key value violates unique constraint "bills_bill_no_key"`:
      return "เลขที่บิลนี้มีอยู่ในระบบแล้ว";
    default:
      return errorMessage;
  }
}
