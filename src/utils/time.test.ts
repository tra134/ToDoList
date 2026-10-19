import { describe, expect, it } from "vitest";
import { makeTask } from "../test/factories";
import {
  formatDeadline,
  formatTimeLeft,
  fromInputValue,
  getTimeZoneLabel,
  getUserTimeZone,
  isDueSoon,
  isOverdue,
  toInputValue,
} from "./time";

describe("getUserTimeZone", () => {
  it("trả về IANA timezone do globalSetup (TZ=Asia/Ho_Chi_Minh) cấu hình", () => {
    // Node có thể trả tên chuẩn "Asia/Ho_Chi_Minh" hoặc tên cũ "Asia/Saigon".
    expect(["Asia/Ho_Chi_Minh", "Asia/Saigon"]).toContain(getUserTimeZone());
    // Quan trọng hơn: offset phải là UTC+7 (chứng tỏ TZ đã được ép).
    expect(new Date("2026-06-01T00:00:00Z").getTimezoneOffset()).toBe(-420);
  });
});

describe("getTimeZoneLabel", () => {
  it("có dạng '<timezone> · GMT+…'", () => {
    const label = getTimeZoneLabel();
    expect(label).toContain(getUserTimeZone());
    expect(label).toContain("GMT");
    expect(label).toContain("·");
  });
});

describe("fromInputValue", () => {
  it("chuyển '2026-10-25T14:00' (giờ địa phương UTC+7) thành timestamp", () => {
    expect(fromInputValue("2026-10-25T14:00")).toBe(Date.UTC(2026, 9, 25, 7, 0));
  });

  it('chuỗi rỗng -> null', () => {
    expect(fromInputValue("")).toBeNull();
  });

  it("giá trị không hợp lệ -> null, không throw", () => {
    expect(fromInputValue("không phải ngày")).toBeNull();
  });
});

describe("toInputValue", () => {
  it("null -> chuỗi rỗng", () => {
    expect(toInputValue(null)).toBe("");
  });

  it("round-trip: toInputValue(fromInputValue(x)) === x", () => {
    const value = "2026-10-25T14:00";
    expect(toInputValue(fromInputValue(value))).toBe(value);
  });

  it("hiển thị theo giờ địa phương, không phải UTC", () => {
    // 14:00 UTC+7 = 07:00 UTC — input phải là 14:00.
    expect(toInputValue(Date.UTC(2026, 9, 25, 7, 0))).toBe("2026-10-25T14:00");
  });
});

describe("formatDeadline", () => {
  it("hiển thị đúng giờ địa phương (chứa '14:00')", () => {
    const text = formatDeadline(Date.UTC(2026, 9, 25, 7, 0));
    expect(text).toContain("14:00");
  });
});

describe("isOverdue", () => {
  const now = Date.UTC(2026, 9, 25, 7, 0);

  it("đã quá hạn và chưa xong -> true", () => {
    expect(isOverdue(makeTask({ dueAt: now - 1_000 }), now)).toBe(true);
  });

  it("đã xong -> false", () => {
    expect(isOverdue(makeTask({ dueAt: now - 1_000, completed: true }), now)).toBe(false);
  });

  it("không có deadline -> false", () => {
    expect(isOverdue(makeTask({ dueAt: null }), now)).toBe(false);
  });

  it("còn hạn -> false", () => {
    expect(isOverdue(makeTask({ dueAt: now + 1_000 }), now)).toBe(false);
  });
});

describe("isDueSoon", () => {
  const now = Date.UTC(2026, 9, 25, 7, 0);

  it("còn 2 giờ -> true", () => {
    expect(isDueSoon(makeTask({ dueAt: now + 2 * 3_600_000 }), now)).toBe(true);
  });

  it("còn 3 ngày -> false", () => {
    expect(isDueSoon(makeTask({ dueAt: now + 3 * 86_400_000 }), now)).toBe(false);
  });

  it("đã quá hạn -> false", () => {
    expect(isDueSoon(makeTask({ dueAt: now - 60_000 }), now)).toBe(false);
  });

  it("không có deadline -> false", () => {
    expect(isDueSoon(makeTask({ dueAt: null }), now)).toBe(false);
  });
});

describe("formatTimeLeft", () => {
  const now = Date.UTC(2026, 9, 25, 7, 0);

  it("tương lai -> 'còn …'", () => {
    expect(formatTimeLeft(now + 3 * 3_600_000, now)).toBe("còn 3 giờ");
    expect(formatTimeLeft(now + 45 * 60_000, now)).toBe("còn 45 phút");
  });

  it("quá khứ -> 'quá hạn …'", () => {
    expect(formatTimeLeft(now - 2 * 86_400_000, now)).toBe("quá hạn 2 ngày");
    expect(formatTimeLeft(now - 90 * 60_000, now)).toBe("quá hạn 2 giờ");
  });
});
