import { useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import type { Task } from "../../types/task";
import { DeadlineBadge } from "../DeadlineBadge/DeadlineBadge";
import { DeadlinePicker } from "../DeadlinePicker/DeadlinePicker";
import "./TaskItem.css";

interface TaskItemProps {
  task: Task;
  now: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  onSetDeadline: (id: string, dueAt: number | null, remindBeforeMin: number) => void;
}

export function TaskItem({
  task,
  now,
  onToggle,
  onDelete,
  onEdit,
  onSetDeadline,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>(task.title);
  const [showDeadlineEdit, setShowDeadlineEdit] = useState<boolean>(false);
  // Chống gọi onEdit 2 lần (Enter rồI blur khi input bị gỡ đi).
  const closedRef = useRef<boolean>(false);

  const startEditing = (): void => {
    closedRef.current = false;
    setEditText(task.title);
    setIsEditing(true);
    setShowDeadlineEdit(false);
  };

  const commitEdit = (): void => {
    if (closedRef.current) return;
    closedRef.current = true;
    const trimmed = editText.trim();
    if (trimmed !== "") onEdit(task.id, trimmed);
    setIsEditing(false);
  };

  const cancelEdit = (): void => {
    closedRef.current = true;
    setIsEditing(false); // huỷ sửa, không gọi onEdit
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  return (
    <li className={`task-item${task.completed ? " task-item--done" : ""}`}>
      <div className="task-item__main">
        <input
          className="task-item__check"
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={`Đánh dấu hoàn thành: ${task.title}`}
        />

        <div className="task-item__body">
          {isEditing ? (
            <input
              className="task-item__edit"
              type="text"
              value={editText}
              autoFocus
              aria-label="Sửa tên task"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEditText(e.target.value)
              }
              onBlur={commitEdit}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <span
              className="task-item__title"
              onDoubleClick={startEditing}
              title="Double-click để sửa"
            >
              {task.title}
            </span>
          )}

          {task.dueAt !== null && (
            <DeadlineBadge task={task} now={now} />
          )}
        </div>

        <div className="task-item__actions">
          <button
            type="button"
            className="task-item__btn task-item__btn--deadline"
            aria-label={`Sửa hạn của ${task.title}`}
            aria-expanded={showDeadlineEdit}
            onClick={() => setShowDeadlineEdit((v) => !v)}
          >
            Hạn
          </button>
          <button
            type="button"
            className="task-item__btn task-item__btn--delete"
            aria-label={`Xoá task ${task.title}`}
            onClick={() => onDelete(task.id)}
          >
            Xoá
          </button>
        </div>
      </div>

      {showDeadlineEdit && (
        <DeadlinePicker
          value={task.dueAt}
          remindBeforeMin={task.remindBeforeMin}
          onChange={(dueAt, remindBeforeMin) =>
            onSetDeadline(task.id, dueAt, remindBeforeMin)
          }
        />
      )}
    </li>
  );
}
