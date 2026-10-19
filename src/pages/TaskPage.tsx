import { Footer } from "../components/Footer/Footer";
import { TaskForm } from "../components/TaskForm/TaskForm";
import { TaskList } from "../components/TaskList/TaskList";
import type { UseTasksResult } from "../hooks/useTasks";
import type { Filter } from "../types/task";
import { filterTasks } from "../utils/filterTasks";

interface TaskPageProps extends UseTasksResult {
  filter: Filter;
  now: number;
}

/** Tiêu đề trang theo bộ lọc (không trùng label menu sidebar). */
const TITLES: Record<Filter, string> = {
  all: "Tất cả task",
  active: "Task đang làm",
  completed: "Task đã xong",
  overdue: "Quá hạn",
};

/** Dùng chung cho các route /tasks, /active, /completed, /overdue. */
export function TaskPage({
  filter,
  now,
  tasks,
  addTask,
  toggleTask,
  deleteTask,
  editTask,
  setDeadline,
  setMeta,
}: TaskPageProps) {
  const visible = filterTasks(tasks, filter, now);
  const remaining = filterTasks(tasks, "active", now).length;
  const overdue = filterTasks(tasks, "overdue", now).length;

  return (
    <main className="task-page">
      <h2 className="task-page__title">{TITLES[filter]}</h2>
      <TaskForm onAdd={addTask} />
      <TaskList
        tasks={visible}
        now={now}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onEdit={editTask}
        onSetDeadline={setDeadline}
        onSetMeta={setMeta}
      />
      <Footer remaining={remaining} overdue={overdue} />
    </main>
  );
}
