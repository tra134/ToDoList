import { describe, expect, it } from "vitest";
import { makeTask } from "../test/factories";
import { computeStats } from "./stats";

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
