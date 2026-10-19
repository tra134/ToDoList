import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { STORAGE_KEY } from "../constants/config";
import { makeTask } from "../test/factories";
import { renderWithRouter } from "../test/renderWithRouter";
import { toInputValue } from "../utils/time";
import App from "../App";

beforeEach(() => {
  window.localStorage.clear();
});

describe("TaskPage (integration)", () => {
  it("thêm task có deadline -> hiện task + deadline badge", async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />);

    await user.type(screen.getByLabelText("Thêm task mới"), "Làm báo cáo");
    // Hạn trong 2 giờ -> badge vàng (sắp tới hạn)
    fireEvent.change(screen.getByLabelText("Hạn hoàn thành"), {
      target: { value: toInputValue(Date.now() + 2 * 3_600_000) },
    });
    await user.click(screen.getByRole("button", { name: "Thêm" }));

    expect(await screen.findByText("Làm báo cáo")).toBeInTheDocument();
    expect(document.querySelector(".deadline-badge")).toBeInTheDocument();
    expect(document.querySelector(".deadline-badge--soon")).toBeInTheDocument();
  });

  it("task rỗng -> không thêm được", async () => {
    const user = userEvent.setup();
    renderWithRouter(<App />);

    await user.type(screen.getByLabelText("Thêm task mới"), "   {Enter}");

    expect(screen.getByText("Không có task nào ở đây.")).toBeInTheDocument();
  });

  it("vào /overdue chỉ thấy task quá hạn (chưa xong)", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        makeTask({ id: "q1", title: "Task quá hạn", dueAt: Date.now() - 3_600_000 }),
        makeTask({ id: "b1", title: "Task bình thường", dueAt: null }),
        makeTask({
          id: "x1",
          title: "Task đã xong",
          dueAt: Date.now() - 3_600_000,
          completed: true,
        }),
      ]),
    );

    renderWithRouter(<App />, "/overdue");

    expect(screen.getByText("Task quá hạn")).toBeInTheDocument();
    expect(screen.queryByText("Task bình thường")).toBeNull();
    expect(screen.queryByText("Task đã xong")).toBeNull();
  });

  it("vào /active chỉ thấy task chưa xong", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        makeTask({ title: "Chưa xong" }),
        makeTask({ title: "Đã xong rồi", completed: true }),
      ]),
    );

    renderWithRouter(<App />, "/active");

    expect(screen.getByText("Chưa xong")).toBeInTheDocument();
    expect(screen.queryByText("Đã xong rồi")).toBeNull();
  });

  it("Footer đếm đúng task còn lại và task quá hạn", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        makeTask({ title: "Không hạn", dueAt: null }),
        makeTask({ title: "Quá hạn nè", dueAt: Date.now() - 3_600_000 }),
      ]),
    );

    renderWithRouter(<App />, "/");

    // 2 task chưa xong (kể cả task quá hạn), trong đó 1 task quá hạn.
    expect(screen.getByText("2 task còn lại · 1 quá hạn")).toBeInTheDocument();
  });

  it("F5 giả lập (unmount + render lại) -> dữ liệu vẫn còn", async () => {
    const user = userEvent.setup();
    const first = renderWithRouter(<App />);

    await user.type(screen.getByLabelText("Thêm task mới"), "Task cần nhớ{Enter}");
    expect(screen.getByText("Task cần nhớ")).toBeInTheDocument();

    first.unmount(); // như F5
    renderWithRouter(<App />);

    expect(screen.getByText("Task cần nhớ")).toBeInTheDocument();
  });
});
