import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { makeTask } from "../../test/factories";
import { StatsDashboard } from "./StatsDashboard";

const NOW = Date.UTC(2026, 9, 25, 7, 0); // 14:00 UTC+7, thứ Hai? (ngày 25/10/2026)
const HOUR = 3_600_000;

const TASKS = [
  // Xong hôm nay (cách đây 1 giờ)
  makeTask({ title: "Xong hôm nay", completed: true, completedAt: NOW - HOUR }),
  // Xong hôm qua
  makeTask({
    title: "Xong hôm qua",
    completed: true,
    completedAt: NOW - 30 * HOUR,
  }),
  // Xong tháng trước (10/2026 là tháng khác tháng 11?)
  makeTask({
    title: "Xong tháng trước",
    completed: true,
    completedAt: Date.UTC(2026, 8, 10, 3, 0), // tháng 9
  }),
  // Đang làm
  makeTask({ title: "Đang làm dở" }),
  // Quá hạn
  makeTask({ title: "Quá hạn rồi", dueAt: NOW - HOUR }),
];

describe("StatsDashboard", () => {
  it("hiện 4 thẻ thống kê đúng số lượng", () => {
    const { container } = render(<StatsDashboard tasks={TASKS} now={NOW} />);

    const cards = container.querySelectorAll(".stat-card");
    expect(cards).toHaveLength(4);
    // Xong hôm nay: 1
    expect(cards[0].querySelector(".stat-card__value")).toHaveTextContent("1");
    expect(cards[0].querySelector(".stat-card__label")).toHaveTextContent(
      "Xong hôm nay",
    );
    // Xong tháng này: 2 (task hôm nay + task hôm qua, đều trong tháng 10)
    expect(cards[1].querySelector(".stat-card__value")).toHaveTextContent("2");
    // Chưa hoàn thành: 2 (đang làm + quá hạn)
    expect(cards[2].querySelector(".stat-card__value")).toHaveTextContent("2");
    // Tổng task: 5
    expect(cards[3].querySelector(".stat-card__value")).toHaveTextContent("5");
  });

  it("biểu đồ tròn thể hiện đúng tỉ lệ + tiến độ % ở giữa", () => {
    render(<StatsDashboard tasks={TASKS} now={NOW} />);

    // 3/5 hoàn thành -> 60%
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("tiến độ")).toBeInTheDocument();

    // Biểu đồ tròn có aria-label đúng số lượng từng trạng thái
    expect(
      screen.getByRole("img", { name: "Đã xong: 3, Đang làm: 1, Quá hạn: 1" }),
    ).toBeInTheDocument();

    // Chú giải
    expect(screen.getByText(/Đã xong:/)).toBeInTheDocument();
    expect(screen.getByText(/Đang làm:/)).toBeInTheDocument();
    expect(screen.getByText(/Quá hạn:/)).toBeInTheDocument();
  });

  it("biểu đồ đường hiện 7 ngày gần nhất", () => {
    render(<StatsDashboard tasks={TASKS} now={NOW} />);

    expect(
      screen.getByRole("img", { name: "Số việc hoàn thành theo ngày" }),
    ).toBeInTheDocument();
  });

  it("chưa có task nào -> số liệu là 0, không crash", () => {
    const { container } = render(<StatsDashboard tasks={[]} now={NOW} />);

    expect(screen.getByText("0%")).toBeInTheDocument();
    const cards = container.querySelectorAll(".stat-card__value");
    cards.forEach((card) => expect(card).toHaveTextContent("0"));
  });
});
