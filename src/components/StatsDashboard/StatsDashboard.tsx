import type { Task } from "../../types/task";
import { isOverdue, isSameDay, isSameMonth } from "../../utils/time";
import { DonutChart } from "./DonutChart";
import { LineChart } from "./LineChart";
import "./StatsDashboard.css";

interface StatsDashboardProps {
  tasks: Task[];
  now: number;
}

const DAY_MS = 86_400_000;

const STATUS_COLORS = {
  done: "#2f9e6e",
  doing: "#3b6ef6",
  overdue: "#e5484d",
} as const;

/** Thống kê tổng quan: biểu đồ tròn (tỉ lệ) + biểu đồ đường (7 ngày). */
export function StatsDashboard({ tasks, now }: StatsDashboardProps) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const overdue = tasks.filter((t) => isOverdue(t, now)).length;
  const doing = total - completed - overdue;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const doneToday = tasks.filter(
    (t) => t.completedAt !== null && isSameDay(t.completedAt, now),
  ).length;
  const doneThisMonth = tasks.filter(
    (t) => t.completedAt !== null && isSameMonth(t.completedAt, now),
  ).length;

  // 7 ngày gần nhất (cùng ô cuối là hôm nay), đếm việc hoàn thành trong ngày.
  const linePoints = Array.from({ length: 7 }, (_, i) => {
    const day = now - (6 - i) * DAY_MS;
    return {
      label: String(new Date(day).getDate()),
      value: tasks.filter(
        (t) => t.completedAt !== null && isSameDay(t.completedAt, day),
      ).length,
    };
  });

  return (
    <section className="stats" aria-label="Thống kê công việc">
      <div className="stats__cards">
        <div className="stat-card">
          <strong className="stat-card__value">{doneToday}</strong>
          <span className="stat-card__label">Xong hôm nay</span>
        </div>
        <div className="stat-card">
          <strong className="stat-card__value">{doneThisMonth}</strong>
          <span className="stat-card__label">Xong tháng này</span>
        </div>
        <div className="stat-card">
          <strong className="stat-card__value">{total - completed}</strong>
          <span className="stat-card__label">Chưa hoàn thành</span>
        </div>
        <div className="stat-card">
          <strong className="stat-card__value">{total}</strong>
          <span className="stat-card__label">Tổng task</span>
        </div>
      </div>

      <div className="stats__charts">
        <div className="stats__card">
          <h3 className="stats__card-title">Tỉ lệ hoàn thành</h3>
          <div className="stats__donut-row">
            <DonutChart
              slices={[
                { label: "Đã xong", value: completed, color: STATUS_COLORS.done },
                { label: "Đang làm", value: doing, color: STATUS_COLORS.doing },
                { label: "Quá hạn", value: overdue, color: STATUS_COLORS.overdue },
              ]}
              centerValue={`${progress}%`}
              centerLabel="tiến độ"
            />
            <ul className="stats__legend">
              <li>
                <span className="legend-dot" style={{ background: STATUS_COLORS.done }} />
                Đã xong: <strong>{completed}</strong>
              </li>
              <li>
                <span className="legend-dot" style={{ background: STATUS_COLORS.doing }} />
                Đang làm: <strong>{doing}</strong>
              </li>
              <li>
                <span className="legend-dot" style={{ background: STATUS_COLORS.overdue }} />
                Quá hạn: <strong>{overdue}</strong>
              </li>
            </ul>
          </div>
        </div>

        <div className="stats__card">
          <h3 className="stats__card-title">Việc hoàn thành 7 ngày qua</h3>
          <LineChart points={linePoints} />
        </div>
      </div>
    </section>
  );
}
