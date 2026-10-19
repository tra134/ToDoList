import { useCallback, useEffect, useState } from "react";
import { THEME_KEY } from "../constants/config";

export type Theme = "light" | "dark";
export type ThemeMode = "auto" | "light" | "dark";

/** Giờ địa phương >= 18 hoặc < 6 -> giao diện tối; còn lại -> sáng. */
export function getAutoTheme(hour: number): Theme {
  return hour >= 18 || hour < 6 ? "dark" : "light";
}

function readStoredMode(): ThemeMode {
  try {
    const raw = window.localStorage.getItem(THEME_KEY);
    if (raw === "light" || raw === "dark" || raw === "auto") return raw;
  } catch {
    // localStorage bị chặn -> dùng auto
  }
  return "auto";
}

export interface UseThemeResult {
  mode: ThemeMode; // "auto" = tự theo múi giờ
  theme: Theme;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

/**
 * Theme sáng/tối:
 * - mặc định "auto": theo giờ địa phương (tối 18h–6h, sáng 6h–18h),
 *   truyền `now` từ useNow để app tự đổi khi tới giờ.
 * - người dùng bấm nút sáng/tối -> ghi đè và lưu vào localStorage.
 */
export function useTheme(now: number): UseThemeResult {
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredMode());

  const hour = new Date(now).getHours();
  const theme: Theme = mode === "auto" ? getAutoTheme(hour) : mode;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setMode = useCallback((next: ThemeMode): void => {
    setModeState(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // bỏ qua, app vẫn chạy với mode hiện tại
    }
  }, []);

  const toggle = useCallback((): void => {
    setMode(theme === "dark" ? "light" : "dark");
  }, [theme, setMode]);

  return { mode, theme, setMode, toggle };
}
