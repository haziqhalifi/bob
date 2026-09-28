"use client";

import { useState, useMemo } from "react";
import type { SavedItem } from "@/lib/storage";
import { parseDeadlineDate } from "@/lib/storage";

type Props = {
  items: SavedItem[];
};

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-green-500",
};

const PRIORITY_CARD: Record<string, string> = {
  high: "border-red-200 bg-red-50 text-red-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  low: "border-green-200 bg-green-50 text-green-800",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function CalendarView({ items }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState<string | null>(null);

  // Map dateKey → SavedItem[]
  const byDate = useMemo(() => {
    const map: Record<string, SavedItem[]> = {};
    for (const item of items) {
      const d = parseDeadlineDate(item.result.deadline);
      if (!d) continue;
      const key = toDateKey(d);
      if (!map[key]) map[key] = [];
      map[key].push(item);
    }
    return map;
  }, [items]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelected(null);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelected(null);
  }

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedItems = selected ? (byDate[selected] ?? []) : [];

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-500">No saved items yet</p>
        <p className="text-xs mt-1 text-slate-400">Analyse a message and save it to see deadlines on calendar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors duration-150 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300"
          aria-label="Previous month"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h3 className="text-sm font-bold text-slate-800">
          {MONTHS[month]} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors duration-150 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300"
          aria-label="Next month"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const key = `${year}-${month}-${day}`;
          const dayItems = byDate[key] ?? [];
          const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;
          const isSelected = selected === key;

          return (
            <button
              key={i}
              onClick={() => setSelected(isSelected ? null : key)}
              aria-pressed={isSelected}
              aria-label={`${MONTHS[month]} ${day}${dayItems.length > 0 ? `, ${dayItems.length} item${dayItems.length > 1 ? "s" : ""}` : ""}`}
              className={[
                "relative min-h-[40px] rounded-lg p-1 text-xs text-left transition-all duration-150 border cursor-pointer",
                isSelected
                  ? "border-blue-400 bg-blue-50 shadow-sm"
                  : "border-transparent hover:border-slate-200 hover:bg-slate-50",
                isToday ? "font-bold" : "",
              ].join(" ")}
            >
              <span className={[
                "block text-center text-xs leading-tight",
                isToday
                  ? "text-white bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center mx-auto text-[10px]"
                  : isSelected
                  ? "text-blue-700"
                  : "text-slate-700",
              ].join(" ")}>
                {day}
              </span>
              {/* Priority dots */}
              {dayItems.length > 0 && (
                <div className="flex justify-center gap-0.5 mt-1 flex-wrap">
                  {dayItems.slice(0, 3).map((item, j) => (
                    <span
                      key={j}
                      className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[item.result.priority]}`}
                    />
                  ))}
                  {dayItems.length > 3 && (
                    <span className="text-[8px] text-slate-400 font-medium">+{dayItems.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-400 pt-1" aria-label="Priority legend">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" aria-hidden="true" />High</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />Medium</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />Low</span>
      </div>

      {/* Selected day detail */}
      {selected && selectedItems.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
            Due on this day
          </p>
          {selectedItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-lg border px-3 py-2.5 text-xs ${PRIORITY_CARD[item.result.priority]}`}
            >
              <p className="font-semibold leading-snug">
                {item.result.primaryAction ?? item.result.summary}
              </p>
              <p className="opacity-60 mt-0.5">{item.result.type}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
