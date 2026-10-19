import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";
import { renderWithRouter } from "./test/renderWithRouter";

beforeEach(() => {
  window.localStorage.clear();
});

describe("App routing", () => {
  it("URL không tồn tại (/abc) -> trang 404", () => {
    renderWithRouter(<App />, "/abc");

    expect(screen.getByText(/404/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Về trang danh sách task/ }),
    ).toBeInTheDocument();
    // Trang 404 không có form thêm task
    expect(document.querySelector(".task-form")).toBeNull();
  });

  it("link ở 404 trỏ về trang chủ", () => {
    renderWithRouter(<App />, "/khong-ton-tai");

    expect(screen.getByRole("link", { name: /Về trang danh sách task/ })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("/overdue render được TaskPage (form + filter nav + footer)", () => {
    renderWithRouter(<App />, "/overdue");

    expect(document.querySelector(".task-form")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Bộ lọc task" })).toBeInTheDocument();
    expect(screen.getByText(/task còn lại/)).toBeInTheDocument();
  });

  it("/active và /completed render được", () => {
    const first = renderWithRouter(<App />, "/active");
    expect(document.querySelector(".task-form")).toBeInTheDocument();
    first.unmount();

    renderWithRouter(<App />, "/completed");
    expect(document.querySelector(".task-form")).toBeInTheDocument();
  });
});
