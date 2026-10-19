import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { TaskColorId } from "../../types/task";
import { ColorSwatches } from "../ColorSwatches/ColorSwatches";
import { DeadlinePicker } from "../DeadlinePicker/DeadlinePicker";
import "./TaskForm.css";

interface TaskFormProps {
  onAdd: (
    title: string,
    dueAt: number | null,
    remindBeforeMin: number,
    color: TaskColorId,
    note: string,
  ) => void;
}

export function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState<string>("");
  const [dueAt, setDueAt] = useState<number | null>(null);
  const [remindBeforeMin, setRemindBeforeMin] = useState<number>(0);
  const [color, setColor] = useState<TaskColorId>("none");
  const [note, setNote] = useState<string>("");

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const trimmed = title.trim();
    if (trimmed === "") return;
    onAdd(trimmed, dueAt, remindBeforeMin, color, note);
    setTitle("");
    setDueAt(null);
    setRemindBeforeMin(0);
    setColor("none");
    setNote("");
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label className="task-form__label" htmlFor="new-task">
        Thêm task mới
      </label>

      {/* Input + nút Thêm thẳng hàng, cùng cao với ô tick của task bên dưới */}
      <div className="task-form__row">
        <input
          id="new-task"
          className="task-form__input"
          type="text"
          placeholder="Việc cần làm..."
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        />
        <button className="task-form__submit" type="submit">
          Thêm
        </button>
      </div>

      <div className="task-form__meta">
        <div className="task-form__meta-group">
          <span className="task-form__meta-label" id="task-form-color-label">
            Màu
          </span>
          <ColorSwatches value={color} onChange={setColor} />
        </div>

        <div className="task-form__meta-group task-form__meta-group--note">
          <label className="task-form__meta-label" htmlFor="new-task-note">
            Ghi chú
          </label>
          <input
            id="new-task-note"
            className="task-form__note"
            type="text"
            placeholder="Ví dụ: cần làm gấp, ý tưởng mới..."
            value={note}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNote(e.target.value)}
          />
        </div>
      </div>

      <DeadlinePicker
        value={dueAt}
        remindBeforeMin={remindBeforeMin}
        onChange={(nextDueAt, nextRemind) => {
          setDueAt(nextDueAt);
          setRemindBeforeMin(nextRemind);
        }}
      />
    </form>
  );
}
