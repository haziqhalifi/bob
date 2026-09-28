export default function EmptyState() {
  return (
    <div className="text-center py-12 px-4">
      {/* Icon */}
      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
      </div>

      <p className="text-sm font-semibold text-slate-600 mb-1">
        Paste anything that might require an action
      </p>
      <p className="text-xs text-slate-400 mb-4">Examples of what you can analyse:</p>

      <ul className="text-sm space-y-2 text-slate-400 inline-flex flex-col items-start text-left">
        {[
          "An email from your employer",
          "A university announcement",
          "A payment notice",
          "An event invitation",
          "A WhatsApp message",
        ].map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
