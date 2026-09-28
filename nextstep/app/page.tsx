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

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "analyse", label: "Analyse", icon: "✦" },
  { id: "plan", label: "Priority Plan", icon: "📋" },
  { id: "calendar", label: "Calendar", icon: "📅" },
  { id: "gantt", label: "Timeline", icon: "📊" },
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
    <main className="min-h-screen bg-white">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <header className="border-b border-gray-100 px-4 py-4 sticky top-0 bg-white z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900 tracking-tight">NextStep</span>
            <span className="hidden sm:inline text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
              Beta
            </span>
          </div>
          <div className="flex items-center gap-3">
            {savedItems.length > 0 && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                {savedItems.length} saved
              </span>
            )}
            <span className="text-xs text-gray-400 hidden sm:inline">Turn information into action</span>
          </div>
        </div>
      </header>

      {/* ─── Tab Bar ─────────────────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-white sticky top-[61px] z-10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  tab === t.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
                }`}
              >
                <span aria-hidden="true">{t.icon}</span>
                {t.label}
                {(t.id === "plan" || t.id === "calendar" || t.id === "gantt") &&
                  savedItems.length > 0 && (
                    <span className="ml-0.5 text-[10px] bg-blue-100 text-blue-600 rounded-full px-1.5 py-0.5 font-bold">
                      {savedItems.length}
                    </span>
                  )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* ══════════════════════════════════════════════════════════════
            TAB: ANALYSE
        ══════════════════════════════════════════════════════════════ */}
        {tab === "analyse" && (
          <>
            {/* Hero */}
            <section className="mb-8 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight leading-tight">
                Turn Information Into Action
              </h1>
              <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
                Paste any message, email, notice or instruction and instantly understand what matters and what to do next.
              </p>
            </section>

            {/* Input Area */}
            <section aria-label="Input">
              <label htmlFor="message-input" className="sr-only">
                Message or text to analyse
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
                className={`w-full rounded-xl border px-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 transition-all bg-gray-50 leading-relaxed ${
                  inputError
                    ? "border-red-300 focus:ring-red-200"
                    : "border-gray-200 focus:ring-blue-200 focus:border-blue-400"
                }`}
                aria-describedby={inputError ? "input-error" : undefined}
                aria-invalid={!!inputError}
              />

              {inputError && (
                <p id="input-error" role="alert" className="mt-1.5 text-sm text-red-600">
                  {inputError}
                </p>
              )}

              <div className="mt-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <button
                  onClick={handleAnalyse}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                  aria-busy={loading}
                >
                  {loading ? "Analysing..." : "Find My Next Step →"}
                </button>
                <span className="text-xs text-gray-400 hidden sm:inline">⌘ + Enter</span>
              </div>
            </section>

            {/* Examples */}
            <section aria-label="Try an example" className="mt-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2.5">
                Try an example
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => handleExample(ex.id)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </section>

            <div className="mt-10 border-t border-gray-100" />

            {/* States */}
            <div ref={resultRef} className="mt-8">
              {loading && <LoadingState step={LOADING_STEPS[loadingStep]} />}

              {!loading && error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                  <p className="text-sm font-semibold text-red-700 mb-1">Analysis failed</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {!loading && !error && !result && <EmptyState />}

              {!loading && !error && result && (
                <div>
                  {/* Save to plan banner */}
                  <div className="flex items-center justify-between mb-4 px-1">
                    <p className="text-xs text-gray-400">Analysis complete</p>
                    {!result.noActionRequired && (
                      <button
                        onClick={handleSave}
                        disabled={justSaved}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                          justSaved
                            ? "bg-green-50 border-green-200 text-green-600"
                            : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                        }`}
                      >
                        {justSaved ? "✓ Saved to Plan" : "+ Save to Plan"}
                      </button>
                    )}
                  </div>
                  <ResultCard result={result} />
                </div>
              )}
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB: PRIORITY PLAN
        ══════════════════════════════════════════════════════════════ */}
        {tab === "plan" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Priority Plan</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  All your saved items ranked by priority and deadline
                </p>
              </div>
              {savedItems.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
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
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  ← Go analyse something
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB: CALENDAR
        ══════════════════════════════════════════════════════════════ */}
        {tab === "calendar" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Calendar</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                See all your deadlines at a glance
              </p>
            </div>
            <CalendarView items={savedItems} />
            {savedItems.length === 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setTab("analyse")}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  ← Go analyse something
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TAB: GANTT / TIMELINE
        ══════════════════════════════════════════════════════════════ */}
        {tab === "gantt" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Timeline</h2>
              <p className="text-sm text-gray-400 mt-0.5">
                Visualise how much time you have left for each item
              </p>
            </div>
            <GanttView items={savedItems} />
            {savedItems.length === 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setTab("analyse")}
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  ← Go analyse something
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 mt-16 py-6 text-center text-xs text-gray-400">
        <p>NextStep · Built for IBM Bobathon</p>
      </footer>
    </main>
  );
}
