"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/types/analysis";

type Props = {
  result: AnalysisResult;
};

// ── SVG icon helpers ─────────────────────────────────────────────────
function IconCheck({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconArrow({ className = "" }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}
function IconClock({ className = "" }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}
function IconAlert({ className = "" }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
function IconDollar({ className = "" }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  );
}
function IconPin({ className = "" }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
function IconList({ className = "" }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  );
}
function IconSteps({ className = "" }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  );
}
function IconInfo({ className = "" }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  );
}
function IconCopy({ className = "" }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
    </svg>
  );
}

// ── Priority config (SVG-based) ──────────────────────────────────────
const PRIORITY_CONFIG = {
  high: {
    label: "HIGH PRIORITY",
    dotClass: "bg-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
  },
  medium: {
    label: "MEDIUM PRIORITY",
    dotClass: "bg-amber-400",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
  },
  low: {
    label: "LOW PRIORITY",
    dotClass: "bg-green-500",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    badge: "bg-green-100 text-green-700",
  },
};

// ── Card row wrapper ─────────────────────────────────────────────────
function CardRow({
  icon,
  label,
  borderClass = "border-slate-200",
  bgClass = "bg-white",
  labelClass = "text-slate-400",
  children,
}: {
  icon: React.ReactNode;
  label: string;
  borderClass?: string;
  bgClass?: string;
  labelClass?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border ${borderClass} ${bgClass} px-5 py-4`}>
      <p className={`text-[11px] font-semibold uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${labelClass}`}>
        {icon}
        {label}
      </p>
      {children}
    </div>
  );
}

export default function ResultCard({ result }: Props) {
  const [copied, setCopied] = useState(false);

  const priority = PRIORITY_CONFIG[result.priority];

  async function copyAction() {
    if (!result.primaryAction) return;
    await navigator.clipboard.writeText(result.primaryAction);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── No action required ───────────────────────────────────────────
  if (result.noActionRequired) {
    return (
      <div
        role="region"
        aria-label="Analysis result"
        className="rounded-xl border border-green-200 bg-green-50 px-6 py-5"
      >
        <div className="flex items-start gap-3">
          <span className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center shrink-0 mt-0.5">
            <IconCheck className="text-green-600" />
          </span>
          <div>
            <p className="text-[11px] font-semibold text-green-600 uppercase tracking-widest mb-1">
              No Action Required
            </p>
            <p className="text-sm font-semibold text-green-800 mb-1.5 leading-snug">
              {result.noActionMessage ?? "This message is informational only. No action is needed from you."}
            </p>
            <p className="text-xs text-green-600 leading-relaxed">{result.summary}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div role="region" aria-label="Analysis result" className="space-y-3">

      {/* ── Type + Summary ──────────────────────────────────────────── */}
      <CardRow
        icon={<IconInfo className="text-slate-400" />}
        label={result.type}
        bgClass="bg-slate-50"
        borderClass="border-slate-200"
      >
        <p className="text-sm text-slate-700 leading-relaxed">{result.summary}</p>
      </CardRow>

      {/* ── Primary Action ──────────────────────────────────────────── */}
      {result.primaryAction && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <IconArrow className="text-blue-500" />
                Next Action
              </p>
              <p className="text-base font-semibold text-blue-900 leading-snug">
                {result.primaryAction}
              </p>
            </div>
            <button
              onClick={copyAction}
              className="shrink-0 inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium mt-0.5 cursor-pointer transition-colors duration-150 focus:outline-none focus:underline"
              aria-label="Copy action to clipboard"
            >
              {copied ? (
                <>
                  <IconCheck className="text-blue-600" />
                  Copied!
                </>
              ) : (
                <>
                  <IconCopy />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Deadline ────────────────────────────────────────────────── */}
      {result.deadline && (
        <CardRow
          icon={<IconClock className="text-slate-400" />}
          label="Deadline"
        >
          <p className="text-sm font-semibold text-slate-800">
            {result.deadline.normalized ?? result.deadline.raw}
          </p>
          {result.deadline.normalized && result.deadline.normalized !== result.deadline.raw && (
            <p className="text-xs text-slate-400 mt-0.5">{result.deadline.raw}</p>
          )}
        </CardRow>
      )}

      {/* ── Priority ────────────────────────────────────────────────── */}
      <div className={`rounded-xl border ${priority.border} ${priority.bg} px-5 py-4`}>
        <p className={`text-[11px] font-semibold uppercase tracking-widest mb-1.5 flex items-center gap-2 ${priority.text}`}>
          <span className={`w-2 h-2 rounded-full shrink-0 ${priority.dotClass}`} />
          {priority.label}
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">{result.priorityReason}</p>
      </div>

      {/* ── Consequence ─────────────────────────────────────────────── */}
      {result.consequence && (
        <CardRow
          icon={<IconAlert className="text-amber-500" />}
          label="Consequence"
          bgClass="bg-amber-50"
          borderClass="border-amber-200"
          labelClass="text-amber-600"
        >
          <p className="text-sm text-slate-700 leading-relaxed">{result.consequence}</p>
        </CardRow>
      )}

      {/* ── Amount ──────────────────────────────────────────────────── */}
      {result.amount && (
        <CardRow
          icon={<IconDollar className="text-slate-400" />}
          label="Amount"
        >
          <p className="text-sm font-semibold text-slate-800">{result.amount.raw}</p>
        </CardRow>
      )}

      {/* ── Location ────────────────────────────────────────────────── */}
      {result.location && (
        <CardRow
          icon={<IconPin className="text-slate-400" />}
          label="Location"
        >
          <p className="text-sm text-slate-800">{result.location}</p>
        </CardRow>
      )}

      {/* ── Additional Actions ──────────────────────────────────────── */}
      {result.additionalActions && result.additionalActions.length > 0 && (
        <CardRow
          icon={<IconList className="text-slate-400" />}
          label="Additional Actions"
        >
          <ul className="space-y-3">
            {result.additionalActions.map((item, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="shrink-0 w-5 h-5 rounded-full bg-slate-100 text-xs text-slate-500 flex items-center justify-center font-semibold mt-0.5 border border-slate-200">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm text-slate-700 leading-snug">{item.action}</p>
                  {item.deadline && (
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <IconClock className="text-slate-300" />
                      {item.deadline.normalized ?? item.deadline.raw}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardRow>
      )}

      {/* ── Next Steps ──────────────────────────────────────────────── */}
      {result.nextSteps.length > 0 && (
        <CardRow
          icon={<IconSteps className="text-slate-400" />}
          label="Next Steps"
        >
          <ol className="space-y-2">
            {result.nextSteps.map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 text-xs text-blue-600 flex items-center justify-center font-semibold mt-0.5 border border-blue-200">
                  {i + 1}
                </span>
                <span className="text-sm text-slate-700 leading-snug">{step}</span>
              </li>
            ))}
          </ol>
        </CardRow>
      )}

      {/* ── Missing Information ─────────────────────────────────────── */}
      {result.missingInformation.length > 0 && (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <IconInfo className="text-slate-300" />
            Missing Information
          </p>
          <ul className="space-y-1.5">
            {result.missingInformation.map((item, i) => (
              <li key={i} className="text-xs text-slate-500 flex gap-2 items-start">
                <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0 mt-1.5" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
