import type { Task } from "../types/task";
import {
  addDays,
  isOverdue,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "./time";

const DAY_MS = 86_400_000;

export interface DailyPoint {
  label: string;
  value: number;
}

/** Done/undone của một kỳ (hôm nay, tuần này, tháng này). */
export interface PeriodStat {
  label: string;
  done: number; // hoàn thành trong kỳ (completedAt nằm trong kỳ)
  pending: number; // còn nợ: có hạn trong kỳ nhưng chưa xong
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
  weeklyPoints: DailyPoint[]; // 4 tuần gần nhất, tuần cuối là tuần hiện tại
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

  // 4 tuần gần nhất (tuần = Thứ 2 -> CN), tuần cuối cùng là tuần hiện tại.
  const thisWeekStart = startOfWeek(now);
  const weeklyPoints: DailyPoint[] = Array.from({ length: 4 }, (_, i) => {
    const weekStart = addDays(thisWeekStart, -(3 - i) * 7);
    const weekEnd = addDays(weekStart, 7);
    return {
      label: `${new Date(weekStart).getDate()}/${new Date(weekStart).getMonth() + 1}`,
      value: tasks.filter(
        (t) =>
          t.completedAt !== null &&
          t.completedAt >= weekStart &&
          t.completedAt < weekEnd,
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
    weeklyPoints,
  };
}

/**
 * Done/undone theo kỳ cho bar chart:
 * - "Hôm nay"  : completedAt trong hôm nay vs hạn hôm nay còn nợ.
 * - "Tuần này" : completedAt từ Thứ 2 đến hết Chủ nhật vs hạn trong tuần còn nợ.
 * - "Tháng này": completedAt trong tháng vs hạn trong tháng còn nợ.
 * "Còn nợ" = có deadline nằm trong kỳ nhưng chưa xong (kể cả đã quá hạn).
 */
export function computePeriodStats(tasks: Task[], now: number): PeriodStat[] {
  const dayStart = startOfDay(now);
  const dayEnd = addDays(dayStart, 1);
  const weekStart = startOfWeek(now);
  const weekEnd = addDays(weekStart, 7);
  const monthStart = startOfMonth(now);
  const ms = new Date(monthStart);
  const monthEnd = new Date(ms.getFullYear(), ms.getMonth() + 1, 1).getTime(); // mùng 1 tháng sau

  const periods: Array<{ label: string; start: number; end: number }> = [
    { label: "Hôm nay", start: dayStart, end: dayEnd },
    { label: "Tuần này", start: weekStart, end: weekEnd },
    { label: "Tháng này", start: monthStart, end: monthEnd },
  ];

  return periods.map(({ label, start, end }) => ({
    label,
    done: tasks.filter(
      (t) =>
        t.completedAt !== null && t.completedAt >= start && t.completedAt < end,
    ).length,
    pending: tasks.filter(
      (t) => !t.completed && t.dueAt !== null && t.dueAt >= start && t.dueAt < end,
    ).length,
  }));
}
