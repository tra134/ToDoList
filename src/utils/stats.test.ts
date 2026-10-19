import { describe, expect, it } from "vitest";
import { makeTask } from "../test/factories";
import { addDays, startOfDay, startOfMonth, startOfWeek } from "./time";
import { computePeriodStats, computeStats } from "./stats";

const DAY_MS = 86_400_000;

describe("computeStats", () => {
  it("danh sách rỗng -> số liệu bằng 0", () => {
    const s = computeStats([], Date.now());

    expect(s).toMatchObject({
      total: 0,
      completed: 0,
      doing: 0,
      overdue: 0,
      progress: 0,
      doneToday: 0,
      doneThisMonth: 0,
    });
    expect(s.linePoints).toHaveLength(7);
  });

  it("phân loại completed / doing / overdue + tiến độ %", () => {
    const now = Date.now();
    const tasks = [
      makeTask({ title: "xong", completed: true, completedAt: now }),
      makeTask({ title: "dang lam", dueAt: now + 3_600_000 }),
      makeTask({ title: "qua han", dueAt: now - 3_600_000 }),
      makeTask({ title: "khong han", dueAt: null }),
    ];

    const s = computeStats(tasks, now);

    expect(s.total).toBe(4);
    expect(s.completed).toBe(1);
    expect(s.overdue).toBe(1);
    expect(s.doing).toBe(2); // dang lam + khong han
    expect(s.progress).toBe(25);
  });

  it("doneToday / doneThisMonth đếm theo completedAt", () => {
    const now = Date.now();
    const tasks = [
      makeTask({ title: "hom nay", completed: true, completedAt: now - 60_000 }),
      makeTask({
        title: "cung thang",
        completed: true,
        completedAt: now - 5 * DAY_MS,
      }),
      makeTask({ title: "thang truoc", completed: true, completedAt: now - 40 * DAY_MS }),
    ];

    const s = computeStats(tasks, now);

    expect(s.doneToday).toBe(1);
    expect(s.doneThisMonth).toBe(2); // 40 ngày trước có thể thuộc tháng khác
    expect(s.completed).toBe(3);
  });

  it("linePoints: 7 ngày, ngày cuối là hôm nay với số việc xong hôm nay", () => {
    const now = Date.now();
    const todayCount = 2;
    const tasks = [
      makeTask({ title: "a", completed: true, completedAt: now - 60_000 }),
      makeTask({ title: "b", completed: true, completedAt: now - 120_000 }),
      makeTask({
        title: "c",
        completed: true,
        completedAt: now - 3 * DAY_MS,
      }),
    ];

    const s = computeStats(tasks, now);

    expect(s.linePoints).toHaveLength(7);
    expect(s.linePoints[6].value).toBe(todayCount);
    expect(s.linePoints[3].value).toBe(1); // 3 ngày trước
    expect(s.linePoints[0].value).toBe(0); // 6 ngày trước
  });
});

describe("weeklyPoints", () => {
  it("4 tuần, tuần cuối là tuần hiện tại, loại tuần > 4 khỏi", () => {
    const now = Date.now();
    const weekStart = startOfWeek(now);
    const tasks = [
      makeTask({ title: "tuan truoc", completed: true, completedAt: addDays(weekStart, -7) + 3_600_000 }),
      makeTask({ title: "tuan nay", completed: true, completedAt: now - 60_000 }),
      makeTask({ title: "cach 3 tuan", completed: true, completedAt: addDays(weekStart, -21) + 3_600_000 }),
      makeTask({ title: "cach 5 tuan", completed: true, completedAt: addDays(weekStart, -35) + 3_600_000 }),
    ];

    const s = computeStats(tasks, now);

    expect(s.weeklyPoints).toHaveLength(4);
    expect(s.weeklyPoints[3].value).toBe(1); // tuần này
    expect(s.weeklyPoints[2].value).toBe(1); // tuần trước
    expect(s.weeklyPoints[1].value).toBe(0);
    expect(s.weeklyPoints[0].value).toBe(1); // cách 3 tuần
  });
});

describe("computePeriodStats", () => {
  it("rỗng -> mọi kỳ đều 0", () => {
    const periods = computePeriodStats([], Date.now());

    expect(periods.map((p) => p.label)).toEqual(["Hôm nay", "Tuần này", "Tháng này"]);
    for (const p of periods) {
      expect(p.done).toBe(0);
      expect(p.pending).toBe(0);
    }
  });

  it("done tính theo completedAt, pending = có hạn trong kỳ nhưng chưa xong", () => {
    // Thứ 4, 14/10/2026 12:00 giờ địa phương — giữa tháng/tuần nên ổn định.
    const now = new Date(2026, 9, 14, 12, 0).getTime();
    const tasks = [
      makeTask({ title: "xong hom nay", completed: true, completedAt: now - 3_600_000 }),
      makeTask({ title: "xong 9 ngay truoc", completed: true, completedAt: addDays(now, -9) }),
      makeTask({ title: "het han hom nay", dueAt: now + 3_600_000 }),
      makeTask({ title: "khong han", dueAt: null }),
      makeTask({ title: "het han thang sau", dueAt: addDays(startOfMonth(now), 45) }),
    ];

    const periods = computePeriodStats(tasks, now);
    const [today, week, month] = periods;

    expect(today.done).toBe(1);
    expect(today.pending).toBe(1);
    expect(week.done).toBe(1); // task xong hôm nay nằm trong tuần
    expect(week.pending).toBe(1);
    expect(month.done).toBe(2); // task xong 9 ngày trước vẫn trong tháng 10
    expect(month.pending).toBe(1);
  });

  it("task quá hạn (hạn đã qua trong kỳ) vẫn tính là pending", () => {
    const now = Date.now();
    const tasks = [
      makeTask({ title: "qua han hom nay", dueAt: startOfDay(now) + 3_600_000 }),
    ];

    const [today] = computePeriodStats(tasks, now);

    expect(today.pending).toBe(1);
  });
});
