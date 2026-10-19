import type { Theme, ThemeMode } from "../../hooks/useTheme";
import "./ThemeToggle.css";

interface ThemeToggleProps {
  theme: Theme;
  mode: ThemeMode;
  onToggle: () => void;
  onSetMode: (mode: ThemeMode) => void;
}

/** Icon mặt trời / mặt trăng đơn sắc (không dùng icon màu mè). */
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <line x1="12" y1="2.5" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="21.5" />
        <line x1="2.5" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="21.5" y2="12" />
        <line x1="5.3" y1="5.3" x2="7.1" y2="7.1" />
        <line x1="16.9" y1="16.9" x2="18.7" y2="18.7" />
        <line x1="5.3" y1="18.7" x2="7.1" y2="16.9" />
        <line x1="16.9" y1="7.1" x2="18.7" y2="5.3" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
      <path
        d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Bật/tắt giao diện sáng tối ở góc phải trên cùng của sidebar.
 * - Nút pill: nửa nắng nửa trăng, ô nào sáng lên = giao diện hiện tại.
 * - Nút "auto": trả về chế độ tự đổi theo giờ (18h–6h là tối).
 */
export function ThemeToggle({ theme, mode, onToggle, onSetMode }: ThemeToggleProps) {
  return (
    <div className="theme-toggle">
      <button
        type="button"
        className="theme-toggle__pill"
        onClick={onToggle}
        aria-pressed={theme === "dark"}
        aria-label={
          theme === "dark"
            ? "Chuyển sang giao diện sáng"
            : "Chuyển sang giao diện tối"
        }
        title={theme === "dark" ? "Chế độ sáng" : "Chế độ tối"}
      >
        <span
          className={`theme-toggle__opt${theme === "light" ? " theme-toggle__opt--on" : ""}`}
        >
          <SunIcon />
        </span>
        <span
          className={`theme-toggle__opt${theme === "dark" ? " theme-toggle__opt--on" : ""}`}
        >
          <MoonIcon />
        </span>
      </button>
      <button
        type="button"
        className={`theme-toggle__auto${mode === "auto" ? " theme-toggle__auto--on" : ""}`}
        aria-pressed={mode === "auto"}
        aria-label="Tự đổi giao diện theo giờ"
        title="Tự đổi theo múi giờ: 18h–6h là tối"
        onClick={() => onSetMode("auto")}
      >
        auto
      </button>
    </div>
  );
}
