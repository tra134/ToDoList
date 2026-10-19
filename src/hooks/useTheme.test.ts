import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { THEME_KEY } from "../constants/config";
import { getAutoTheme, useTheme } from "./useTheme";

beforeEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
});

afterEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
});

describe("getAutoTheme", () => {
  it("18h–24h và 0h–6h là tối", () => {
    expect(getAutoTheme(18)).toBe("dark");
    expect(getAutoTheme(23)).toBe("dark");
    expect(getAutoTheme(0)).toBe("dark");
    expect(getAutoTheme(5)).toBe("dark");
  });

  it("6h–18h là sáng", () => {
    expect(getAutoTheme(6)).toBe("light");
    expect(getAutoTheme(12)).toBe("light");
    expect(getAutoTheme(17)).toBe("light");
  });
});

describe("useTheme", () => {
  it("mặc định mode auto, theme theo giờ hiện tại", () => {
    const noon = new Date(2026, 9, 19, 12, 0, 0).getTime();
    const { result } = renderHook(() => useTheme(noon));

    expect(result.current.mode).toBe("auto");
    expect(result.current.theme).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("auto buổi tối -> dark (theo `now` truyền vào)", () => {
    const night = new Date(2026, 9, 19, 21, 0, 0).getTime();
    const { result } = renderHook(() => useTheme(night));

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("toggle ghi đè chế độ tự động và lưu localStorage", () => {
    const noon = new Date(2026, 9, 19, 12, 0, 0).getTime();
    const { result } = renderHook(() => useTheme(noon));

    act(() => result.current.toggle());

    expect(result.current.mode).toBe("dark");
    expect(result.current.theme).toBe("dark");
    expect(window.localStorage.getItem(THEME_KEY)).toBe("dark");
  });

  it("đọc lại mode đã lưu từ lần trước", () => {
    window.localStorage.setItem(THEME_KEY, "light");

    const night = new Date(2026, 9, 19, 21, 0, 0).getTime();
    const { result } = renderHook(() => useTheme(night));

    expect(result.current.mode).toBe("light");
    expect(result.current.theme).toBe("light");
  });

  it("setMode('auto') trả về chế độ theo giờ", () => {
    const night = new Date(2026, 9, 19, 21, 0, 0).getTime();
    const { result } = renderHook(() => useTheme(night));

    act(() => result.current.setMode("dark"));
    act(() => result.current.setMode("auto"));

    expect(result.current.mode).toBe("auto");
    expect(result.current.theme).toBe("dark");
    expect(window.localStorage.getItem(THEME_KEY)).toBe("auto");
  });
});
