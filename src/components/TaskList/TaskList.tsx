import type { Task } from "../../types/task";
import { TaskItem } from "../TaskItem/TaskItem";
import "./TaskList.css";

interface TaskListProps {
  tasks: Task[];
  now: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  onSetDeadline: (id: string, dueAt: number | null, remindBeforeMin: number) => void;
}

export function TaskList({
  tasks,
  now,
  onToggle,
  onDelete,
  onEdit,
  onSetDeadline,
}: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="task-list__empty">Không có task nào ở đây.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          now={now}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
          onSetDeadline={onSetDeadline}
        />
      ))}
    </ul>
  );
}
