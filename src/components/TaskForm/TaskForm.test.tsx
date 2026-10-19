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
    expect(onAdd).toHaveBeenLastCalledWith("Mua sữa", null, 0, "none", "");
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
    expect(onAdd).toHaveBeenLastCalledWith("Task bấm nút", null, 0, "none", "");
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
      "none",
      "",
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
      "none",
      "",
    );
  });

  it("chọn màu 'Cần làm gấp' -> onAdd nhận color = 'red'", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<TaskForm onAdd={onAdd} />);

    await user.click(screen.getByRole("button", { name: "Cần làm gấp" }));
    await user.type(screen.getByLabelText("Thêm task mới"), "Khẩn cấp{Enter}");

    expect(onAdd).toHaveBeenLastCalledWith("Khẩn cấp", null, 0, "red", "");
  });

  it("nhập ghi chú -> onAdd nhận note; thêm xong thì reset màu + ghi chú", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<TaskForm onAdd={onAdd} />);

    await user.click(screen.getByRole("button", { name: "Ý tưởng" }));
    await user.type(screen.getByLabelText("Ghi chú"), "Ý tưởng hay ho");
    await user.type(screen.getByLabelText("Thêm task mới"), "Sản phẩm mới{Enter}");

    expect(onAdd).toHaveBeenLastCalledWith(
      "Sản phẩm mới",
      null,
      0,
      "purple",
      "Ý tưởng hay ho",
    );

    // Reset sau khi thêm
    expect(screen.getByLabelText("Ghi chú")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Không màu" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
