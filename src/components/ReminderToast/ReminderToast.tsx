import type { ReminderAlert } from "../../types/task";
import "./ReminderToast.css";

interface ReminderToastProps {
  alerts: ReminderAlert[];
  dismiss: (taskId: string) => void;
}

/**
 * Banner nhắc trong app — luôn hiện, kể cả khi người dùng chặn
 * thông báo hệ thống hoặc trình duyệt không hỗ trợ.
 */
export function ReminderToast({ alerts, dismiss }: ReminderToastProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="toast-list" role="status" aria-live="polite">
      {alerts.map((alert) => (
        <div
          key={alert.taskId}
          className={`toast${alert.overdue ? " toast--overdue" : " toast--soon"}`}
        >
          <div className="toast__body">
            <strong className="toast__title">{alert.title}</strong>
            <span className="toast__text">
              {alert.overdue ? "Đã quá hạn" : "Sắp tới hạn"}
            </span>
          </div>
          <button
            type="button"
            className="toast__close"
            aria-label={`Đóng nhắc ${alert.title}`}
            onClick={() => dismiss(alert.taskId)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
