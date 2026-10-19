import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithRouter } from "../../test/renderWithRouter";
import { Topbar } from "./Topbar";

describe("Topbar (taskbar trên cùng)", () => {
  const setup = (onOpenStats = vi.fn()) => {
    renderWithRouter(
      <Topbar
        theme="light"
        themeMode="auto"
        onToggleTheme={() => {}}
        onSetThemeMode={() => {}}
        onOpenStats={onOpenStats}
      />,
    );
    return onOpenStats;
  };

  it("đủ 5 link menu với href đúng", () => {
    setup();

    const nav = screen.getByRole("navigation", { name: "Menu chính" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Hôm nay" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Tất cả task" })).toHaveAttribute("href", "/tasks");
    expect(screen.getByRole("link", { name: "Đang làm" })).toHaveAttribute("href", "/active");
    expect(screen.getByRole("link", { name: "Đã xong" })).toHaveAttribute("href", "/completed");
    expect(screen.getByRole("link", { name: "Quá hạn" })).toHaveAttribute("href", "/overdue");
  });

  it("route hiện tại có class active", () => {
    renderWithRouter(
      <Topbar
        theme="light"
        themeMode="auto"
        onToggleTheme={() => {}}
        onSetThemeMode={() => {}}
        onOpenStats={() => {}}
      />,
      "/active",
    );

    expect(screen.getByRole("link", { name: "Đang làm" })).toHaveClass("active");
    expect(screen.getByRole("link", { name: "Hôm nay" })).not.toHaveClass("active");
  });

  it("nút Thống kê gọi onOpenStats khi bấm", async () => {
    const user = userEvent.setup();
    const onOpenStats = setup();

    await user.click(screen.getByRole("button", { name: "Thống kê" }));

    expect(onOpenStats).toHaveBeenCalledTimes(1);
  });

  it("có brand + nút sáng/tối", () => {
    setup();

    expect(screen.getByRole("link", { name: /ToDoList/ })).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("button", { name: "Chuyển sang giao diện tối" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tự đổi giao diện theo giờ" })).toBeInTheDocument();
  });
});
