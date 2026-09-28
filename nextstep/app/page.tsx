"use client";

import { useState, useRef } from "react";
import type { AnalysisResult } from "@/types/analysis";
import { EXAMPLES } from "@/lib/examples";
import { addItem, getItems, removeItem, clearAll } from "@/lib/storage";
import type { SavedItem } from "@/lib/storage";
import ResultCard from "@/components/ResultCard";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import PriorityPlan from "@/components/PriorityPlan";
import CalendarView from "@/components/CalendarView";
import GanttView from "@/components/GanttView";

const LOADING_STEPS = [
  "Understanding your information...",
  "Finding important actions...",
  "Checking deadlines...",
  "Assessing priority...",
  "Building your next steps...",
];

type Tab = "analyse" | "plan" | "calendar" | "gantt";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "analyse",
    label: "Analyse",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    id: "plan",
    label: "Priority Plan",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
  {
    id: "calendar",
    label: "Calendar",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    id: "gantt",
    label: "Timeline",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
  },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("analyse");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<SavedItem[]>(getItems);
  const [justSaved, setJustSaved] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  function refreshItems() {
    setSavedItems(getItems());
  }

  async function handleAnalyse() {
    if (!input.trim()) {
      setInputError("Please paste a message or text to analyse.");
      return;
    }
    setInputError(null);
    setError(null);
    setResult(null);
    setLoading(true);
    setLoadingStep(0);
    setJustSaved(false);

    const interval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 700);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setResult(data.result);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setError("We couldn't reach the analysis service. Please check your connection and try again.");
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  function handleSave() {
    if (!result) return;
    addItem(result, input);
    refreshItems();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  }

  function handleDelete(id: string) {
    removeItem(id);
    refreshItems();
  }

  function handleClearAll() {
    if (!confirm("Clear all saved items?")) return;
    clearAll();
    refreshItems();
  }

  function handleExample(id: string) {
    const example = EXAMPLES.find((e) => e.id === id);
    if (example) {
      setInput(example.text);
      setResult(null);
      setError(null);
      setInputError(null);
      setJustSaved(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleAnalyse();
    }
  }

  return (
    <>
      {/* ── Skip link (accessibility) ─────────────────────────────── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-white focus:text-blue-700 focus:font-semibold focus:text-sm focus:px-3 focus:py-1.5 focus:rounded-lg focus:border focus:border-blue-300 focus:shadow-sm"
      >
        Skip to main content
      </a>

      <main id="main-content" className="min-h-screen bg-white">

        {/* ── Header ──────────────────────────────────────────────── */}
        <header className="border-b border-slate-100 px-4 py-3.5 sticky top-0 bg-white/95 backdrop-blur-sm z-20">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/>
                </svg>
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">NextStep</span>
              <span className="hidden sm:inline text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                Beta
              </span>
            </div>
            <div className="flex items-center gap-3">
              {savedItems.length > 0 && (
                <span className="text-[11px] text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-semibold">
                  {savedItems.length} saved
                </span>
              )}
              <span className="text-xs text-slate-400 hidden sm:inline">Turn information into action</span>
            </div>
          </div>
        </header>

        {/* ── Tab Bar ──────────────────────────────────────────────── */}
        <div className="border-b border-slate-100 bg-white sticky top-[57px] z-10">
          <div className="max-w-2xl mx-auto px-4">
            <div
              role="tablist"
              aria-label="Navigation"
              className="flex gap-0 overflow-x-auto scrollbar-hide"
            >
              {TABS.map((t) => {
                const isActive = tab === t.id;
                const showBadge =
                  (t.id === "plan" || t.id === "calendar" || t.id === "gantt") &&
                  savedItems.length > 0;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setTab(t.id)}
                    className={[
                      "flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all duration-150 cursor-pointer",
                      isActive
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200",
                    ].join(" ")}
                  >
                    {t.icon}
                    {t.label}
                    {showBadge && (
                      <span className="ml-0.5 text-[10px] bg-blue-100 text-blue-600 rounded-full px-1.5 py-0.5 font-bold leading-none">
                        {savedItems.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8">

          {/* ══════════════════════════════════════════════════════════
              TAB: ANALYSE
          ══════════════════════════════════════════════════════════ */}
          {tab === "analyse" && (
            <>
              {/* Hero */}
              <section className="mb-8 text-center" aria-labelledby="hero-heading">
                <h1
                  id="hero-heading"
                  className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight leading-tight"
                >
                  Turn Information Into Action
                </h1>
                <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
                  Paste any message, email, notice or instruction and instantly understand
                  what matters and what to do next.
                </p>
              </section>

              {/* Input Area */}
              <section aria-label="Input">
                <label
                  htmlFor="message-input"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Your message or text
                </label>
                <textarea
                  id="message-input"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Paste a message, email, notice or anything you received..."
                  rows={7}
                  className={[
                    "w-full rounded-xl border px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400",
                    "resize-none transition-all duration-150 bg-slate-50 leading-relaxed",
                    "focus:outline-none focus:ring-2 focus:bg-white",
                    inputError
                      ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                      : "border-slate-200 focus:ring-blue-200 focus:border-blue-400",
                  ].join(" ")}
                  aria-describedby={inputError ? "input-error" : "input-hint"}
                  aria-invalid={!!inputError}
                />
                <p id="input-hint" className="sr-only">
                  Press Command plus Enter or Control plus Enter to analyse
                </p>

                {inputError && (
                  <p id="input-error" role="alert" className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {inputError}
                  </p>
                )}

                <div className="mt-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <button
                    onClick={handleAnalyse}
                    disabled={loading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                    aria-busy={loading}
                  >
                    {loading ? (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" className="animate-spin">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                        </svg>
                        Analysing...
                      </>
                    ) : (
                      <>
                        Find My Next Step
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </>
                    )}
                  </button>
                  <span className="text-xs text-slate-400 hidden sm:flex items-center gap-1" aria-hidden="true">
                    <kbd className="font-mono bg-slate-100 text-slate-500 text-[11px] px-1.5 py-0.5 rounded border border-slate-200">⌘</kbd>
                    <span>+</span>
                    <kbd className="font-mono bg-slate-100 text-slate-500 text-[11px] px-1.5 py-0.5 rounded border border-slate-200">↵</kbd>
                  </span>
                </div>
              </section>

              {/* Examples */}
              <section aria-label="Try an example" className="mt-6">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
                  Try an example
                </p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => handleExample(ex.id)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-full transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300"
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </section>

              <div className="mt-10 border-t border-slate-100" />

              {/* States */}
              <div ref={resultRef} className="mt-8">
                {loading && <LoadingState step={LOADING_STEPS[loadingStep]} />}

                {!loading && error && (
                  <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 flex gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-red-500 mt-0.5" aria-hidden="true">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-red-700 mb-0.5">Analysis failed</p>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                )}

                {!loading && !error && !result && <EmptyState />}

                {!loading && !error && result && (
                  <div>
                    {/* Save to plan banner */}
                    <div className="flex items-center justify-between mb-4 px-1">
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-green-500">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Analysis complete
                      </p>
                      {!result.noActionRequired && (
                        <button
                          onClick={handleSave}
                          disabled={justSaved}
                          className={[
                            "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all duration-150 cursor-pointer",
                            justSaved
                              ? "bg-green-50 border-green-200 text-green-700"
                              : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50",
                          ].join(" ")}
                        >
                          {justSaved ? (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                              Saved to Plan
                            </>
                          ) : (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                              </svg>
                              Save to Plan
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <ResultCard result={result} />
                  </div>
                )}
              </div>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB: PRIORITY PLAN
          ══════════════════════════════════════════════════════════ */}
          {tab === "plan" && (
            <div role="tabpanel" aria-label="Priority Plan">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Priority Plan</h2>
                  <p className="text-sm text-slate-400 mt-0.5">
                    All your saved items ranked by priority and deadline
                  </p>
                </div>
                {savedItems.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors duration-150 cursor-pointer focus:outline-none focus:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <PriorityPlan items={savedItems} onDelete={handleDelete} />
              {savedItems.length === 0 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setTab("analyse")}
                    className="text-sm text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    ← Go analyse something
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB: CALENDAR
          ══════════════════════════════════════════════════════════ */}
          {tab === "calendar" && (
            <div role="tabpanel" aria-label="Calendar">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Calendar</h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  See all your deadlines at a glance
                </p>
              </div>
              <CalendarView items={savedItems} />
              {savedItems.length === 0 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setTab("analyse")}
                    className="text-sm text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    ← Go analyse something
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB: GANTT / TIMELINE
          ══════════════════════════════════════════════════════════ */}
          {tab === "gantt" && (
            <div role="tabpanel" aria-label="Timeline">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Timeline</h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Visualise how much time you have left for each item
                </p>
              </div>
              <GanttView items={savedItems} />
              {savedItems.length === 0 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setTab("analyse")}
                    className="text-sm text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    ← Go analyse something
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <footer className="border-t border-slate-100 mt-16 py-6 text-center text-xs text-slate-400">
          <p>NextStep · Built for IBM Bobathon</p>
        </footer>
      </main>
    </>
  );
}
