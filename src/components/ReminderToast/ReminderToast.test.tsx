import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReminderToast } from "./ReminderToast";

const ALERTS = [
  { taskId: "t1", title: "Task A", overdue: false },
  { taskId: "t2", title: "Task B", overdue: true },
];

describe("ReminderToast", () => {
  it("render đủ các alert", () => {
    render(<ReminderToast alerts={ALERTS} dismiss={vi.fn()} />);

    expect(screen.getByText("Task A")).toBeInTheDocument();
    expect(screen.getByText("Task B")).toBeInTheDocument();
    expect(screen.getByText("Sắp tới hạn")).toBeInTheDocument();
    expect(screen.getByText("Đã quá hạn")).toBeInTheDocument();
  });

  it("bấm đóng -> dismiss(taskId)", async () => {
    const dismiss = vi.fn();
    const user = userEvent.setup();
    render(<ReminderToast alerts={ALERTS} dismiss={dismiss} />);

    await user.click(screen.getByRole("button", { name: "Đóng nhắc Task B" }));

    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(dismiss).toHaveBeenCalledWith("t2");
  });

  it("alert quá hạn có class đỏ, alert sắp tới hạn thì không", () => {
    render(<ReminderToast alerts={ALERTS} dismiss={vi.fn()} />);

    const overdueToast = screen.getByText("Task B").closest(".toast");
    const soonToast = screen.getByText("Task A").closest(".toast");

    expect(overdueToast).toHaveClass("toast--overdue");
    expect(soonToast).toHaveClass("toast--soon");
    expect(soonToast).not.toHaveClass("toast--overdue");
  });

  it("không có alert -> không render gì", () => {
    const { container } = render(<ReminderToast alerts={[]} dismiss={vi.fn()} />);

    expect(container.querySelector(".toast-list")).toBeNull();
  });
});
