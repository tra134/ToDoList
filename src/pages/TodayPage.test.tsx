import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { STORAGE_KEY } from "../constants/config";
import { makeTask } from "../test/factories";
import { renderWithRouter } from "../test/renderWithRouter";
import App from "../App";

beforeEach(() => {
  window.localStorage.clear();
});

const seed = (tasks: unknown[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

describe("TodayPage (trang chủ)", () => {
  it("chỉ hiện task quá hạn + đến hạn hôm nay + chưa xếp lịch", () => {
    seed([
      makeTask({ id: "o1", title: "Quá hạn", dueAt: Date.now() - 3_600_000 }),
      makeTask({ id: "t1", title: "Hôm nay", dueAt: Date.now() + 3_600_000 }),
      makeTask({ id: "n1", title: "Chưa xếp lịch", dueAt: null }),
      makeTask({
        id: "f1",
        title: "Ngày mai",
        dueAt: Date.now() + 48 * 3_600_000,
      }),
      makeTask({
        id: "d1",
        title: "Xong rồi",
        completed: true,
        completedAt: Date.now() - 2 * 86_400_000, // xong từ hôm trước
      }),
    ]);

    renderWithRouter(<App />, "/");

    // Scope trong trang chủ (sidebar cũng có link "Quá hạn", "Hôm nay").
    const page = document.querySelector(".today-page");
    expect(page).not.toBeNull();
    const scope = within(page as HTMLElement);
    expect(scope.getByText("Quá hạn")).toBeInTheDocument();
    expect(scope.getByText("Hôm nay")).toBeInTheDocument();
    expect(scope.getByText("Chưa xếp lịch")).toBeInTheDocument();
    // Task ngày mai và task đã xong không ở menu chính
    expect(scope.queryByText("Ngày mai")).toBeNull();
    expect(scope.queryByText("Xong rồi")).toBeNull();
  });

  it("task quá hạn đứng đầu, task chưa xếp lịch đứng cuối", () => {
    seed([
      makeTask({ id: "n1", title: "Chưa xếp lịch", dueAt: null }),
      makeTask({ id: "o1", title: "Quá hạn", dueAt: Date.now() - 3_600_000 }),
    ]);

    renderWithRouter(<App />, "/");

    const items = Array.from(
      document.querySelectorAll(".task-list li .task-item__title"),
    );
    expect(items[0]).toHaveTextContent("Quá hạn");
    expect(items[items.length - 1]).toHaveTextContent("Chưa xếp lịch");
  });

  it("task hoàn thành hôm nay hiện ở mục 'Hoàn thành hôm nay'", () => {
    seed([
      makeTask({
        id: "x1",
        title: "Vừa xong",
        completed: true,
        completedAt: Date.now() - 60_000,
      }),
    ]);

    renderWithRouter(<App />, "/");

    expect(screen.getByText(/Hoàn thành hôm nay \(1\)/)).toBeInTheDocument();
    expect(screen.getByText("Vừa xong")).toBeInTheDocument();
  });

  it("thêm task từ trang chủ hiện ngay trong danh sách hôm nay", async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />, "/");

    await user.type(screen.getByLabelText("Thêm task mới"), "Việc của hôm nay{Enter}");

    // Task xuất hiện cả ở trang chính lẫn sidebar -> scope trong trang.
    const page = document.querySelector(".today-page");
    expect(
      await within(page as HTMLElement).findByText("Việc của hôm nay"),
    ).toBeInTheDocument();
  });

  it("trang chủ có sidebar việc hôm nay + taskbar (theme, thống kê)", () => {
    renderWithRouter(<App />, "/");

    expect(document.querySelector(".sidebar")).toBeInTheDocument();
    expect(screen.getByLabelText("Danh sách việc hôm nay")).toBeInTheDocument();
    expect(document.querySelector(".topbar")).toBeInTheDocument();
    expect(document.querySelector(".theme-toggle")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thống kê" })).toBeInTheDocument();
  });
});
