import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TaskForm } from "./TaskForm";

describe("TaskForm", () => {
  it("gõ tên + Enter -> gọi onAdd đúng 1 lần với title đã trim", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<TaskForm onAdd={onAdd} />);

    const input = screen.getByLabelText("Thêm task mới");
    await user.type(input, "  Mua sữa  {Enter}");

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenLastCalledWith("Mua sữa", null, 0);
    expect(input).toHaveValue(""); // reset sau khi thêm
  });

  it("title rỗng / toàn khoảng trắng -> không gọi onAdd", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<TaskForm onAdd={onAdd} />);

    await user.type(screen.getByLabelText("Thêm task mới"), "   {Enter}");

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("bấm nút 'Thêm' cũng thêm được task", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<TaskForm onAdd={onAdd} />);

    await user.type(screen.getByLabelText("Thêm task mới"), "Task bấm nút");
    await user.click(screen.getByRole("button", { name: "Thêm" }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenLastCalledWith("Task bấm nút", null, 0);
  });

  it("chọn deadline -> onAdd nhận đúng timestamp (giờ địa phương)", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<TaskForm onAdd={onAdd} />);

    fireEvent.change(screen.getByLabelText("Hạn hoàn thành"), {
      target: { value: "2026-11-05T09:30" },
    });
    await user.type(screen.getByLabelText("Thêm task mới"), "Họp team{Enter}");

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenLastCalledWith(
      "Họp team",
      Date.UTC(2026, 10, 5, 2, 30),
      0,
    );
  });

  it("chọn nhắc trước 30 phút -> onAdd nhận remindBeforeMin = 30", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<TaskForm onAdd={onAdd} />);

    fireEvent.change(screen.getByLabelText("Hạn hoàn thành"), {
      target: { value: "2026-11-05T09:30" },
    });
    await user.selectOptions(screen.getByLabelText("Nhắc trước"), "30");
    await user.type(screen.getByLabelText("Thêm task mới"), "Nhắc tôi{Enter}");

    expect(onAdd).toHaveBeenLastCalledWith(
      "Nhắc tôi",
      Date.UTC(2026, 10, 5, 2, 30),
      30,
    );
  });
});
