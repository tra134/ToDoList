/**
 * Bọc Notification API của trình duyệt.
 * Mọi hàm đều kiểm tra an toàn: Notification có thể không tồn tại
 * (jsdom, trình duyệt cũ, bị chặn...).
 *
 * Kiểm tra `"Notification" in window` theo plan, đồng thời thử cả
 * globalThis để hoạt động đúng trong môi trường test (jsdom).
 */

function getNotificationApi(): typeof Notification | null {
  if ("Notification" in globalThis && typeof globalThis.Notification === "function") {
    return globalThis.Notification;
  }
  if (
    typeof window !== "undefined" &&
    "Notification" in window &&
    typeof window.Notification === "function"
  ) {
    return window.Notification;
  }
  return null;
}

export function isNotificationSupported(): boolean {
  return getNotificationApi() !== null;
}

export function getPermission(): NotificationPermission | "unsupported" {
  const api = getNotificationApi();
  return api ? api.permission : "unsupported";
}

export async function requestPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  const api = getNotificationApi();
  if (!api) return "unsupported";
  try {
    return await api.requestPermission();
  } catch {
    return api.permission;
  }
}

/** Trả về false nếu không gửi được (không hỗ trợ / không được quyền). */
export function sendNotification(title: string, body: string): boolean {
  const api = getNotificationApi();
  if (!api) return false;
  if (api.permission !== "granted") return false;
  try {
    new api(title, { body });
    return true;
  } catch {
    return false;
  }
}
