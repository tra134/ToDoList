import type { Task } from "../../types/task";
import { formatDeadline, formatTimeLeft, isDueSoon, isOverdue } from "../../utils/time";
import "./DeadlineBadge.css";

interface DeadlineBadgeProps {
  task: Task;
  now: number;
}

/**
 * Badge trạng thái deadline: xám (bình thường) / vàng (sắp tới hạn) / đỏ (quá hạn).
 * Task đã xong không bao giờ tô đỏ.
 */
export function DeadlineBadge({
  task,
  now,
}: DeadlineBadgeProps) {
  if (task.dueAt === null) return null;

  const overdue = isOverdue(task, now);
  const soon = isDueSoon(task, now);
  const modifier = overdue
    ? " deadline-badge--overdue"
    : soon
      ? " deadline-badge--soon"
      : " deadline-badge--normal";

  return (
    <span className={`deadline-badge${modifier}`}>
      <span className="deadline-badge__time">{formatDeadline(task.dueAt)}</span>
      <span className="deadline-badge__left">{formatTimeLeft(task.dueAt, now)}</span>
    </span>
  );
}
