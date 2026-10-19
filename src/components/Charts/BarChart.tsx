import "./Charts.css";

export interface BarSeries {
  label: string;
  color: string;
  values: number[]; // độ dài phải bằng số category
}

interface BarChartProps {
  categories: string[]; // nhãn trục ngang: "Hôm nay", "Tuần 3", ...
  series: BarSeries[];
  height?: number;
}

// Khung vẽ logic (viewBox) — co giãn theo container, không cần thư viện chart.
const W = 320;
const PAD_X = 10;
const PAD_TOP = 14; // chừa chỗ cho số trên đầu cột
const PAD_BOTTOM = 18; // chừa chỗ cho nhãn category

/**
 * Biểu đồ cột (bar chart) vẽ bằng SVG thuần.
 * Ví dụ: nhóm "Hôm nay / Tuần này / Tháng này", mỗi nhóm 2 cột
 * "Đã xong" (xanh) và "Chưa xong" (vàng/đỏ).
 */
export function BarChart({ categories, series, height = 150 }: BarChartProps) {
  const chartH = height - PAD_TOP - PAD_BOTTOM;
  const maxValue = Math.max(1, ...series.flatMap((s) => s.values));
  const groupW = (W - PAD_X * 2) / Math.max(1, categories.length);
  const barW = Math.min(26, (groupW - 10) / Math.max(1, series.length));

  const ariaLabel = categories
    .map(
      (cat, i) =>
        `${cat}: ${series.map((s) => `${s.label} ${s.values[i] ?? 0}`).join(", ")}`,
    )
    .join("; ");

  return (
    <svg
      className="bar-chart"
      viewBox={`0 0 ${W} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={ariaLabel}
    >
      <line
        className="bar-chart__axis"
        x1={PAD_X}
        y1={height - PAD_BOTTOM}
        x2={W - PAD_X}
        y2={height - PAD_BOTTOM}
      />
      {categories.map((cat, ci) => {
        const groupX = PAD_X + ci * groupW;
        const barsW = series.length * barW + (series.length - 1) * 4;
        const barsX = groupX + (groupW - barsW) / 2;
        return (
          <g key={cat}>
            {series.map((s, si) => {
              const value = s.values[ci] ?? 0;
              const barH = value === 0 ? 0 : (value / maxValue) * chartH;
              const x = barsX + si * (barW + 4);
              const y = height - PAD_BOTTOM - barH;
              return (
                <g key={s.label}>
                  {barH > 0 && (
                    <rect
                      className="bar-chart__bar"
                      x={x}
                      y={y}
                      width={barW}
                      height={barH}
                      rx={4}
                      fill={s.color}
                    />
                  )}
                  <text
                    className="bar-chart__value"
                    x={x + barW / 2}
                    y={y - 4}
                  >
                    {value}
                  </text>
                </g>
              );
            })}
            <text
              className="bar-chart__label"
              x={groupX + groupW / 2}
              y={height - PAD_BOTTOM + 12}
            >
              {cat}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
