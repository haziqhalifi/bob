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
      <div className="text-center py-16 text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-500">No saved items yet</p>
        <p className="text-xs mt-1 text-slate-400">Analyse a message and save it to see the Gantt timeline</p>
      </div>
    );
  }

  if (datable.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-500">No deadline dates found</p>
        <p className="text-xs mt-1 text-slate-400">Items need a parseable date deadline to appear on the timeline</p>
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

  // Weekly tick marks
  const ticks: Date[] = [];
  const tick = new Date(today);
  tick.setDate(tick.getDate() + 7);
  while (tick <= windowEnd) {
    ticks.push(new Date(tick));
    tick.setDate(tick.getDate() + 7);
  }

  return (
    <div className="space-y-5">
      {/* Window header */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-semibold text-slate-500 flex items-center gap-1.5">
          <span className="w-0.5 h-3.5 bg-blue-500 rounded-full" aria-hidden="true" />
          Today — {formatShortDate(today)}
        </span>
        <span>{formatShortDate(windowEnd)}</span>
      </div>

      {/* Timeline ruler */}
      <div className="relative h-5 border-b border-slate-200">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-full" aria-hidden="true" />
        {ticks.map((t, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 flex flex-col items-center"
            style={{ left: `${pct(t)}%` }}
            aria-hidden="true"
          >
            <div className="w-px h-2 bg-slate-200" />
            <span className="text-[9px] text-slate-300 whitespace-nowrap mt-0.5 font-medium">
              {formatShortDate(t)}
            </span>
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {datable.map(({ item, deadline }) => {
          const endPct = pct(deadline);
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / 86400000);
          const isOverdue = diffDays < 0;
          const isUrgent = diffDays >= 0 && diffDays <= 3;
          const barColor = isOverdue ? "bg-slate-300" : PRIORITY_BAR[item.result.priority];

          return (
            <div key={item.id}>
              {/* Label row */}
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <p className="text-xs font-medium text-slate-700 truncate flex-1 min-w-0 leading-snug">
                  {item.result.primaryAction ?? item.result.summary}
                </p>
                <span
                  className={`shrink-0 text-xs font-semibold tabular-nums ${
                    isOverdue
                      ? "text-slate-400"
                      : isUrgent
                      ? "text-red-600"
                      : PRIORITY_LABEL[item.result.priority]
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
              <div
                className="relative h-5 bg-slate-100 rounded-full overflow-hidden"
                role="meter"
                aria-label={`${item.result.primaryAction ?? item.result.summary}: ${Math.round(endPct)}% of timeline`}
                aria-valuenow={Math.round(endPct)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                {/* Progress bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 rounded-full transition-all ${barColor} opacity-85`}
                  style={{ width: `${Math.max(endPct, 1.5)}%` }}
                />
                {/* Today line */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 z-10" aria-hidden="true" />
                {/* Deadline marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-500 opacity-30 z-10"
                  style={{ left: `${endPct}%` }}
                  aria-hidden="true"
                />
                {/* Date label inside bar */}
                {endPct > 20 && (
                  <span className="absolute right-2 top-0 bottom-0 flex items-center text-[10px] font-semibold text-white opacity-90">
                    {formatShortDate(deadline)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Items without dates */}
      {undatable.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
            No date set
          </p>
          <div className="space-y-1.5">
            {undatable.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-xs text-slate-500">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_BAR[item.result.priority]}`}
                  aria-hidden="true"
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
      <div className="flex items-center gap-4 text-xs text-slate-400 pt-1" aria-label="Priority legend">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2 rounded bg-red-500 opacity-85" aria-hidden="true" />High</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2 rounded bg-amber-400 opacity-85" aria-hidden="true" />Medium</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2 rounded bg-green-500 opacity-85" aria-hidden="true" />Low</span>
        <span className="flex items-center gap-1.5"><span className="w-0.5 h-3 bg-blue-500 rounded-full" aria-hidden="true" />Today</span>
      </div>
    </div>
  );
}
