import { FilterNav } from "../components/FilterNav/FilterNav";
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

/** Dùng chung cho cả 4 route, khác nhau ở prop `filter`. */
export function TaskPage({
  filter,
  now,
  tasks,
  addTask,
  toggleTask,
  deleteTask,
  editTask,
  setDeadline,
}: TaskPageProps) {
  const visible = filterTasks(tasks, filter, now);
  const remaining = filterTasks(tasks, "active", now).length;
  const overdue = filterTasks(tasks, "overdue", now).length;

  return (
    <main className="task-page">
      <TaskForm onAdd={addTask} />
      <FilterNav />
      <TaskList
        tasks={visible}
        now={now}
        onToggle={toggleTask}
        onDelete={deleteTask}
        onEdit={editTask}
        onSetDeadline={setDeadline}
      />
      <Footer remaining={remaining} overdue={overdue} />
    </main>
  );
}
