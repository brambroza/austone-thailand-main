import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function containsOnlyNumber(text: string) {
  return /^\d+$/.test(text);
}

export function getDayOfWeek(date: string) {
  const daysOfWeek = [
    "อาทิตย์",
    "จันทร์",
    "อังคาร",
    "พุธ",
    "พฤหัสบดี",
    "ศุกร์",
    "เสาร์",
  ];
  const day = new Date(date).getDay();
  return daysOfWeek[day];
}

export function formatThaiNumber(number: number) {
  return number.toLocaleString("th-TH");
}

export function getZodErrorMessage(error: ZodError<any>) {
  return error.errors[0].message;
}