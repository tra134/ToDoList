import { useId, useState } from "react";
import { REMINDER_OPTIONS } from "../../constants/config";
import { fromInputValue, getTimeZoneLabel, toInputValue } from "../../utils/time";
import "./DeadlinePicker.css";

interface DeadlinePickerProps {
  value: number | null;
  remindBeforeMin: number;
  onChange: (dueAt: number | null, remindBeforeMin: number) => void;
}

function reminderLabel(option: number): string {
  if (option === 0) return "Không nhắc";
  if (option < 60) return `${option} phút`;
  if (option < 1440) return `${option / 60} giờ`;
  return `${option / 1440} ngày`;
}

/**
 * Chọn deadline (ngày + giờ theo GIỜ ĐỊA PHƯƠNG) + thời điểm nhắc trước.
 * Giá trị được lưu/timestamp (epoch ms UTC), hiển thị theo múi giờ trình duyệt.
 */
export function DeadlinePicker({
  value,
  remindBeforeMin,
  onChange,
}: DeadlinePickerProps) {
  const inputId = useId();
  const selectId = useId();
  // Chốt "không chọn quá khứ" tại thời điểm mount (không gọi Date.now() mỗi render).
  const [minValue] = useState<number>(() => Date.now());

  return (
    <div className="deadline-picker">
      <label className="deadline-picker__label" htmlFor={inputId}>
        Hạn hoàn thành
      </label>
      <input
        id={inputId}
        className="deadline-picker__input"
        type="datetime-local"
        min={toInputValue(minValue)}
        value={toInputValue(value)}
        onChange={(e) => onChange(fromInputValue(e.target.value), remindBeforeMin)}
      />
      <p className="deadline-picker__tz">{getTimeZoneLabel()}</p>

      <label className="deadline-picker__label" htmlFor={selectId}>
        Nhắc trước
      </label>
      <select
        id={selectId}
        className="deadline-picker__select"
        value={remindBeforeMin}
        onChange={(e) => onChange(value, Number(e.target.value))}
      >
        {REMINDER_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {reminderLabel(option)}
          </option>
        ))}
      </select>
    </div>
  );
}
