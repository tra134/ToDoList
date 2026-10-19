import { useState } from "react";
import { PAGE_SIZE } from "../../constants/config";
import type { Task, TaskColorId } from "../../types/task";
import { Pagination } from "../Pagination/Pagination";
import { TaskItem } from "../TaskItem/TaskItem";
import "./TaskList.css";

interface TaskListProps {
  tasks: Task[];
  now: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  onSetDeadline: (id: string, dueAt: number | null, remindBeforeMin: number) => void;
  onSetMeta: (id: string, patch: { color?: TaskColorId; note?: string }) => void;
}

export function TaskList({
  tasks,
  now,
  onToggle,
  onDelete,
  onEdit,
  onSetDeadline,
  onSetMeta,
}: TaskListProps) {
  const [page, setPage] = useState<number>(0);

  if (tasks.length === 0) {
    return <p className="task-list__empty">Không có task nào ở đây.</p>;
  }

  const pageCount = Math.ceil(tasks.length / PAGE_SIZE);
  // List rút xuống (xoá task...) -> tự về trang hợp lệ, không cần effect.
  const safePage = Math.min(page, pageCount - 1);
  const visible = tasks.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  return (
    <>
      <ul className="task-list">
        {visible.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            now={now}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
            onSetDeadline={onSetDeadline}
            onSetMeta={onSetMeta}
          />
        ))}
      </ul>
      <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
    </>
  );
}
