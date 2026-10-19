import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ReminderToast } from "../components/ReminderToast/ReminderToast";
import { Sidebar } from "../components/Sidebar/Sidebar";
import { StatsPanel } from "../components/StatsPanel/StatsPanel";
import { Topbar } from "../components/Topbar/Topbar";
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
 * Layout:
 * - Taskbar (Topbar) cố định trên cùng: menu điều hướng, nút thông báo,
 *   nút "Thống kê" (mở modal bar chart) và nút sáng/tối.
 * - Dưới đó là 2 cột: sidebar danh sách nhanh việc hôm nay + nội dung trang (<Outlet/>).
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
  const [statsOpen, setStatsOpen] = useState(false);

  return (
    <div className="layout">
      <Topbar
        theme={theme}
        themeMode={themeMode}
        onToggleTheme={onToggleTheme}
        onSetThemeMode={onSetThemeMode}
        onOpenStats={() => setStatsOpen(true)}
      />

      <div className="layout__body">
        <Sidebar tasks={tasks} now={now} />
        <div className="layout__main">
          <ReminderToast alerts={alerts} dismiss={onDismissAlert} />
          <Outlet />
        </div>
      </div>

      <StatsPanel
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
        tasks={tasks}
        now={now}
      />
    </div>
  );
}
