import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BarChart } from "./BarChart";

describe("BarChart", () => {
  it("vẽ số cột = category × series", () => {
    render(
      <BarChart
        categories={["Hôm nay", "Tuần này"]}
        series={[
          { label: "Đã xong", color: "#0f0", values: [1, 2] },
          { label: "Chưa xong", color: "#ff0", values: [3, 0] },
        ]}
      />,
    );

    // 2 nhóm × 2 series = 4 cột; cột value 0 không vẽ rect
    expect(document.querySelectorAll(".bar-chart__bar")).toHaveLength(3);
  });

  it("aria-label mô tả đủ dữ liệu từng nhóm", () => {
    render(
      <BarChart
        categories={["Hôm nay", "Tháng này"]}
        series={[
          { label: "Đã xong", color: "#0f0", values: [2, 5] },
          { label: "Chưa xong", color: "#ff0", values: [1, 0] },
        ]}
      />,
    );

    const svg = document.querySelector(".bar-chart");
    expect(svg).toHaveAttribute(
      "aria-label",
      "Hôm nay: Đã xong 2, Chưa xong 1; Tháng này: Đã xong 5, Chưa xong 0",
    );
  });

  it("mảng rỗng -> không crash, không có cột", () => {
    render(<BarChart categories={[]} series={[]} />);

    expect(document.querySelectorAll(".bar-chart__bar")).toHaveLength(0);
  });
});
