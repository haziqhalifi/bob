"use client";

import type { SavedItem } from "@/lib/storage";
import { parseDeadlineDate } from "@/lib/storage";

type Props = {
  items: SavedItem[];
};

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const PRIORITY_BAR: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-green-500",
};

const PRIORITY_LABEL: Record<string, string> = {
  high: "text-red-600",
  medium: "text-amber-600",
  low: "text-green-600",
};

function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function GanttView({ items }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Only items with parseable deadlines
  const datable = items
    .map((item) => ({ item, deadline: parseDeadlineDate(item.result.deadline) }))
    .filter((x): x is { item: SavedItem; deadline: Date } => x.deadline !== null)
    .sort((a, b) => {
      const pDiff =
        PRIORITY_ORDER[a.item.result.priority] - PRIORITY_ORDER[b.item.result.priority];
      if (pDiff !== 0) return pDiff;
      return a.deadline.getTime() - b.deadline.getTime();
    });

  const undatable = items.filter((item) => parseDeadlineDate(item.result.deadline) === null);

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-sm font-medium text-gray-500">No saved items yet</p>
        <p className="text-xs mt-1">Analyse a message and save it to see the Gantt timeline</p>
      </div>
    );
  }

  if (datable.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-sm font-medium text-gray-500">No deadline dates found</p>
        <p className="text-xs mt-1">Items need a parseable date deadline to appear on the Gantt chart</p>
      </div>
    );
  }

  // Timeline window: today → furthest deadline (min 14 days)
  const maxDeadline = datable.reduce(
    (max, x) => (x.deadline > max ? x.deadline : max),
    datable[0].deadline
  );
  const windowEnd = new Date(Math.max(maxDeadline.getTime(), today.getTime() + 14 * 86400000));
  const totalMs = windowEnd.getTime() - today.getTime();

  function pct(date: Date): number {
    const ms = Math.max(0, Math.min(date.getTime() - today.getTime(), totalMs));
    return (ms / totalMs) * 100;
  }

  // Build tick marks (weekly)
  const ticks: Date[] = [];
  const tick = new Date(today);
  tick.setDate(tick.getDate() + 7);
  while (tick <= windowEnd) {
    ticks.push(new Date(tick));
    tick.setDate(tick.getDate() + 7);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span className="font-semibold text-gray-500">Today — {formatShortDate(today)}</span>
        <span>{formatShortDate(windowEnd)}</span>
      </div>

      {/* Timeline ruler */}
      <div className="relative h-4 border-b border-gray-200">
        {/* Today marker */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-blue-400" />
        {ticks.map((t, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 flex flex-col items-center"
            style={{ left: `${pct(t)}%` }}
          >
            <div className="w-px h-2 bg-gray-200" />
            <span className="text-[9px] text-gray-300 whitespace-nowrap mt-0.5">
              {formatShortDate(t)}
            </span>
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {datable.map(({ item, deadline }) => {
          const endPct = pct(deadline);
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / 86400000);
          const isOverdue = diffDays < 0;
          const isUrgent = diffDays >= 0 && diffDays <= 3;
          const barColor = isOverdue ? "bg-gray-400" : PRIORITY_BAR[item.result.priority];

          return (
            <div key={item.id} className="group">
              {/* Label */}
              <div className="flex items-center justify-between mb-1 gap-2">
                <p className="text-xs font-medium text-gray-700 truncate flex-1 min-w-0">
                  {item.result.primaryAction ?? item.result.summary}
                </p>
                <span
                  className={`shrink-0 text-xs font-semibold ${
                    isOverdue ? "text-gray-400" : isUrgent ? "text-red-600" : PRIORITY_LABEL[item.result.priority]
                  }`}
                >
                  {isOverdue
                    ? "Overdue"
                    : diffDays === 0
                    ? "Today"
                    : diffDays === 1
                    ? "Tomorrow"
                    : `${diffDays}d`}
                </span>
              </div>

              {/* Bar track */}
              <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden">
                {/* Bar from 0 → deadline */}
                <div
                  className={`absolute left-0 top-0 bottom-0 rounded-full transition-all ${barColor} opacity-80`}
                  style={{ width: `${Math.max(endPct, 1)}%` }}
                />
                {/* Today line */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 z-10" />
                {/* Deadline marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-gray-500 opacity-40 z-10"
                  style={{ left: `${endPct}%` }}
                />
                {/* Deadline date label inside bar */}
                <span
                  className="absolute right-2 top-0 bottom-0 flex items-center text-[10px] font-medium text-white opacity-90"
                  style={{ display: endPct > 20 ? "flex" : "none" }}
                >
                  {formatShortDate(deadline)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Items without dates */}
      {undatable.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            No date set
          </p>
          <div className="space-y-1">
            {undatable.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-xs text-gray-500">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_BAR[item.result.priority]}`}
                />
                <span className="truncate">
                  {item.result.primaryAction ?? item.result.summary}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2 rounded bg-red-500 opacity-80" />High</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2 rounded bg-amber-400 opacity-80" />Medium</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2 rounded bg-green-500 opacity-80" />Low</span>
        <span className="flex items-center gap-1"><span className="w-0.5 h-3 bg-blue-500" />Today</span>
      </div>
    </div>
  );
}
