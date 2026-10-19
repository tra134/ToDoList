export const STORAGE_KEY = "todolist.tasks";

export const TICK_MS = 30_000; // kiểm tra deadline mỗi 30 giây

export const REMINDER_OPTIONS = [0, 5, 10, 30, 60, 1440] as const;

export type ReminderOption = (typeof REMINDER_OPTIONS)[number];
