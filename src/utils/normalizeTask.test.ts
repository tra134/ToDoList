import { describe, expect, it } from "vitest";
import { makeTask } from "../test/factories";
import { normalizeTask } from "./normalizeTask";

describe("normalizeTask", () => {
  it("task cũ thiếu field -> điền giá trị mặc định", () => {
    const old = { id: "old-1", title: "Task từ phase 4", completed: true, createdAt: 1_000 };
    const task = normalizeTask(old);

    expect(task).toEqual({
      id: "old-1",
      title: "Task từ phase 4",
      completed: true,
      createdAt: 1_000,
      dueAt: null,
      remindBeforeMin: 0,
      reminded: false,
    });
  });

  it("task đủ field -> giữ nguyên", () => {
    const full = makeTask({
      dueAt: 1_700_000_000_000,
      remindBeforeMin: 30,
      reminded: true,
    });
    expect(normalizeTask(full)).toEqual(full);
  });

  it("giá trị không phải object -> trả task rỗng có id hợp lệ, không throw", () => {
    const task = normalizeTask("rác từ localStorage");
    expect(task.id).toBeTypeOf("string");
    expect(task.id.length).toBeGreaterThan(0);
    expect(task.title).toBe("");
    expect(task.dueAt).toBeNull();
    expect(task.remindBeforeMin).toBe(0);
    expect(task.reminded).toBe(false);
  });

  it("field sai kiểu -> dùng giá trị mặc định", () => {
    const task = normalizeTask({ dueAt: "abc", remindBeforeMin: "5", completed: 1 });
    expect(task.dueAt).toBeNull();
    expect(task.remindBeforeMin).toBe(0);
    expect(task.completed).toBe(false);
  });
});
