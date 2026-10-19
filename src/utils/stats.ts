import type { Task } from "../types/task";
import { isOverdue, isSameDay, isSameMonth } from "./time";

const DAY_MS = 86_400_000;

export interface DailyPoint {
  label: string;
  value: number;
}

export interface TaskStats {
  total: number;
  completed: number;
  doing: number; // chưa xong, chưa quá hạn
  overdue: number;
  progress: number; // phần trăm 0..100
  doneToday: number;
  doneThisMonth: number;
  linePoints: DailyPoint[]; // 7 ngày gần nhất, ngày cuối là hôm nay
}

/** Tính số liệu thống kê cho dashboard + sidebar. */
export function computeStats(tasks: Task[], now: number): TaskStats {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const overdue = tasks.filter((t) => isOverdue(t, now)).length;
  const doing = total - completed - overdue;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const doneToday = tasks.filter(
    (t) => t.completedAt !== null && isSameDay(t.completedAt, now),
  ).length;
  const doneThisMonth = tasks.filter(
    (t) => t.completedAt !== null && isSameMonth(t.completedAt, now),
  ).length;

  const linePoints: DailyPoint[] = Array.from({ length: 7 }, (_, i) => {
    const day = now - (6 - i) * DAY_MS;
    return {
      label: String(new Date(day).getDate()),
      value: tasks.filter(
        (t) => t.completedAt !== null && isSameDay(t.completedAt, day),
      ).length,
    };
  });

  return {
    total,
    completed,
    doing,
    overdue,
    progress,
    doneToday,
    doneThisMonth,
    linePoints,
  };
}
