import type { AnalysisResult } from "@/types/analysis";

// ─── Types ──────────────────────────────────────────────────────────────────────

export type SavedItem = {
  id: string;
  savedAt: string; // ISO string
  inputSnippet: string; // first 120 chars of original input
  result: AnalysisResult;
};

const STORAGE_KEY = "nextstep_items";

// ─── Helpers ────────────────────────────────────────────────────────────────────

function load(): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedItem[]) : [];
  } catch {
    return [];
  }
}

function save(items: SavedItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ─── Public API ─────────────────────────────────────────────────────────────────

export function getItems(): SavedItem[] {
  return load().sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );
}

export function addItem(result: AnalysisResult, inputSnippet: string): SavedItem {
  const items = load();
  const item: SavedItem = {
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    inputSnippet: inputSnippet.slice(0, 120),
    result,
  };
  save([item, ...items]);
  return item;
}

export function removeItem(id: string): void {
  const items = load().filter((i) => i.id !== id);
  save(items);
}

export function clearAll(): void {
  save([]);
}

// ─── Date parsing ────────────────────────────────────────────────────────────────
// Try to get a JS Date from normalized or raw deadline string.
// Returns null if unparseable.

export function parseDeadlineDate(deadline: { normalized: string | null; raw: string } | null): Date | null {
  if (!deadline) return null;
  const str = deadline.normalized ?? deadline.raw;
  if (!str) return null;

  // Try direct parse first
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;

  // Try stripping ordinal suffixes: "30 September 2026" etc.
  const cleaned = str.replace(/(\d+)(st|nd|rd|th)/gi, "$1");
  const d2 = new Date(cleaned);
  if (!isNaN(d2.getTime())) return d2;

  return null;
}
