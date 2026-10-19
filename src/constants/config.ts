import type { TaskColorId } from "../types/task";

export const STORAGE_KEY = "todolist.tasks";

export const TICK_MS = 30_000; // kiểm tra deadline mỗi 30 giây

export const REMINDER_OPTIONS = [0, 5, 10, 30, 60, 1440] as const;

export type ReminderOption = (typeof REMINDER_OPTIONS)[number];

/** Số task tối đa mỗi trang — list dài hơn sẽ có phân trang. */
export const PAGE_SIZE = 8;

/** Màu kí hiệu task: gam trầm, chỉ dùng để phân loại (không trộn màu lộn xộn). */
export const TASK_COLORS: ReadonlyArray<{
  id: TaskColorId;
  label: string;
  hex: string;
}> = [
  { id: "none", label: "Không màu", hex: "#c7ccdb" },
  { id: "red", label: "Cần làm gấp", hex: "#e5484d" },
  { id: "orange", label: "Quan trọng", hex: "#f08c2e" },
  { id: "blue", label: "Công việc", hex: "#3b6ef6" },
  { id: "green", label: "Cá nhân", hex: "#2f9e6e" },
  { id: "purple", label: "Ý tưởng", hex: "#8b5cf6" },
];

export const TASK_COLOR_IDS: readonly TaskColorId[] = TASK_COLORS.map((c) => c.id);

export const TASK_COLOR_HEX: Record<TaskColorId, string> = TASK_COLORS.reduce(
  (acc, c) => {
    acc[c.id] = c.hex;
    return acc;
  },
  {} as Record<TaskColorId, string>,
);
