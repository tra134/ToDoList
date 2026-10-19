import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { REMINDER_OPTIONS } from "../../constants/config";
import { DeadlinePicker } from "./DeadlinePicker";

describe("DeadlinePicker", () => {
  it("chọn ngày giờ -> onChange nhận đúng timestamp UTC", () => {
    const onChange = vi.fn();
    render(<DeadlinePicker value={null} remindBeforeMin={0} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("Hạn hoàn thành"), {
      target: { value: "2026-10-25T14:00" },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(Date.UTC(2026, 9, 25, 7, 0), 0);
  });

  it("xoá giá trị -> onChange nhận null", () => {
    const onChange = vi.fn();
    render(
      <DeadlinePicker
        value={Date.UTC(2026, 9, 25, 7, 0)}
        remindBeforeMin={0}
        onChange={onChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Hạn hoàn thành"), {
      target: { value: "" },
    });

    expect(onChange).toHaveBeenLastCalledWith(null, 0);
  });

  it("hiện giá trị hiện tại dưới dạng input (giờ địa phương)", () => {
    render(
      <DeadlinePicker
        value={Date.UTC(2026, 9, 25, 7, 0)}
        remindBeforeMin={0}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Hạn hoàn thành")).toHaveValue("2026-10-25T14:00");
  });

  it("hiện nhãn múi giờ của trình duyệt", () => {
    render(<DeadlinePicker value={null} remindBeforeMin={0} onChange={vi.fn()} />);

    expect(screen.getByText(/Asia\/(Ho_Chi_Minh|Saigon) · GMT/)).toBeInTheDocument();
  });

  it("<select> có đủ lựa chọn nhắc trước", () => {
    render(<DeadlinePicker value={null} remindBeforeMin={0} onChange={vi.fn()} />);

    expect(screen.getAllByRole("option")).toHaveLength(REMINDER_OPTIONS.length);
    expect(screen.getByRole("option", { name: "Không nhắc" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "1 giờ" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "1 ngày" })).toBeInTheDocument();
  });

  it("chọn '1 giờ' -> onChange nhận remindBeforeMin = 60, giữ nguyên deadline", async () => {
    const onChange = vi.fn();
    const dueAt = Date.UTC(2026, 9, 25, 7, 0);
    const user = userEvent.setup();
    render(
      <DeadlinePicker value={dueAt} remindBeforeMin={0} onChange={onChange} />,
    );

    await user.selectOptions(screen.getByLabelText("Nhắc trước"), "60");

    expect(onChange).toHaveBeenLastCalledWith(dueAt, 60);
  });
});
