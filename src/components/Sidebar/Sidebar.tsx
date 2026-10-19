import { NavLink } from "react-router-dom";
import type { Task } from "../../types/task";
import { NotificationButton } from "../NotificationButton/NotificationButton";
import { SidebarStats } from "../SidebarStats/SidebarStats";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import type { Theme, ThemeMode } from "../../hooks/useTheme";
import "./Sidebar.css";

interface SidebarProps {
  tasks: Task[];
  now: number;
  theme: Theme;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  onSetThemeMode: (mode: ThemeMode) => void;
}

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Hôm nay", end: true },
  { to: "/tasks", label: "Tất cả task", end: true },
  { to: "/active", label: "Đang làm" },
  { to: "/completed", label: "Đã xong" },
  { to: "/overdue", label: "Quá hạn" },
];

/**
 * Sidebar cố định bên trái: góc phải trên cùng là nút sáng/tối,
 * dưới là khối thống kê, rồi menu chính và nút thông báo.
 */
export function Sidebar({
  tasks,
  now,
  theme,
  themeMode,
  onToggleTheme,
  onSetThemeMode,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__head">
        <h1 className="sidebar__brand">
          <svg
            className="sidebar__logo"
            width="22"
            height="22"
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
        <ThemeToggle
          theme={theme}
          mode={themeMode}
          onToggle={onToggleTheme}
          onSetMode={onSetThemeMode}
        />
      </div>

      <SidebarStats tasks={tasks} now={now} />

      <nav className="sidebar__nav" aria-label="Menu chính">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="sidebar__link"
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__notify">
        <NotificationButton />
      </div>
    </aside>
  );
}
