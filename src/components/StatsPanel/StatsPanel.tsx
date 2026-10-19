import { useEffect, useRef } from "react";
import type { Task } from "../../types/task";
import { computePeriodStats, computeStats } from "../../utils/stats";
import { BarChart } from "../Charts/BarChart";
import { DonutChart } from "../Charts/DonutChart";
import "./StatsPanel.css";

interface StatsPanelProps {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  now: number;
}

const DONE_COLOR = "#2f9e6e"; // đã xong
const PENDING_COLOR = "#e5a13a"; // chưa xong (còn nợ)
const OVERDUE_COLOR = "#e5484d"; // quá hạn

/**
 * Modal "Thống kê" mở từ nút ở taskbar:
 * - 4 số liệu nhanh (xong hôm nay / quá hạn / tổng / tiến độ).
 * - Bar chart nhóm: việc làm được vs chưa làm được theo Hôm nay / Tuần / Tháng.
 * - Bar chart 7 ngày + 4 tuần (số việc hoàn thành).
 * - Donut tỉ lệ toàn bộ task.
 */
export function StatsPanel({ open, onClose, tasks, now }: StatsPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Đóng bằng phím Escape + tự focus nút đóng khi mở.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const stats = computeStats(tasks, now);
  const periods = computePeriodStats(tasks, now);

  return (
    <div
      className="stats-panel__backdrop"
      onClick={onClose}
      role="presentation"
    >
      <section
        className="stats-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-panel-title"
        onClick={(e) => e.stopPropagation()} // click trong modal không đóng
      >
        <header className="stats-panel__head">
          <h2 id="stats-panel-title" className="stats-panel__title">
            Thống kê công việc
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="stats-panel__close"
            onClick={onClose}
            aria-label="Đóng thống kê"
          >
            ×
          </button>
        </header>

        <div className="stats-panel__numbers">
          <div className="stats-panel__num">
            <strong>{stats.doneToday}</strong>
            <span>Xong hôm nay</span>
          </div>
          <div className="stats-panel__num">
            <strong>{stats.doneThisMonth}</strong>
            <span>Xong tháng này</span>
          </div>
          <div className="stats-panel__num">
            <strong>{stats.overdue}</strong>
            <span>Quá hạn</span>
          </div>
          <div className="stats-panel__num">
            <strong>{stats.progress}%</strong>
            <span>Tiến độ</span>
          </div>
        </div>

        <section className="stats-panel__block">
          <h3 className="stats-panel__subtitle">
            Làm được và chưa làm được theo kỳ
          </h3>
          <BarChart
            categories={periods.map((p) => p.label)}
            series={[
              {
                label: "Đã xong",
                color: DONE_COLOR,
                values: periods.map((p) => p.done),
              },
              {
                label: "Chưa xong",
                color: PENDING_COLOR,
                values: periods.map((p) => p.pending),
              },
            ]}
            height={160}
          />
          <ul className="chart-legend">
            <li>
              <span className="legend-dot" style={{ background: DONE_COLOR }} />
              Đã xong trong kỳ
            </li>
            <li>
              <span className="legend-dot" style={{ background: PENDING_COLOR }} />
              Còn nợ (hạn trong kỳ, chưa xong)
            </li>
          </ul>
        </section>

        <section className="stats-panel__block">
          <h3 className="stats-panel__subtitle">Việc xong 7 ngày qua</h3>
          <BarChart
            categories={stats.linePoints.map((p) => p.label)}
            series={[
              {
                label: "Đã xong",
                color: DONE_COLOR,
                values: stats.linePoints.map((p) => p.value),
              },
            ]}
            height={130}
          />
        </section>

        <section className="stats-panel__block">
          <h3 className="stats-panel__subtitle">Việc xong 4 tuần qua</h3>
          <BarChart
            categories={stats.weeklyPoints.map((p) => p.label)}
            series={[
              {
                label: "Đã xong",
                color: DONE_COLOR,
                values: stats.weeklyPoints.map((p) => p.value),
              },
            ]}
            height={130}
          />
        </section>

        <section className="stats-panel__block stats-panel__donut">
          <DonutChart
            slices={[
              { label: "Đã xong", value: stats.completed, color: DONE_COLOR },
              { label: "Đang làm", value: stats.doing, color: "#3b6ef6" },
              { label: "Quá hạn", value: stats.overdue, color: OVERDUE_COLOR },
            ]}
            centerValue={`${stats.progress}%`}
            centerLabel="tiến độ"
            size={120}
            thickness={15}
          />
          <ul className="chart-legend">
            <li>
              <span className="legend-dot" style={{ background: DONE_COLOR }} />
              Đã xong: <strong>{stats.completed}</strong>
            </li>
            <li>
              <span className="legend-dot" style={{ background: "#3b6ef6" }} />
              Đang làm: <strong>{stats.doing}</strong>
            </li>
            <li>
              <span className="legend-dot" style={{ background: OVERDUE_COLOR }} />
              Quá hạn: <strong>{stats.overdue}</strong>
            </li>
          </ul>
        </section>
      </section>
    </div>
  );
}
