import { useCallback, useMemo } from "react";
import { STORAGE_KEY } from "../constants/config";
import type { Task } from "../types/task";
import { normalizeTask } from "../utils/normalizeTask";
import { useLocalStorage } from "./useLocalStorage";

export interface UseTasksResult {
  tasks: Task[];
  addTask: (
    title: string,
    dueAt?: number | null,
    remindBeforeMin?: number,
  ) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  editTask: (id: string, newTitle: string) => void;
  setDeadline: (id: string, dueAt: number | null, remindBeforeMin: number) => void;
  markReminded: (id: string) => void;
}

/**
 * Toàn bộ state + thao tác task. Sống ở App.tsx để chuyển route
 * không mất state và reminder không bị gián đoạn.
 */
export function useTasks(): UseTasksResult {
  const [stored, setStored] = useLocalStorage<Task[]>(STORAGE_KEY, []);

  // Task cũ trong localStorage có thể thiếu field -> chuẩn hoá khi đọc.
  const tasks = useMemo<Task[]>(
    () => (Array.isArray(stored) ? stored.map(normalizeTask) : []),
    [stored],
  );

  // Mọi thao tác ghi đều chuẩn hoá lại dữ liệu trước khi lưu.
  const update = useCallback(
    (updater: (list: Task[]) => Task[]) => {
      setStored((prev) =>
        updater(Array.isArray(prev) ? prev.map(normalizeTask) : []),
      );
    },
    [setStored],
  );

  const addTask = useCallback(
    (title: string, dueAt: number | null = null, remindBeforeMin = 0): void => {
      const trimmed = title.trim();
      if (trimmed === "") return;
      const task: Task = {
        id: crypto.randomUUID(),
        title: trimmed,
        completed: false,
        createdAt: Date.now(),
        dueAt: dueAt ?? null,
        remindBeforeMin,
        reminded: false,
      };
      update((list) => [...list, task]);
    },
    [update],
  );

  const toggleTask = useCallback(
    (id: string): void => {
      update((list) =>
        list.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      );
    },
    [update],
  );

  const deleteTask = useCallback(
    (id: string): void => {
      update((list) => list.filter((t) => t.id !== id));
    },
    [update],
  );

  const editTask = useCallback(
    (id: string, newTitle: string): void => {
      const trimmed = newTitle.trim();
      if (trimmed === "") return;
      update((list) =>
        list.map((t) => (t.id === id ? { ...t, title: trimmed } : t)),
      );
    },
    [update],
  );

  const setDeadline = useCallback(
    (id: string, dueAt: number | null, remindBeforeMin: number): void => {
      update((list) =>
        list.map((t) =>
          t.id === id
            ? // Đổi deadline -> cho phép nhắc lại từ đầu.
              { ...t, dueAt, remindBeforeMin, reminded: false }
            : t,
        ),
      );
    },
    [update],
  );

  const markReminded = useCallback(
    (id: string): void => {
      update((list) =>
        list.map((t) => (t.id === id ? { ...t, reminded: true } : t)),
      );
    },
    [update],
  );

  return {
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
    setDeadline,
    markReminded,
  };
}
