import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getPermission,
  isNotificationSupported,
  requestPermission,
  sendNotification,
} from "./notify";

interface CreatedNotification {
  title: string;
  body?: string;
}

/** Lớp giả lập Notification: constructor ghi lại, permission tĩnh. */
function makeFakeNotification(
  permission: NotificationPermission,
  requestResult: NotificationPermission = permission,
) {
  const created: CreatedNotification[] = [];
  const requestPermissionMock = vi.fn().mockResolvedValue(requestResult);

  class FakeNotification {
    static permission: NotificationPermission = permission;
    static requestPermission = requestPermissionMock;
    constructor(title: string, options?: NotificationOptions) {
      created.push({ title, body: options?.body });
    }
  }

  return { FakeNotification, created, requestPermissionMock };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("isNotificationSupported", () => {
  it("không có Notification -> false", async () => {
    vi.stubGlobal("Notification", undefined);
    expect(isNotificationSupported()).toBe(false);
    expect(getPermission()).toBe("unsupported");
    await expect(requestPermission()).resolves.toBe("unsupported");
  });

  it("có Notification -> true", () => {
    const { FakeNotification } = makeFakeNotification("default");
    vi.stubGlobal("Notification", FakeNotification);
    expect(isNotificationSupported()).toBe(true);
  });
});

describe("sendNotification", () => {
  it("không có Notification -> false, không throw", () => {
    vi.stubGlobal("Notification", undefined);
    expect(() => sendNotification("Tiêu đề", "Nội dung")).not.toThrow();
    expect(sendNotification("Tiêu đề", "Nội dung")).toBe(false);
  });

  it("quyền granted -> tạo Notification đúng title/body", () => {
    const { FakeNotification, created } = makeFakeNotification("granted");
    vi.stubGlobal("Notification", FakeNotification);

    expect(sendNotification("Nhắc việc", "Còn 5 phút")).toBe(true);
    expect(created).toEqual([{ title: "Nhắc việc", body: "Còn 5 phút" }]);
  });

  it("quyền denied -> trả false, không tạo Notification", () => {
    const { FakeNotification, created } = makeFakeNotification("denied");
    vi.stubGlobal("Notification", FakeNotification);

    expect(sendNotification("Nhắc việc", "Nội dung")).toBe(false);
    expect(created).toEqual([]);
  });
});

describe("requestPermission", () => {
  it("gọi Notification.requestPermission() và trả kết quả", async () => {
    const { FakeNotification, requestPermissionMock } = makeFakeNotification(
      "default",
      "granted",
    );
    vi.stubGlobal("Notification", FakeNotification);

    await expect(requestPermission()).resolves.toBe("granted");
    expect(requestPermissionMock).toHaveBeenCalledTimes(1);
  });

  it("hủy (reject) -> không throw, trả quyền hiện tại", async () => {
    const { FakeNotification, requestPermissionMock } = makeFakeNotification("denied");
    requestPermissionMock.mockRejectedValue(new Error("user closed prompt"));
    vi.stubGlobal("Notification", FakeNotification);

    await expect(requestPermission()).resolves.toBe("denied");
  });
});
