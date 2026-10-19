import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { renderWithRouter } from "../../test/renderWithRouter";
import { Sidebar } from "./Sidebar";

beforeEach(() => {
  window.localStorage.clear();
});

describe("Sidebar", () => {
  const setup = () =>
    renderWithRouter(
      <Sidebar
        tasks={[]}
        now={Date.now()}
        theme="light"
        themeMode="auto"
        onToggleTheme={() => {}}
        onSetThemeMode={() => {}}
      />,
    );

  it("đủ 5 link menu với href đúng", () => {
    setup();

    const nav = screen.getByRole("navigation", { name: "Menu chính" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Hôm nay" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Tất cả task" })).toHaveAttribute(
      "href",
      "/tasks",
    );
    expect(screen.getByRole("link", { name: "Đang làm" })).toHaveAttribute(
      "href",
      "/active",
    );
    expect(screen.getByRole("link", { name: "Đã xong" })).toHaveAttribute(
      "href",
      "/completed",
    );
    expect(screen.getByRole("link", { name: "Quá hạn" })).toHaveAttribute(
      "href",
      "/overdue",
    );
  });

  it("route hiện tại có class active", () => {
    renderWithRouter(
      <Sidebar
        tasks={[]}
        now={Date.now()}
        theme="light"
        themeMode="auto"
        onToggleTheme={() => {}}
        onSetThemeMode={() => {}}
      />,
      "/active",
    );

    expect(screen.getByRole("link", { name: "Đang làm" })).toHaveClass("active");
    expect(screen.getByRole("link", { name: "Hôm nay" })).not.toHaveClass("active");
  });

  it("có khối thống kê (donut) và nút sáng/tối ở góc phải trên", () => {
    setup();

    expect(screen.getByLabelText("Thống kê công việc")).toBeInTheDocument();
    expect(document.querySelector(".donut")).toBeInTheDocument();
    expect(screen.getByText("Hoàn thành 7 ngày qua")).toBeInTheDocument();

    // Nút theme nằm trong dòng đầu của sidebar (góc phải trên cùng)
    const head = document.querySelector(".sidebar__head");
    expect(head).not.toBeNull();
    expect(head?.querySelector(".theme-toggle")).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Chuyển sang giao diện tối" }),
    ).toBeInTheDocument();
  });
});
