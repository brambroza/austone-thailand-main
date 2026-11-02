import { useEffect, useState } from "react";

const DEFAULT_DELAY_MS = 300;

/**
 * หน่วงค่าที่เปลี่ยนบ่อย เช่น ช่องค้นหา เพื่อไม่ให้ยิง API ทุกตัวอักษร
 *
 * @param value - ค่าล่าสุด
 * @param delayMs - เวลาที่รอหลังค่าหยุดเปลี่ยน
 * @returns ค่าหลังหน่วงแล้ว
 */
export function useDebouncedValue<T>(value: T, delayMs = DEFAULT_DELAY_MS): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
