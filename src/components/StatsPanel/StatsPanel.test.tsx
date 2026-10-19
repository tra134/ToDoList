import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { makeTask } from "../../test/factories";
import { renderWithRouter } from "../../test/renderWithRouter";
import { StatsPanel } from "./StatsPanel";

describe("StatsPanel (modal thống kê)", () => {
  const tasks = [
    makeTask({ id: "x1", title: "Đã xong", completed: true, completedAt: Date.now() - 60_000 }),
    makeTask({ id: "t1", title: "Còn nợ", dueAt: Date.now() + 3_600_000 }),
  ];

  it("open=false -> không render gì", () => {
    renderWithRouter(
      <StatsPanel open={false} onClose={() => {}} tasks={tasks} now={Date.now()} />,
    );

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("open=true -> dialog với bar chart theo kỳ + 7 ngày + 4 tuần + donut", () => {
    renderWithRouter(
      <StatsPanel open onClose={() => {}} tasks={tasks} now={Date.now()} />,
    );

    const dialog = screen.getByRole("dialog", { name: "Thống kê công việc" });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Làm được và chưa làm được theo kỳ")).toBeInTheDocument();
    expect(screen.getByText("Việc xong 7 ngày qua")).toBeInTheDocument();
    expect(screen.getByText("Việc xong 4 tuần qua")).toBeInTheDocument();
    // 3 bar chart (kỳ + 7 ngày + 4 tuần) + 1 donut
    expect(document.querySelectorAll(".bar-chart")).toHaveLength(3);
    expect(document.querySelector(".donut")).not.toBeNull();
    // Chart nhóm có 3 kỳ: Hôm nay / Tuần này / Tháng này
    expect(
      document.querySelector(".bar-chart")?.getAttribute("aria-label"),
    ).toContain("Hôm nay:");
    expect(
      document.querySelector(".bar-chart")?.getAttribute("aria-label"),
    ).toContain("Tháng này:");
  });

  it("bấm nút đóng -> gọi onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithRouter(<StatsPanel open onClose={onClose} tasks={tasks} now={Date.now()} />);

    await user.click(screen.getByRole("button", { name: "Đóng thống kê" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("nhấn Escape -> gọi onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithRouter(<StatsPanel open onClose={onClose} tasks={tasks} now={Date.now()} />);

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("bấm nền tối -> đóng, bấm trong modal thì không", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithRouter(<StatsPanel open onClose={onClose} tasks={tasks} now={Date.now()} />);

    await user.click(screen.getByRole("heading", { name: "Thống kê công việc" }));
    expect(onClose).not.toHaveBeenCalled();

    await user.click(document.querySelector(".stats-panel__backdrop")!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
