import { NavLink } from "react-router-dom";
import type { Theme, ThemeMode } from "../../hooks/useTheme";
import { NotificationButton } from "../NotificationButton/NotificationButton";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import "./Topbar.css";

interface TopbarProps {
  theme: Theme;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  onSetThemeMode: (mode: ThemeMode) => void;
  onOpenStats: () => void;
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
 * Taskbar trên cùng (full-width): brand, menu điều hướng,
 * cờ bật thông báo, nút "Thống kê" (mở modal bar chart) và nút sáng/tối.
 */
export function Topbar({
  theme,
  themeMode,
  onToggleTheme,
  onSetThemeMode,
  onOpenStats,
}: TopbarProps) {
  return (
    <header className="topbar">
      <NavLink to="/" className="topbar__brand" end>
        <svg
          className="topbar__logo"
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
      </NavLink>

      <nav className="topbar__nav" aria-label="Menu chính">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="topbar__link"
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="topbar__actions">
        <span className="topbar__notify">
          <NotificationButton />
        </span>
        <button
          type="button"
          className="topbar__stats"
          onClick={onOpenStats}
          title="Thống kê việc đã làm / chưa làm theo ngày, tuần, tháng"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="4" y1="20" x2="20" y2="20" />
              <line x1="7" y1="20" x2="7" y2="13" />
              <line x1="12" y1="20" x2="12" y2="8" />
              <line x1="17" y1="20" x2="17" y2="4" />
            </g>
          </svg>
          Thống kê
        </button>
        <ThemeToggle
          theme={theme}
          mode={themeMode}
          onToggle={onToggleTheme}
          onSetMode={onSetThemeMode}
        />
      </div>
    </header>
  );
}
