import type { Task } from "../types/task";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** IANA timezone của trình duyệt (không hard-code trong app). */
export function getUserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** Vd: "Asia/Ho_Chi_Minh · GMT+7" */
export function getTimeZoneLabel(ts: number = Date.now()): string {
  const timeZone = getUserTimeZone();
  const part = new Intl.DateTimeFormat("vi-VN", {
    timeZone,
    timeZoneName: "short",
  })
    .formatToParts(ts)
    .find((p) => p.type === "timeZoneName");
  const offset = part?.value ?? "";
  return offset ? `${timeZone} · ${offset}` : timeZone;
}

/** Hiển thị timestamp theo múi giờ hiện tại của người dùng. */
export function formatDeadline(ts: number): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: getUserTimeZone(),
  }).format(ts);
}

/**
 * Timestamp -> "YYYY-MM-DDTHH:mm" theo GIỜ ĐỊA PHƯƠNG.
 * Không dùng toISOString() vì nó luôn ra UTC.
 */
export function toInputValue(ts: number | null): string {
  if (ts === null || !Number.isFinite(ts)) return "";
  const d = new Date(ts);
  const pad = (n: number): string => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

/** "2026-10-25T14:00" (giờ địa phương) -> epoch ms; rỗng/không hợp lệ -> null. */
export function fromInputValue(v: string): number | null {
  const trimmed = v.trim();
  if (trimmed === "") return null;
  const ts = new Date(trimmed).getTime();
  return Number.isNaN(ts) ? null : ts;
}

/** Quá hạn: có deadline, chưa xong, đã vượt thời điểm hết hạn. */
export function isOverdue(task: Task, now: number): boolean {
  return task.dueAt !== null && !task.completed && task.dueAt < now;
}

/** Sắp tới hạn: chưa quá hạn và còn <= 24 giờ. */
export function isDueSoon(task: Task, now: number): boolean {
  if (task.dueAt === null || task.completed) return false;
  const diff = task.dueAt - now;
  return diff > 0 && diff <= DAY_MS;
}

/** "còn 3 giờ" / "quá hạn 2 ngày" — dùng Intl.RelativeTimeFormat("vi"). */
export function formatTimeLeft(dueAt: number, now: number): string {
  const diff = dueAt - now;
  const abs = Math.abs(diff);

  let n: number;
  let unit: Intl.RelativeTimeFormatUnit;
  if (abs >= DAY_MS) {
    n = Math.round(abs / DAY_MS);
    unit = "day";
  } else if (abs >= HOUR_MS) {
    n = Math.round(abs / HOUR_MS);
    unit = "hour";
  } else if (abs >= MINUTE_MS) {
    n = Math.round(abs / MINUTE_MS);
    unit = "minute";
  } else {
    n = Math.round(abs / 1000);
    unit = "second";
  }

  // Luôn cho số âm để ra dạng "3 giờ trước", rồi bỏ chữ "trước".
  const base = new Intl.RelativeTimeFormat("vi", { numeric: "always" }).format(
    -n,
    unit,
  );
  const amount = base.replace(/\s*trước$/, "").trim();
  return diff >= 0 ? `còn ${amount}` : `quá hạn ${amount}`;
}
