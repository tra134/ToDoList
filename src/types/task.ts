export interface Task {
  id: string; // crypto.randomUUID()
  title: string;
  completed: boolean;
  createdAt: number; // epoch ms (UTC)
  dueAt: number | null; // epoch ms (UTC); null = không có deadline
  remindBeforeMin: number; // 0 = không nhắc
  reminded: boolean; // đã nhắc rồi thì không nhắc lại
  color: TaskColorId; // màu kí hiệu cho task (mặc định "none")
  note: string; // ghi chú thêm, "" = không có
  completedAt: number | null; // thời điểm hoàn thành (dùng cho thống kê)
}

/** "none" = không tô màu; "red" = cần làm gấp... */
export type TaskColorId = "none" | "red" | "orange" | "blue" | "green" | "purple";

export type Filter = "all" | "active" | "completed" | "overdue";

export interface ReminderAlert {
  taskId: string;
  title: string;
  overdue: boolean; // true: đã quá hạn, false: sắp tới hạn
}
