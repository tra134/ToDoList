import { TASK_COLOR_IDS } from "../constants/config";
import type { Task, TaskColorId } from "../types/task";

/**
 * Điền giá trị mặc định cho task cũ còn thiếu field trong localStorage.
 * Nhận `unknown` để không tin dữ liệu ngoài.
 */
export function normalizeTask(input: unknown): Task {
  const raw: Partial<Record<keyof Task, unknown>> =
    typeof input === "object" && input !== null
      ? (input as Partial<Record<keyof Task, unknown>>)
      : {};

  return {
    id: typeof raw.id === "string" && raw.id !== "" ? raw.id : crypto.randomUUID(),
    title: typeof raw.title === "string" ? raw.title : "",
    completed: raw.completed === true,
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : Date.now(),
    dueAt: typeof raw.dueAt === "number" ? raw.dueAt : null,
    remindBeforeMin:
      typeof raw.remindBeforeMin === "number" ? raw.remindBeforeMin : 0,
    reminded: raw.reminded === true,
    color:
      typeof raw.color === "string" &&
      (TASK_COLOR_IDS as readonly string[]).includes(raw.color)
        ? (raw.color as TaskColorId)
        : "none",
    note: typeof raw.note === "string" ? raw.note : "",
    completedAt: typeof raw.completedAt === "number" ? raw.completedAt : null,
  };
}
