import { useEffect, useState } from "react";
import { TICK_MS } from "../constants/config";

/**
 * Trả về Date.now() cập nhật định kỳ.
 * Luôn so sánh với Date.now() (không đếm số lần tick) vì trình duyệt
 * giảm tần suất timer khi tab chạy nền.
 */
export function useNow(tickMs: number = TICK_MS): number {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), tickMs);
    return () => window.clearInterval(id);
  }, [tickMs]);

  return now;
}
