import { Route, Routes } from "react-router-dom";
import { NotificationButton } from "./components/NotificationButton/NotificationButton";
import { ReminderToast } from "./components/ReminderToast/ReminderToast";
import { useNow } from "./hooks/useNow";
import { useReminders } from "./hooks/useReminders";
import { useTasks } from "./hooks/useTasks";
import { NotFoundPage } from "./pages/NotFoundPage";
import { TaskPage } from "./pages/TaskPage";

/**
 * State (useTasks) và reminder (useReminders) sống ở đây — trên <Routes>
 * để chuyển route không mất banner nhắc, việc kiểm tra deadline không gián đoạn.
 */
export default function App() {
  const taskApi = useTasks();
  const now = useNow();
  const { alerts, dismiss } = useReminders(taskApi.tasks, now, taskApi.markReminded);

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">
          <svg
            className="app__logo"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <rect
              x="2"
              y="2"
              width="20"
              height="20"
              rx="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M7 12.5l3.2 3.2L17 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          ToDoList
        </h1>
        <NotificationButton />
      </header>

      <ReminderToast alerts={alerts} dismiss={dismiss} />

      <Routes>
        <Route path="/" element={<TaskPage filter="all" now={now} {...taskApi} />} />
        <Route
          path="/active"
          element={<TaskPage filter="active" now={now} {...taskApi} />}
        />
        <Route
          path="/completed"
          element={<TaskPage filter="completed" now={now} {...taskApi} />}
        />
        <Route
          path="/overdue"
          element={<TaskPage filter="overdue" now={now} {...taskApi} />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}
