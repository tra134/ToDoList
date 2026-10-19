import type { Task } from "../../types/task";
import { computeStats } from "../../utils/stats";
import { DonutChart } from "../Charts/DonutChart";
import { LineChart } from "../Charts/LineChart";
import "./SidebarStats.css";

interface SidebarStatsProps {
  tasks: Task[];
  now: number;
}

const STATUS_COLORS = {
  done: "#2f9e6e",
  doing: "#3b6ef6",
  overdue: "#e5484d",
} as const;

/**
 * Khối thống kê ở trên cùng của sidebar:
 * biểu đồ tròn (tỉ lệ) + 4 số liệu + biểu đồ đường 7 ngày.
 */
export function SidebarStats({ tasks, now }: SidebarStatsProps) {
  const stats = computeStats(tasks, now);

  return (
    <section className="side-stats" aria-label="Thống kê công việc">
      <div className="side-stats__numbers">
        <div className="side-stats__num">
          <strong>{stats.doneToday}</strong>
          <span>Xong hôm nay</span>
        </div>
        <div className="side-stats__num">
          <strong>{stats.doneThisMonth}</strong>
          <span>Xong tháng này</span>
        </div>
        <div className="side-stats__num">
          <strong>{stats.total - stats.completed}</strong>
          <span>Chưa xong</span>
        </div>
        <div className="side-stats__num">
          <strong>{stats.overdue}</strong>
          <span>Quá hạn</span>
        </div>
      </div>

      <div className="side-stats__donut">
        <DonutChart
          slices={[
            { label: "Đã xong", value: stats.completed, color: STATUS_COLORS.done },
            { label: "Đang làm", value: stats.doing, color: STATUS_COLORS.doing },
            { label: "Quá hạn", value: stats.overdue, color: STATUS_COLORS.overdue },
          ]}
          centerValue={`${stats.progress}%`}
          centerLabel="tiến độ"
          size={124}
          thickness={16}
        />
        <ul className="side-stats__legend">
          <li>
            <span className="legend-dot" style={{ background: STATUS_COLORS.done }} />
            Đã xong: <strong>{stats.completed}</strong>
          </li>
          <li>
            <span className="legend-dot" style={{ background: STATUS_COLORS.doing }} />
            Đang làm: <strong>{stats.doing}</strong>
          </li>
          <li>
            <span className="legend-dot" style={{ background: STATUS_COLORS.overdue }} />
            Quá hạn: <strong>{stats.overdue}</strong>
          </li>
        </ul>
      </div>

      <div className="side-stats__line">
        <h3 className="side-stats__title">Hoàn thành 7 ngày qua</h3>
        <LineChart points={stats.linePoints} height={110} />
      </div>
    </section>
  );
}
