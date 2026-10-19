import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { makeTask } from "../../test/factories";
import { toInputValue } from "../../utils/time";
import { TaskItem } from "./TaskItem";

const NOW = Date.UTC(2026, 9, 25, 7, 0);

function setup(taskOverrides: Partial<Parameters<typeof makeTask>[0]> = {}) {
  const task = makeTask(taskOverrides);
  const handlers = {
    onToggle: vi.fn(),
    onDelete: vi.fn(),
    onEdit: vi.fn(),
    onSetDeadline: vi.fn(),
  };
  const utils = render(
    <TaskItem
      task={task}
      now={NOW}
      onToggle={handlers.onToggle}
      onDelete={handlers.onDelete}
      onEdit={handlers.onEdit}
      onSetDeadline={handlers.onSetDeadline}
    />,
  );
  return { task, ...handlers, ...utils };
}

describe("TaskItem", () => {
  it("bấm checkbox -> onToggle(id)", async () => {
    const { task, onToggle } = setup({ title: "Đi chạy" });
    const user = userEvent.setup();

    await user.click(screen.getByRole("checkbox", { name: /Đi chạy/ }));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(task.id);
  });

  it("bấm 'Xoá' -> onDelete(id)", async () => {
    const { task, onDelete } = setup({ title: "Task cần xoá" });
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: "Xoá task Task cần xoá" }),
    );

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(task.id);
  });

  it("double-click -> sửa -> Enter -> onEdit(id, title mới)", async () => {
    const { task, onEdit } = setup({ title: "Task cũ" });
    const user = userEvent.setup();

    await user.dblClick(screen.getByText("Task cũ"));
    const input = screen.getByLabelText("Sửa tên task");
    await user.clear(input);
    await user.type(input, "Task mới{Enter}");

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(task.id, "Task mới");
    // Thoát khỏi chế độ sửa (title do props quyết định nên giữ nguyên "Task cũ")
    expect(screen.queryByLabelText("Sửa tên task")).toBeNull();
    expect(screen.getByText("Task cũ")).toBeInTheDocument();
  });

  it("Escape -> huỷ sửa, không gọi onEdit", async () => {
    const { onEdit } = setup({ title: "Task cũ" });
    const user = userEvent.setup();

    await user.dblClick(screen.getByText("Task cũ"));
    const input = screen.getByLabelText("Sửa tên task");
    await user.clear(input);
    await user.type(input, "Bị gõ nhầm");
    await user.keyboard("{Escape}");

    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.getByText("Task cũ")).toBeInTheDocument(); // title cũ giữ nguyên
  });

  it("sửa thành title rỗng -> không gọi onEdit", async () => {
    const { onEdit } = setup({ title: "Task cũ" });
    const user = userEvent.setup();

    await user.dblClick(screen.getByText("Task cũ"));
    await user.clear(screen.getByLabelText("Sửa tên task"));
    await user.keyboard("{Enter}");

    expect(onEdit).not.toHaveBeenCalled();
  });

  it("task có dueAt -> hiện DeadlineBadge", () => {
    const { container } = setup({ dueAt: NOW + 3_600_000 });

    expect(container.querySelector(".deadline-badge")).toBeInTheDocument();
    expect(screen.getByText("còn 1 giờ")).toBeInTheDocument();
  });

  it("task không có dueAt -> không hiện badge", () => {
    const { container } = setup({ dueAt: null });

    expect(container.querySelector(".deadline-badge")).toBeNull();
  });

  it("bấm 'Hạn' -> mở DeadlinePicker, đổi hạn gọi onSetDeadline(id, ts, min)", async () => {
    const { task, onSetDeadline } = setup({ title: "Có hạn" });
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Sửa hạn của Có hạn" }));
    expect(screen.getByLabelText("Hạn hoàn thành")).toBeInTheDocument();

    const next = NOW + 86_400_000;
    fireEvent.change(screen.getByLabelText("Hạn hoàn thành"), {
      target: { value: toInputValue(next) },
    });

    expect(onSetDeadline).toHaveBeenCalledTimes(1);
    expect(onSetDeadline).toHaveBeenCalledWith(task.id, next, task.remindBeforeMin);
  });
});
