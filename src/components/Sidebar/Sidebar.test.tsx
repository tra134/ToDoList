import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { makeTask } from "../../test/factories";
import { renderWithRouter } from "../../test/renderWithRouter";
import { Sidebar } from "./Sidebar";

describe("Sidebar (danh sách nhanh việc hôm nay)", () => {
  it("task rỗng -> trạng thái rỗng, không có danh sách", () => {
    renderWithRouter(<Sidebar tasks={[]} now={Date.now()} />);

    expect(screen.getByLabelText("Danh sách việc hôm nay")).toBeInTheDocument();
    expect(screen.getByText("Không có việc cần làm hôm nay.")).toBeInTheDocument();
    expect(document.querySelector(".sidebar-today__list")).toBeNull();
  });

  it("chỉ liệt kê task quá hạn + đến hạn hôm nay + chưa xếp lịch", () => {
    const now = Date.now();
    renderWithRouter(
      <Sidebar
        tasks={[
          makeTask({ id: "t1", title: "Hôm nay", dueAt: now + 3_600_000 }),
          makeTask({ id: "o1", title: "Quá hạn", dueAt: now - 3_600_000 }),
          makeTask({ id: "n1", title: "Chưa xếp lịch", dueAt: null }),
          makeTask({ id: "f1", title: "Ngày mai", dueAt: now + 48 * 3_600_000 }),
        ]}
        now={now}
      />,
    );

    const scope = screen.getByLabelText("Danh sách việc hôm nay");
    expect(within(scope).getByText("Hôm nay")).toBeInTheDocument();
    expect(within(scope).getByText("Quá hạn")).toBeInTheDocument();
    expect(within(scope).getByText("Chưa xếp lịch")).toBeInTheDocument();
    expect(within(scope).queryByText("Ngày mai")).toBeNull();
    expect(document.querySelector(".sidebar-today__count")).toHaveTextContent("3");
  });

  it("task quá hạn có dot + giờ màu đỏ", () => {
    const now = Date.now();
    renderWithRouter(
      <Sidebar
        tasks={[makeTask({ id: "o1", title: "Trễ deadline", dueAt: now - 3_600_000 })]}
        now={now}
      />,
    );

    expect(document.querySelector(".sidebar-today__dot--overdue")).not.toBeNull();
    expect(screen.getByText("quá hạn 1 giờ")).toBeInTheDocument();
  });

  it("có task xong hôm nay -> hiện dòng 'Đã xong hôm nay: N'", () => {
    const now = Date.now();
    renderWithRouter(
      <Sidebar
        tasks={[
          makeTask({ id: "x1", title: "Vừa xong", completed: true, completedAt: now - 60_000 }),
          makeTask({ id: "x2", title: "Xong nốt", completed: true, completedAt: now - 120_000 }),
        ]}
        now={now}
      />,
    );

    expect(screen.getByText(/Đã xong hôm nay/)).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("sidebar không còn menu điều hướng (đã lên taskbar)", () => {
    renderWithRouter(<Sidebar tasks={[]} now={Date.now()} />);

    expect(screen.queryByRole("navigation")).toBeNull();
    expect(document.querySelector(".theme-toggle")).toBeNull();
  });
});
