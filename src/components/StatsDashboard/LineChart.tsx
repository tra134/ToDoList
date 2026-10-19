export interface LinePoint {
  label: string;
  value: number;
}

interface LineChartProps {
  points: LinePoint[];
  width?: number;
  height?: number;
  title?: string;
}

/**
 * Biểu đồ đường vẽ bằng SVG thuần: số việc hoàn thành theo ngày.
 * Chỉ 1 màu (màu chủ đạo) để giao diện không bị màu mè.
 */
export function LineChart({
  points,
  width = 320,
  height = 130,
  title = "Số việc hoàn thành theo ngày",
}: LineChartProps) {
  const paddingX = 18;
  const paddingY = 20;
  const maxValue = Math.max(1, ...points.map((p) => p.value));
  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const coords = points.map((point, i) => ({
    ...point,
    x: paddingX + (points.length === 1 ? innerWidth / 2 : (i * innerWidth) / (points.length - 1)),
    y: paddingY + innerHeight - (point.value / maxValue) * innerHeight,
  }));

  const polyline = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const areaPath =
    coords.length > 0
      ? `M ${coords[0].x} ${paddingY + innerHeight} ` +
        coords.map((c) => `L ${c.x} ${c.y}`).join(" ") +
        ` L ${coords[coords.length - 1].x} ${paddingY + innerHeight} Z`
      : "";

  return (
    <svg
      className="line-chart"
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <line
        className="line-chart__axis"
        x1={paddingX}
        y1={paddingY + innerHeight}
        x2={width - paddingX}
        y2={paddingY + innerHeight}
      />
      {areaPath !== "" && <path className="line-chart__area" d={areaPath} />}
      {coords.length > 1 && (
        <polyline className="line-chart__line" points={polyline} />
      )}
      {coords.map((c) => (
        <g key={c.label}>
          <circle className="line-chart__dot" cx={c.x} cy={c.y} r={3.5}>
            <title>{`${c.label}: ${c.value}`}</title>
          </circle>
          <text className="line-chart__value" x={c.x} y={c.y - 8}>
            {c.value}
          </text>
          <text className="line-chart__label" x={c.x} y={height - 4}>
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
