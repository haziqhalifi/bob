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
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedItems = selected ? (byDate[selected] ?? []) : [];

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📅</p>
        <p className="text-sm font-medium text-gray-500">No saved items yet</p>
        <p className="text-xs mt-1">Analyse a message and save it to see deadlines on calendar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="Previous month"
        >
          ‹
        </button>
        <h3 className="text-sm font-bold text-gray-800">
          {MONTHS[month]} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase py-1">
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
              className={`relative min-h-[40px] rounded-lg p-1 text-xs text-left transition-all border
                ${isSelected ? "border-blue-400 bg-blue-50" : "border-transparent hover:border-gray-200 hover:bg-gray-50"}
                ${isToday ? "font-bold text-blue-600" : "text-gray-700"}
              `}
            >
              <span className={`block text-center text-xs leading-tight ${isToday ? "text-blue-600" : ""}`}>
                {day}
              </span>
              {/* Priority dots */}
              {dayItems.length > 0 && (
                <div className="flex justify-center gap-0.5 mt-0.5 flex-wrap">
                  {dayItems.slice(0, 3).map((item, j) => (
                    <span
                      key={j}
                      className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[item.result.priority]}`}
                    />
                  ))}
                  {dayItems.length > 3 && (
                    <span className="text-[8px] text-gray-400">+{dayItems.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />High</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Medium</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Low</span>
      </div>

      {/* Selected day detail */}
      {selected && selectedItems.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
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
