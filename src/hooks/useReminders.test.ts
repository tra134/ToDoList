import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TICK_MS } from "../constants/config";
import { makeTask } from "../test/factories";
import { useNow } from "./useNow";
import { useReminders } from "./useReminders";

const BASE = Date.UTC(2026, 9, 25, 7, 0); // 14:00 UTC+7
const MINUTE = 60_000;

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useReminders", () => {
  it("chưa tới mốc nhắc -> alerts rỗng, không gọi markReminded", () => {
    const task = makeTask({ dueAt: BASE, remindBeforeMin: 5 });
    const markReminded = vi.fn();

    // Còn 6 phút mới tới hạn -> mốc nhắc (trước 5 phút) chưa đến.
    const { result } = renderHook(() =>
      useReminders([task], BASE - 6 * MINUTE, markReminded),
    );

    expect(result.current.alerts).toEqual([]);
    expect(markReminded).not.toHaveBeenCalled();
  });

  it("tới mốc nhắc -> 1 alert + markReminded 1 lần + gửi notification", () => {
    const created: { title: string; body?: string }[] = [];
    class FakeNotification {
      static permission: NotificationPermission = "granted";
      static requestPermission = vi.fn();
      constructor(title: string, options?: NotificationOptions) {
        created.push({ title, body: options?.body });
      }
    }
    vi.stubGlobal("Notification", FakeNotification);

    const task = makeTask({ title: "Nộp báo cáo", dueAt: BASE, remindBeforeMin: 5 });
    const markReminded = vi.fn();

    const { result } = renderHook(() =>
      useReminders([task], BASE - 4 * MINUTE, markReminded),
    );

    expect(result.current.alerts).toEqual([
      { taskId: task.id, title: "Nộp báo cáo", overdue: false },
    ]);
    expect(markReminded).toHaveBeenCalledTimes(1);
    expect(markReminded).toHaveBeenCalledWith(task.id);
    expect(created).toHaveLength(1);
    expect(created[0].title).toContain("Nộp báo cáo");
  });

  it("đã qua deadline -> alert có cờ overdue = true", () => {
    const task = makeTask({ title: "Quá hạn", dueAt: BASE, remindBeforeMin: 5 });
    const markReminded = vi.fn();

    const { result } = renderHook(() =>
      useReminders([task], BASE + 10 * MINUTE, markReminded),
    );

    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.alerts[0].overdue).toBe(true);
  });

  it("task đã reminded -> không nhắc lại", () => {
    const task = makeTask({ dueAt: BASE, remindBeforeMin: 5, reminded: true });
    const markReminded = vi.fn();

    const { result } = renderHook(() =>
      useReminders([task], BASE, markReminded),
    );

    expect(result.current.alerts).toEqual([]);
    expect(markReminded).not.toHaveBeenCalled();
  });

  it("task đã hoàn thành -> không nhắc", () => {
    const task = makeTask({ dueAt: BASE, remindBeforeMin: 5, completed: true });
    const markReminded = vi.fn();

    const { result } = renderHook(() => useReminders([task], BASE, markReminded));

    expect(result.current.alerts).toEqual([]);
    expect(markReminded).not.toHaveBeenCalled();
  });

  it("remindBeforeMin = 0 (không nhắc) -> không nhắc dù đã quá hạn", () => {
    const task = makeTask({ dueAt: BASE - 60 * MINUTE, remindBeforeMin: 0 });
    const markReminded = vi.fn();

    const { result } = renderHook(() =>
      useReminders([task], BASE, markReminded),
    );

    expect(result.current.alerts).toEqual([]);
    expect(markReminded).not.toHaveBeenCalled();
  });

  it("quyền thông báo denied -> vẫn có alert trong app", () => {
    const created: unknown[] = [];
    class FakeNotification {
      static permission: NotificationPermission = "denied";
      static requestPermission = vi.fn();
      constructor(title: string) {
        created.push(title);
      }
    }
    vi.stubGlobal("Notification", FakeNotification);

    const task = makeTask({ title: "Vẫn nhắc", dueAt: BASE, remindBeforeMin: 5 });
    const markReminded = vi.fn();

    const { result } = renderHook(() => useReminders([task], BASE, markReminded));

    expect(result.current.alerts).toHaveLength(1);
    expect(created).toHaveLength(0); // không gửi được notification hệ thống
  });

  it("không có Notification (jsdom) -> vẫn có alert", () => {
    const task = makeTask({ title: "Nhắc trong app", dueAt: BASE, remindBeforeMin: 5 });
    const markReminded = vi.fn();

    const { result } = renderHook(() => useReminders([task], BASE, markReminded));

    expect(result.current.alerts).toHaveLength(1);
  });

  it("dismiss -> bỏ alert khỏi danh sách", () => {
    const task = makeTask({ title: "Đóng được", dueAt: BASE, remindBeforeMin: 5 });
    const markReminded = vi.fn();

    const { result } = renderHook(() => useReminders([task], BASE, markReminded));
    expect(result.current.alerts).toHaveLength(1);

    act(() => {
      result.current.dismiss(task.id);
    });

    expect(result.current.alerts).toEqual([]);
  });

  it("mỗi task chỉ nhắc 1 lần dù now tăng ở các lần tick sau", () => {
    const task = makeTask({ title: "Một lần", dueAt: BASE, remindBeforeMin: 5 });
    const markReminded = vi.fn();

    const { rerender } = renderHook(
      ({ now }: { now: number }) => useReminders([task], now, markReminded),
      { initialProps: { now: BASE - 4 * MINUTE } },
    );
    expect(markReminded).toHaveBeenCalledTimes(1);

    // Tick sau: now trễ hơn nhưng task không đổi -> không nhắc thêm.
    rerender({ now: BASE - 3 * MINUTE });
    expect(markReminded).toHaveBeenCalledTimes(1);
  });

  it("tick tới hạn nhờ useNow (fake timers)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(BASE - 6 * MINUTE)); // 6 phút trước hạn

    const task = makeTask({ title: "Sắp tới", dueAt: BASE, remindBeforeMin: 5 });
    const markReminded = vi.fn();

    const { result } = renderHook(() => {
      const now = useNow();
      return useReminders([task], now, markReminded);
    });

    expect(result.current.alerts).toEqual([]); // chưa tới mốc (còn 6 phút)

    act(() => {
      vi.advanceTimersByTime(2 * TICK_MS); // +1 phút -> đã qua mốc nhắc
    });

    expect(result.current.alerts).toHaveLength(1);
    expect(markReminded).toHaveBeenCalledTimes(1);
  });
});
