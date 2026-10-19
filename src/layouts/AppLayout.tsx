import { Outlet } from "react-router-dom";
import { ReminderToast } from "../components/ReminderToast/ReminderToast";
import { Sidebar } from "../components/Sidebar/Sidebar";
import type { Theme, ThemeMode } from "../hooks/useTheme";
import type { ReminderAlert, Task } from "../types/task";
import "./AppLayout.css";

interface AppLayoutProps {
  tasks: Task[];
  now: number;
  theme: Theme;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  onSetThemeMode: (mode: ThemeMode) => void;
  alerts: ReminderAlert[];
  onDismissAlert: (taskId: string) => void;
}

/**
 * Layout 2 cột: sidebar cố định bên trái (thống kê + menu + nút sáng tối),
 * nội dung trang bên phải. Dùng <Outlet/> cho từng route con.
 */
export function AppLayout({
  tasks,
  now,
  theme,
  themeMode,
  onToggleTheme,
  onSetThemeMode,
  alerts,
  onDismissAlert,
}: AppLayoutProps) {
  return (
    <div className="layout">
      <Sidebar
        tasks={tasks}
        now={now}
        theme={theme}
        themeMode={themeMode}
        onToggleTheme={onToggleTheme}
        onSetThemeMode={onSetThemeMode}
      />
      <div className="layout__main">
        <ReminderToast alerts={alerts} dismiss={onDismissAlert} />
        <Outlet />
      </div>
    </div>
  );
}
