import type { Filter, Task } from "../types/task";
import { isOverdue } from "./time";

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
