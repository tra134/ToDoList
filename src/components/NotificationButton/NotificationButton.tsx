import { useState } from "react";
import { getPermission, requestPermission } from "../../utils/notify";
import "./NotificationButton.css";

/**
 * Nút "Bật thông báo" — trình duyệt chỉ cấp quyền khi user BẤM,
 * nên không xin quyền lúc tải trang.
 */
export function NotificationButton() {
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >(() => getPermission());

  if (permission === "unsupported") return null;

  if (permission === "default") {
    return (
      <button
        type="button"
        className="notify-button"
        onClick={() => {
          void requestPermission().then(setPermission);
        }}
      >
        Bật thông báo
      </button>
    );
  }

  if (permission === "denied") {
    return (
      <p className="notify-hint">
        Thông báo hệ thống đang bị chặn, vẫn nhắc trong app
      </p>
    );
  }

  return <p className="notify-hint notify-hint--ok">Đã bật thông báo hệ thống</p>;
}
