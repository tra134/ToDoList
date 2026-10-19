import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useLocalStorage } from "./useLocalStorage";

beforeEach(() => {
  window.localStorage.clear();
});

describe("useLocalStorage", () => {
  it("đọc được giá trị có sẵn trong localStorage", () => {
    window.localStorage.setItem("test.key", JSON.stringify([1, 2, 3]));

    const { result } = renderHook(() => useLocalStorage<number[]>("test.key", []));

    expect(result.current[0]).toEqual([1, 2, 3]);
  });

  it("không có giá trị -> trả về initial", () => {
    const { result } = renderHook(() => useLocalStorage<number[]>("test.key", [9]));

    expect(result.current[0]).toEqual([9]);
  });

  it("JSON hỏng -> trả về initial, không crash", () => {
    window.localStorage.setItem("test.key", "{không phải json!!!");

    const { result } = renderHook(() => useLocalStorage<number[]>("test.key", []));

    expect(result.current[0]).toEqual([]);
  });

  it("set -> ghi vào localStorage", () => {
    const { result } = renderHook(() =>
      useLocalStorage<Record<string, number>>("test.key", {}),
    );

    act(() => {
      result.current[1]({ a: 1 });
    });

    expect(result.current[0]).toEqual({ a: 1 });
    expect(JSON.parse(window.localStorage.getItem("test.key") ?? "null")).toEqual({
      a: 1,
    });
  });

  it("set bằng updater (prev => next) cũng ghi được", () => {
    window.localStorage.setItem("test.key", JSON.stringify([1]));

    const { result } = renderHook(() => useLocalStorage<number[]>("test.key", []));

    act(() => {
      result.current[1]((prev) => [...prev, 2]);
    });

    expect(result.current[0]).toEqual([1, 2]);
    expect(JSON.parse(window.localStorage.getItem("test.key") ?? "null")).toEqual([
      1, 2,
    ]);
  });
});
