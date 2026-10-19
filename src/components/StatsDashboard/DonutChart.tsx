export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  centerValue: string;
  centerLabel: string;
  size?: number;
  thickness?: number;
}

/**
 * Biểu đồ tròn (donut) vẽ bằng SVG thuần — không cần thư viện chart.
 * Mảng màu chỉ dùng 3 màu trạng thái: xanh (đã xong), dương (đang làm), đỏ (quá hạn).
 */
export function DonutChart({
  slices,
  centerValue,
  centerLabel,
  size = 148,
  thickness = 20,
}: DonutChartProps) {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = slices.reduce((sum, s) => sum + s.value, 0);

  // Mỗi segments: độ dài theo tỉ lệ, offset = tổng giá trị của các segments đứng trước.
  const segments = slices.map((slice, index) => {
    const valueBefore = slices
      .slice(0, index)
      .reduce((sum, s) => sum + s.value, 0);
    const fraction = total === 0 ? 0 : slice.value / total;
    const fractionBefore = total === 0 ? 0 : valueBefore / total;
    const length = fraction * circumference;
    return {
      ...slice,
      dashArray: `${length} ${circumference - length}`,
      dashOffset: -fractionBefore * circumference,
    };
  });

  return (
    <div className="donut">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={slices
          .map((s) => `${s.label}: ${s.value}`)
          .join(", ")}
      >
        <circle
          className="donut__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
        />
        {segments.map((segment) =>
          segment.value === 0 ? null : (
            <circle
              key={segment.label}
              className="donut__segment"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={thickness}
              strokeDasharray={segment.dashArray}
              strokeDashoffset={segment.dashOffset}
            />
          ),
        )}
      </svg>
      <div className="donut__center">
        <strong className="donut__value">{centerValue}</strong>
        <span className="donut__label">{centerLabel}</span>
      </div>
    </div>
  );
}
