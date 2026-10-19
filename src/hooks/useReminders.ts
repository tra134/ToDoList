import { useCallback, useEffect, useRef, useState } from "react";
import type { ReminderAlert, Task } from "../types/task";
import { sendNotification } from "../utils/notify";

export interface UseRemindersResult {
  alerts: ReminderAlert[];
  dismiss: (taskId: string) => void;
}

/**
 * Quét task tới mốc nhắc (mỗi TICK_MS một lần nhờ useNow):
 * - thêm alert (banner trong app),
 * - gửi thông báo hệ thống (nếu được quyền),
 * - đánh dấu reminded để mỗi task chỉ nhắc 1 lần.
 *
 * Chỉ hoạt động khi tab đang mở.
 */
export function useReminders(
  tasks: Task[],
  now: number,
  markReminded: (id: string) => void,
): UseRemindersResult {
  const [alerts, setAlerts] = useState<ReminderAlert[]>([]);
  // Chốt chặn trùng lặp: key gồm cả deadline để đổi deadline được nhắc lại.
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    for (const task of tasks) {
      if (task.completed || task.dueAt === null || task.reminded) continue;
      if (task.remindBeforeMin <= 0) continue;
      if (now < task.dueAt - task.remindBeforeMin * 60_000) continue;

      const key = `${task.id}:${task.dueAt}:${task.remindBeforeMin}`;
      if (firedRef.current.has(key)) continue;
      firedRef.current.add(key);

      const overdue = now >= task.dueAt;
      setAlerts((prev) =>
        prev.some((a) => a.taskId === task.id)
          ? prev
          : [
              ...prev,
              { taskId: task.id, title: task.title, overdue },
            ],
      );
      sendNotification(
        overdue ? `⏰ Đã quá hạn: ${task.title}` : `⏳ Sắp tới hạn: ${task.title}`,
        overdue
          ? "Task đã vượt deadline."
          : "Task sắp đến hạn, chuẩn bị hoàn thành nhé!",
      );
      markReminded(task.id);
    }
  }, [tasks, now, markReminded]);

  const dismiss = useCallback((taskId: string): void => {
    setAlerts((prev) => prev.filter((a) => a.taskId !== taskId));
  }, []);

  return { alerts, dismiss };
}
