import { CalendarDate } from "@internationalized/date";

export function getFutureDate(years: number): Date {
  return new Date(new Date().setFullYear(new Date().getFullYear() + years));
}

export function getCalendarDateFromDate(date: Date): CalendarDate {
  return new CalendarDate(date.getFullYear(), date.getMonth(), date.getDate());
}

export function formatThaiDate(date: Date): string {
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function getThaiDatetime(date: Date) {
  const thaiTimezoneOffset = 7;
  date.setHours(date.getHours() + thaiTimezoneOffset);
  return date;
}

export function monthIndexToMonthName(monthIndex: number) {
  const anyYearThatDoesNotAffectLogic = 2000; // This will not affect the logic

  return new Date(anyYearThatDoesNotAffectLogic, monthIndex).toLocaleString(
    "th-TH",
    {
      month: "long",
    }
  );
}
