import { describe, expect, it } from "vitest";
import { makeTask } from "../test/factories";
import { filterTasks } from "./filterTasks";

const now = Date.UTC(2026, 9, 25, 7, 0);

const active = makeTask({ id: "active", title: "Đang làm" });
const done = makeTask({ id: "done", title: "Đã xong", completed: true });
const overdue = makeTask({ id: "overdue", title: "Quá hạn", dueAt: now - 60_000 });
const overdueDone = makeTask({
  id: "overdue-done",
  title: "Quá hạn nhưng đã xong",
  dueAt: now - 60_000,
  completed: true,
});
const all = [active, done, overdue, overdueDone];

describe("filterTasks", () => {
  it("all -> trả về toàn bộ", () => {
    expect(filterTasks(all, "all", now)).toEqual(all);
  });

  it("active -> chỉ task chưa xong", () => {
    expect(filterTasks(all, "active", now).map((t) => t.id)).toEqual([
      "active",
      "overdue",
    ]);
  });

  it("completed -> chỉ task đã xong", () => {
    expect(filterTasks(all, "completed", now).map((t) => t.id)).toEqual([
      "done",
      "overdue-done",
    ]);
  });

  it("overdue -> chỉ task quá hạn và chưa xong", () => {
    expect(filterTasks(all, "overdue", now).map((t) => t.id)).toEqual(["overdue"]);
  });

  it("overdue loại task đã xong và task không có deadline", () => {
    const result = filterTasks(all, "overdue", now);
    expect(result).not.toContain(done);
    expect(result).not.toContain(overdueDone);
    expect(result).not.toContain(active); // không có deadline
  });

  it("danh sách rỗng -> rỗng", () => {
    expect(filterTasks([], "all", now)).toEqual([]);
    expect(filterTasks([], "overdue", now)).toEqual([]);
  });
});
