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
    label: "HIGH",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700 border-red-200",
    row: "border-red-100 hover:bg-red-50",
  },
  medium: {
    label: "MED",
    dot: "bg-amber-400",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    row: "border-amber-50 hover:bg-amber-50",
  },
  low: {
    label: "LOW",
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-700 border-green-200",
    row: "border-gray-100 hover:bg-gray-50",
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
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-sm font-medium text-gray-500">No saved items yet</p>
        <p className="text-xs mt-1">Analyse a message and save it to see your priority plan</p>
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
          <section key={p}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {p === "high" ? "🔴 High Priority" : p === "medium" ? "🟡 Medium Priority" : "🟢 Low Priority"}
              </h3>
              <span className="text-xs text-gray-300">({group.length})</span>
            </div>
            <div className="rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
              {group.map((item) => {
                const dl = formatDeadline(item);
                return (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 px-4 py-3 transition-colors ${cfg.row}`}
                  >
                    {/* Priority badge */}
                    <span
                      className={`shrink-0 mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded border ${cfg.badge}`}
                    >
                      {cfg.label}
                    </span>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 leading-snug truncate">
                        {item.result.primaryAction ?? item.result.summary}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {item.result.type} · {item.inputSnippet.slice(0, 60)}…
                      </p>
                    </div>

                    {/* Deadline */}
                    <div className="shrink-0 text-right">
                      <span
                        className={`text-xs font-semibold ${
                          dl.urgent ? "text-red-600" : "text-gray-500"
                        }`}
                      >
                        {dl.text}
                      </span>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => onDelete(item.id)}
                      className="shrink-0 text-gray-300 hover:text-red-400 transition-colors text-sm ml-1"
                      aria-label="Remove item"
                    >
                      ✕
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
