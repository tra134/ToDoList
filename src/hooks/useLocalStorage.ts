import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

/**
 * Generic hook đọc/ghi localStorage.
 * - Đọc lúc khởi tạo (lazy initializer) bằng try/catch để JSON hỏng không crash.
 * - Ghi lại mỗi khi value đổi.
 * - Setter nhận cả giá trị mới lẫn updater `(prev) => next` như useState.
 */
export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initial;
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage có thể bị chặn (private mode) — bỏ qua, app vẫn chạy.
    }
  }, [key, value]);

  return [value, setValue];
}
