import type { CSSProperties } from "react";
import { TASK_COLORS } from "../../constants/config";
import type { TaskColorId } from "../../types/task";
import "./ColorSwatches.css";

interface ColorSwatchesProps {
  value: TaskColorId;
  onChange: (color: TaskColorId) => void;
}

/**
 * Hàng ô màu để chọn kí hiệu task (đỏ = cần làm gấp...).
 * Dùng nút bấm có aria-label, không dùng icon màu mè.
 */
export function ColorSwatches({ value, onChange }: ColorSwatchesProps) {
  return (
    <div className="swatches" role="group" aria-label="Màu task">
      {TASK_COLORS.map((color) => (
        <button
          key={color.id}
          type="button"
          className={`swatch${value === color.id ? " swatch--selected" : ""}`}
          style={{ "--swatch": color.hex } as CSSProperties}
          aria-label={color.label}
          aria-pressed={value === color.id}
          title={color.label}
          onClick={() => onChange(color.id)}
        >
          {value === color.id && <span className="swatch__tick" aria-hidden="true" />}
        </button>
      ))}
    </div>
  );
}
