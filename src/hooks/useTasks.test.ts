import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { STORAGE_KEY } from "../constants/config";
import { useTasks } from "./useTasks";

beforeEach(() => {
  window.localStorage.clear();
});

function setup() {
  return renderHook(() => useTasks());
}

describe("useTasks", () => {
  it("add -> tăng số task, task mới chưa xong", () => {
    const { result } = setup();

    act(() => {
      result.current.addTask("Ăn cơm");
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe("Ăn cơm");
    expect(result.current.tasks[0].completed).toBe(false);
    expect(result.current.tasks[0].dueAt).toBeNull();
  });

  it("add title rỗng hoặc toàn khoảng trắng -> không thêm", () => {
    const { result } = setup();

    act(() => {
      result.current.addTask("   ");
      result.current.addTask("");
    });

    expect(result.current.tasks).toHaveLength(0);
  });

  it("add kèm deadline + nhắc trước", () => {
    const { result } = setup();
    const dueAt = Date.UTC(2026, 9, 25, 7, 0);

    act(() => {
      result.current.addTask("Nộp báo cáo", dueAt, 30);
    });

    expect(result.current.tasks[0].dueAt).toBe(dueAt);
    expect(result.current.tasks[0].remindBeforeMin).toBe(30);
    expect(result.current.tasks[0].reminded).toBe(false);
  });

  it("toggle -> đổi trạng thái completed", () => {
    const { result } = setup();
    act(() => {
      result.current.addTask("Đi chợ");
    });
    const id = result.current.tasks[0].id;

    act(() => {
      result.current.toggleTask(id);
    });
    expect(result.current.tasks[0].completed).toBe(true);

    act(() => {
      result.current.toggleTask(id);
    });
    expect(result.current.tasks[0].completed).toBe(false);
  });

  it("delete -> task biến mất", () => {
    const { result } = setup();
    act(() => {
      result.current.addTask("Xoá tôi");
    });

    act(() => {
      result.current.deleteTask(result.current.tasks[0].id);
    });

    expect(result.current.tasks).toHaveLength(0);
  });

  it("edit -> đổi title; title rỗng -> giữ nguyên", () => {
    const { result } = setup();
    act(() => {
      result.current.addTask("Cũ");
    });
    const id = result.current.tasks[0].id;

    act(() => {
      result.current.editTask(id, "  Mới  ");
    });
    expect(result.current.tasks[0].title).toBe("Mới");

    act(() => {
      result.current.editTask(id, "   ");
    });
    expect(result.current.tasks[0].title).toBe("Mới");
  });

  it("markReminded -> reminded = true", () => {
    const { result } = setup();
    act(() => {
      result.current.addTask("Nhắc tôi");
    });

    act(() => {
      result.current.markReminded(result.current.tasks[0].id);
    });

    expect(result.current.tasks[0].reminded).toBe(true);
  });

  it("setDeadline đặt lại reminded = false (được nhắc lại khi đổi hạn)", () => {
    const { result } = setup();
    const dueAt = Date.UTC(2026, 9, 25, 7, 0);
    act(() => {
      result.current.addTask("Có hạn", dueAt, 10);
    });
    const id = result.current.tasks[0].id;

    act(() => {
      result.current.markReminded(id);
    });
    expect(result.current.tasks[0].reminded).toBe(true);

    act(() => {
      result.current.setDeadline(id, dueAt + 3_600_000, 5);
    });

    expect(result.current.tasks[0].reminded).toBe(false);
    expect(result.current.tasks[0].dueAt).toBe(dueAt + 3_600_000);
    expect(result.current.tasks[0].remindBeforeMin).toBe(5);
  });

  it("setDeadline(null) -> bỏ deadline", () => {
    const { result } = setup();
    act(() => {
      result.current.addTask("Có hạn", Date.UTC(2026, 9, 25, 7, 0), 10);
    });

    act(() => {
      result.current.setDeadline(result.current.tasks[0].id, null, 0);
    });

    expect(result.current.tasks[0].dueAt).toBeNull();
    expect(result.current.tasks[0].remindBeforeMin).toBe(0);
  });

  it("mọi thao tác đều ghi vào localStorage", () => {
    const { result } = setup();

    act(() => {
      result.current.addTask("Lưu tôi");
    });

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(saved).toHaveLength(1);
    expect(saved[0].title).toBe("Lưu tôi");
  });

  it("dữ liệu localStorage cũ thiếu field -> đọc vẫn chuẩn (normalize)", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: "old", title: "Task cũ", completed: false, createdAt: 1 }]),
    );

    const { result } = setup();

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].dueAt).toBeNull();
    expect(result.current.tasks[0].remindBeforeMin).toBe(0);
    expect(result.current.tasks[0].reminded).toBe(false);
  });
});
