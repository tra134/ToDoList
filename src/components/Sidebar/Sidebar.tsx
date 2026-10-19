import type { Task } from "../../types/task";
import { selectDoneToday, selectTodoToday } from "../../utils/filterTasks";
import { formatTimeLeft } from "../../utils/time";
import "./Sidebar.css";

interface SidebarProps {
  tasks: Task[];
  now: number;
}

/**
 * Sidebar bên trái: danh sách nhanh các việc trong ngày
 * (quá hạn đứng đầu, chưa xếp lịch đứng cuối) + mục "Đã xong hôm nay".
 * Menu điều hướng và các nút điều khiển đã chuyển lên taskbar (Topbar).
 */
export function Sidebar({ tasks, now }: SidebarProps) {
  const todoToday = selectTodoToday(tasks, now);
  const doneToday = selectDoneToday(tasks, now);

  return (
    <aside className="sidebar">
      <section className="sidebar-today" aria-label="Danh sách việc hôm nay">
        <header className="sidebar-today__head">
          <h2 className="sidebar-today__title">Việc hôm nay</h2>
          <span className="sidebar-today__count">{todoToday.length}</span>
        </header>

        {todoToday.length === 0 ? (
          <p className="sidebar-today__empty">Không có việc cần làm hôm nay.</p>
        ) : (
          <ul className="sidebar-today__list">
            {todoToday.map((task) => {
              const overdue =
                task.dueAt !== null && task.dueAt < now;
              return (
                <li key={task.id} className="sidebar-today__item">
                  <span
                    className={`sidebar-today__dot${
                      overdue ? " sidebar-today__dot--overdue" : ""
                    }`}
                    aria-hidden="true"
                  />
                  <span className="sidebar-today__name" title={task.title}>
                    {task.title}
                  </span>
                  {task.dueAt !== null && (
                    <span
                      className={`sidebar-today__time${
                        overdue ? " sidebar-today__time--overdue" : ""
                      }`}
                    >
                      {formatTimeLeft(task.dueAt, now)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {doneToday.length > 0 && (
        <p className="sidebar-today__done">
          Đã xong hôm nay: <strong>{doneToday.length}</strong>
        </p>
      )}
    </aside>
  );
}
