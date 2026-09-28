"use client";

import { useMemo } from "react";
import type { SavedItem } from "@/lib/storage";
import { parseDeadlineDate } from "@/lib/storage";

type Props = {
  items: SavedItem[];
  onDelete: (id: string) => void;
};

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const PRIORITY_CONFIG = {
  high: {
    label: "High Priority",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700 border-red-200",
    row: "hover:bg-red-50",
    heading: "text-red-600",
  },
  medium: {
    label: "Medium Priority",
    dot: "bg-amber-400",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    row: "hover:bg-amber-50",
    heading: "text-amber-600",
  },
  low: {
    label: "Low Priority",
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-700 border-green-200",
    row: "hover:bg-slate-50",
    heading: "text-green-600",
  },
};

function formatDeadline(item: SavedItem): { text: string; urgent: boolean } {
  const d = parseDeadlineDate(item.result.deadline);
  if (!d) {
    const raw = item.result.deadline?.raw;
    return { text: raw ?? "—", urgent: false };
  }
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / 86400000);
  const label =
    diffDays < 0
      ? "Overdue"
      : diffDays === 0
      ? "Today"
      : diffDays === 1
      ? "Tomorrow"
      : diffDays <= 7
      ? `${diffDays}d left`
      : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return { text: label, urgent: diffDays <= 3 && diffDays >= 0 };
}

export default function PriorityPlan({ items, onDelete }: Props) {
  const sorted = useMemo(
    () =>
      [...items].sort((a, b) => {
        const pDiff = PRIORITY_ORDER[a.result.priority] - PRIORITY_ORDER[b.result.priority];
        if (pDiff !== 0) return pDiff;
        const da = parseDeadlineDate(a.result.deadline)?.getTime() ?? Infinity;
        const db = parseDeadlineDate(b.result.deadline)?.getTime() ?? Infinity;
        return da - db;
      }),
    [items]
  );

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-500">No saved items yet</p>
        <p className="text-xs mt-1 text-slate-400">Analyse a message and save it to see your priority plan</p>
      </div>
    );
  }

  // Group by priority
  const groups: Record<string, SavedItem[]> = { high: [], medium: [], low: [] };
  for (const item of sorted) groups[item.result.priority].push(item);

  return (
    <div className="space-y-6">
      {(["high", "medium", "low"] as const).map((p) => {
        const group = groups[p];
        if (group.length === 0) return null;
        const cfg = PRIORITY_CONFIG[p];
        return (
          <section key={p} aria-label={`${cfg.label} items`}>
            {/* Section heading */}
            <div className="flex items-center gap-2 mb-2.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} aria-hidden="true" />
              <h3 className={`text-xs font-bold uppercase tracking-widest ${cfg.heading}`}>
                {cfg.label}
              </h3>
              <span className="text-xs text-slate-300 font-medium">({group.length})</span>
            </div>

            {/* Items */}
            <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
              {group.map((item) => {
                const dl = formatDeadline(item);
                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 px-4 py-3.5 transition-colors duration-150 ${cfg.row}`}
                  >
                    {/* Priority dot */}
                    <span className={`shrink-0 w-2 h-2 rounded-full mt-2 ${cfg.dot}`} aria-hidden="true" />

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-snug truncate">
                        {item.result.primaryAction ?? item.result.summary}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {item.result.type}
                        {item.inputSnippet && (
                          <> · {item.inputSnippet.slice(0, 55)}{item.inputSnippet.length > 55 ? "…" : ""}</>
                        )}
                      </p>
                    </div>

                    {/* Deadline */}
                    <div className="shrink-0 text-right">
                      <span
                        className={`text-xs font-semibold tabular-nums ${
                          dl.text === "Overdue"
                            ? "text-slate-400"
                            : dl.urgent
                            ? "text-red-600"
                            : "text-slate-500"
                        }`}
                      >
                        {dl.text}
                      </span>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(item.id)}
                      className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors duration-150 cursor-pointer ml-1 focus:outline-none focus:ring-2 focus:ring-red-300"
                      aria-label={`Remove: ${item.result.primaryAction ?? item.result.summary}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <path d="M18 6 6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
