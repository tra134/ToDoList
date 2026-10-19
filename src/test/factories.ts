import type { Task } from "../types/task";

/** Tạo task giả cho test; `overrides` để test chỉ phần cần test. */
export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    title: "Task mẫu",
    completed: false,
    createdAt: Date.now(),
    dueAt: null,
    remindBeforeMin: 0,
    reminded: false,
    ...overrides,
  };
}
