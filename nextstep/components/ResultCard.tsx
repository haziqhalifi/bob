"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/types/analysis";

type Props = {
  result: AnalysisResult;
};

const PRIORITY_CONFIG = {
  high: {
    label: "HIGH PRIORITY",
    icon: "🔴",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
  },
  medium: {
    label: "MEDIUM PRIORITY",
    icon: "🟡",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
  },
  low: {
    label: "LOW PRIORITY",
    icon: "🟢",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    badge: "bg-green-100 text-green-700",
  },
};

export default function ResultCard({ result }: Props) {
  const [copied, setCopied] = useState(false);

  const priority = PRIORITY_CONFIG[result.priority];

  async function copyAction() {
    if (!result.primaryAction) return;
    await navigator.clipboard.writeText(result.primaryAction);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ─── No action required state ───────────────────────────────────────────────
  if (result.noActionRequired) {
    return (
      <div
        role="region"
        aria-label="Analysis result"
        className="rounded-xl border border-green-200 bg-green-50 px-6 py-6"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">✅</span>
          <div>
            <p className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-1">
              No Action Required
            </p>
            <p className="text-sm font-medium text-green-800 mb-2">
              {result.noActionMessage ?? "This message is informational only. No action is needed from you."}
            </p>
            <p className="text-xs text-green-600">{result.summary}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div role="region" aria-label="Analysis result" className="space-y-3">

      {/* ─── Type + Summary ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          {result.type}
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">{result.summary}</p>
      </div>

      {/* ─── Primary Action ──────────────────────────────────────────── */}
      {result.primaryAction && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">
                ✅ Next Action
              </p>
              <p className="text-base font-semibold text-blue-900 leading-snug">
                {result.primaryAction}
              </p>
            </div>
            <button
              onClick={copyAction}
              className="shrink-0 text-xs text-blue-500 hover:text-blue-700 font-medium focus:outline-none focus:underline mt-0.5"
              aria-label="Copy action to clipboard"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* ─── Deadline ────────────────────────────────────────────────── */}
      {result.deadline && (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            ⏰ Deadline
          </p>
          <p className="text-sm font-semibold text-gray-800">
            {result.deadline.normalized ?? result.deadline.raw}
          </p>
          {result.deadline.normalized && result.deadline.normalized !== result.deadline.raw && (
            <p className="text-xs text-gray-400 mt-0.5">{result.deadline.raw}</p>
          )}
        </div>
      )}

      {/* ─── Priority ────────────────────────────────────────────────── */}
      <div className={`rounded-xl border ${priority.border} ${priority.bg} px-5 py-4`}>
        <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${priority.text}`}>
          {priority.icon} {priority.label}
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">{result.priorityReason}</p>
      </div>

      {/* ─── Consequence ─────────────────────────────────────────────── */}
      {result.consequence && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-5 py-4">
          <p className="text-xs font-semibold text-orange-500 uppercase tracking-widest mb-1">
            ⚠️ Consequence
          </p>
          <p className="text-sm text-gray-700">{result.consequence}</p>
        </div>
      )}

      {/* ─── Amount ──────────────────────────────────────────────────── */}
      {result.amount && (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            💰 Amount
          </p>
          <p className="text-sm font-semibold text-gray-800">{result.amount.raw}</p>
        </div>
      )}

      {/* ─── Location ────────────────────────────────────────────────── */}
      {result.location && (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
            📍 Location
          </p>
          <p className="text-sm text-gray-800">{result.location}</p>
        </div>
      )}

      {/* ─── Additional Actions ──────────────────────────────────────── */}
      {result.additionalActions && result.additionalActions.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            📋 Additional Actions
          </p>
          <ul className="space-y-3">
            {result.additionalActions.map((item, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="shrink-0 w-5 h-5 rounded-full bg-gray-100 text-xs text-gray-500 flex items-center justify-center font-medium mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm text-gray-700">{item.action}</p>
                  {item.deadline && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.deadline.normalized ?? item.deadline.raw}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ─── Next Steps ──────────────────────────────────────────────── */}
      {result.nextSteps.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            📝 Next Steps
          </p>
          <ol className="space-y-2">
            {result.nextSteps.map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 text-xs text-blue-600 flex items-center justify-center font-semibold mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ─── Missing Information ─────────────────────────────────────── */}
      {result.missingInformation.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            ℹ️ Missing Information
          </p>
          <ul className="space-y-1">
            {result.missingInformation.map((item, i) => (
              <li key={i} className="text-xs text-gray-500 flex gap-2">
                <span aria-hidden="true">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
