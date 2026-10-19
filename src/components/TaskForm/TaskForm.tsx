import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { DeadlinePicker } from "../DeadlinePicker/DeadlinePicker";
import "./TaskForm.css";

interface TaskFormProps {
  onAdd: (title: string, dueAt: number | null, remindBeforeMin: number) => void;
}

export function TaskForm({ onAdd }: TaskFormProps) {
  const [title, setTitle] = useState<string>("");
  const [dueAt, setDueAt] = useState<number | null>(null);
  const [remindBeforeMin, setRemindBeforeMin] = useState<number>(0);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const trimmed = title.trim();
    if (trimmed === "") return;
    onAdd(trimmed, dueAt, remindBeforeMin);
    setTitle("");
    setDueAt(null);
    setRemindBeforeMin(0);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label className="task-form__label" htmlFor="new-task">
        Thêm task mới
      </label>
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
