import { Route, Routes } from "react-router-dom";
import { useNow } from "./hooks/useNow";
import { useReminders } from "./hooks/useReminders";
import { useTasks } from "./hooks/useTasks";
import { useTheme } from "./hooks/useTheme";
import { AppLayout } from "./layouts/AppLayout";
import { NotFoundPage } from "./pages/NotFoundPage";
import { TaskPage } from "./pages/TaskPage";
import { TodayPage } from "./pages/TodayPage";

/**
 * State (useTasks), reminder (useReminders) và theme (useTheme) sống ở đây —
 * đặt trên <Routes> để chuyển route không mất banner nhắc, theme giữ nguyên.
 *
 * Route lồng trong AppLayout (sidebar + <Outlet/>):
 * - "/"        : trang chủ — task cần làm trong ngày
 * - "/tasks"   : tất cả task, "/active|/completed|/overdue" : lọc còn lại
 */
export default function App() {
  const taskApi = useTasks();
  const now = useNow();
  const { alerts, dismiss } = useReminders(taskApi.tasks, now, taskApi.markReminded);
  const { mode, theme, setMode, toggle } = useTheme(now);

  return (
    <Routes>
      <Route
        element={
          <AppLayout
            tasks={taskApi.tasks}
            now={now}
            theme={theme}
            themeMode={mode}
            onToggleTheme={toggle}
            onSetThemeMode={setMode}
            alerts={alerts}
            onDismissAlert={dismiss}
          />
        }
      >
        <Route path="/" element={<TodayPage now={now} {...taskApi} />} />
        <Route
          path="/tasks"
          element={<TaskPage filter="all" now={now} {...taskApi} />}
        />
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
      </Route>
    </Routes>
  );
}
