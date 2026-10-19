import { Footer } from "../components/Footer/Footer";
import { TaskForm } from "../components/TaskForm/TaskForm";
import { TaskList } from "../components/TaskList/TaskList";
import type { UseTasksResult } from "../hooks/useTasks";
import { filterTasks } from "../utils/filterTasks";
import { getUserTimeZone, isOverdue, isSameDay } from "../utils/time";

interface TodayPageProps extends UseTasksResult {
  now: number;
}

const DATE_FORMAT = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: getUserTimeZone(),
});

/**
 * Trang chủ ("/") — menu chính: task cần làm trong ngày.
 * Gồm: task quá hạn, task đến hạn hôm nay và task chưa xếp lịch (còn hạn tự do).
 * Task có hạn ở ngày khác chỉ thấy ở trang /tasks.
 * Kèm mục "Hoàn thành hôm nay" (nếu có) + Footer đếm tổng.
 */
export function TodayPage({
  now,
  tasks,
  addTask,
  toggleTask,
  deleteTask,
  editTask,
  setDeadline,
  setMeta,
}: TodayPageProps) {
  const active = filterTasks(tasks, "active", now);
  // Quá hạn (hạn đã qua) + đến hạn hôm nay + chưa xếp lịch.
  // Sắp xếp theo hạn tăng dần: quá hạn đứng đầu, task chưa có hạn đứng cuối.
  const todoToday = active
    .filter(
      (t) => t.dueAt === null || isOverdue(t, now) || isSameDay(t.dueAt, now),
    )
    .sort((a, b) => (a.dueAt ?? Number.MAX_SAFE_INTEGER) - (b.dueAt ?? Number.MAX_SAFE_INTEGER));

  const doneToday = tasks.filter(
    (t) => t.completed && t.completedAt !== null && isSameDay(t.completedAt, now),
  );

  const remaining = active.length;
  const overdue = filterTasks(tasks, "overdue", now).length;

  return (
    <main className="today-page">
      <header className="today-page__head">
        <h2 className="today-page__title">Cần làm hôm nay</h2>
        <time className="today-page__date">{DATE_FORMAT.format(now)}</time>
      </header>

      <TaskForm onAdd={addTask} />

      <TaskList
        tasks={todoToday}
        now={now}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onEdit={editTask}
        onSetDeadline={setDeadline}
        onSetMeta={setMeta}
      />

      {doneToday.length > 0 && (
        <section className="today-page__done">
          <h3 className="today-page__subtitle">
            Hoàn thành hôm nay ({doneToday.length})
          </h3>
          <TaskList
            tasks={doneToday}
            now={now}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onEdit={editTask}
            onSetDeadline={setDeadline}
            onSetMeta={setMeta}
          />
        </section>
      )}

      <Footer remaining={remaining} overdue={overdue} />
    </main>
  );
}
