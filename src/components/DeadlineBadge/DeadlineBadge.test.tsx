import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { makeTask } from "../../test/factories";
import { DeadlineBadge } from "./DeadlineBadge";

const NOW = Date.UTC(2026, 9, 25, 7, 0); // 14:00 UTC+7

describe("DeadlineBadge", () => {
  it("quá hạn, chưa xong -> class đỏ (overdue)", () => {
    const { container } = render(
      <DeadlineBadge task={makeTask({ dueAt: NOW - 60_000 })} now={NOW} />,
    );

    const badge = container.querySelector(".deadline-badge");
    expect(badge).toHaveClass("deadline-badge--overdue");
    expect(badge).not.toHaveClass("deadline-badge--soon");
  });

  it("còn < 24h -> class vàng (soon)", () => {
    const { container } = render(
      <DeadlineBadge task={makeTask({ dueAt: NOW + 2 * 3_600_000 })} now={NOW} />,
    );

    expect(container.querySelector(".deadline-badge")).toHaveClass(
      "deadline-badge--soon",
    );
  });

  it("còn > 24h -> class xám (normal)", () => {
    const { container } = render(
      <DeadlineBadge task={makeTask({ dueAt: NOW + 10 * 86_400_000 })} now={NOW} />,
    );

    const badge = container.querySelector(".deadline-badge");
    expect(badge).toHaveClass("deadline-badge--normal");
    expect(badge).not.toHaveClass("deadline-badge--overdue");
    expect(badge).not.toHaveClass("deadline-badge--soon");
  });

  it("task đã hoàn thành -> không đỏ dù đã quá hạn", () => {
    const { container } = render(
      <DeadlineBadge
        task={makeTask({ dueAt: NOW - 3_600_000, completed: true })}
        now={NOW}
      />,
    );

    const badge = container.querySelector(".deadline-badge");
    expect(badge).toHaveClass("deadline-badge--normal");
    expect(badge).not.toHaveClass("deadline-badge--overdue");
  });

  it("không có deadline -> không render gì", () => {
    const { container } = render(
      <DeadlineBadge task={makeTask({ dueAt: null })} now={NOW} />,
    );

    expect(container.querySelector(".deadline-badge")).toBeNull();
  });

  it("hiện giờ hạn + thời gian còn lại", () => {
    render(
      <DeadlineBadge task={makeTask({ dueAt: NOW + 3 * 3_600_000 })} now={NOW} />,
    );

    // NOW = 14:00 UTC+7, hạn +3 giờ -> 17:00 giờ địa phương
    expect(screen.getByText(/17:00/)).toBeInTheDocument();
    expect(screen.getByText("còn 3 giờ")).toBeInTheDocument();
  });

  it("task quá hạn hiện 'quá hạn …'", () => {
    render(<DeadlineBadge task={makeTask({ dueAt: NOW - 86_400_000 })} now={NOW} />);

    expect(screen.getByText("quá hạn 1 ngày")).toBeInTheDocument();
  });
});
