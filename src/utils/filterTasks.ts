import type { Filter, Task } from "../types/task";
import { isOverdue, isSameDay } from "./time";

export function filterTasks(
  tasks: Task[],
  filter: Filter,
  now: number,
): Task[] {
  switch (filter) {
    case "all":
      return tasks;
    case "active":
      return tasks.filter((t) => !t.completed);
    case "completed":
      return tasks.filter((t) => t.completed);
    case "overdue":
      return tasks.filter((t) => isOverdue(t, now));
    default: {
      // Exhaustive switch: nếu thêm filter mới mà quên nhánh, TS sẽ báo lỗi.
      const exhaustiveCheck: never = filter;
      return exhaustiveCheck;
    }
  }
}

/**
 * Việc cần làm trong ngày: task chưa xong mà (quá hạn | đến hạn hôm nay | chưa xếp lịch).
 * Sắp xếp theo hạn tăng dần: quá hạn đứng đầu, task chưa có hạn đứng cuối.
 * Dùng chung cho trang Hôm nay và sidebar danh sách nhanh.
 */
export function selectTodoToday(tasks: Task[], now: number): Task[] {
  return filterTasks(tasks, "active", now)
    .filter(
      (t) => t.dueAt === null || isOverdue(t, now) || isSameDay(t.dueAt, now),
    )
    .sort(
      (a, b) =>
        (a.dueAt ?? Number.MAX_SAFE_INTEGER) -
        (b.dueAt ?? Number.MAX_SAFE_INTEGER),
    );
}

/** Việc đã hoàn thành trong hôm nay (đếm theo thời điểm hoàn thành). */
export function selectDoneToday(tasks: Task[], now: number): Task[] {
  return tasks.filter(
    (t) => t.completed && t.completedAt !== null && isSameDay(t.completedAt, now),
  );
}
