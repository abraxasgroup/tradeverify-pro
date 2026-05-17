export function Spinner({ size = 20 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      className="animate-spin text-blue-400"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function AnalyzingState({ label = "Analyzing..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-2 border-blue-500/20 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner size={32} />
        </div>
      </div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  );
}

export function StreamingText({ text, className = "" }) {
  return (
    <span className={className}>
      {text}
      <span className="inline-block w-0.5 h-4 bg-blue-400 ml-0.5 animate-pulse align-middle" />
    </span>
  );
}

export function EmptyState({ icon = "◎", title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="text-4xl text-slate-600">{icon}</div>
      <div className="text-slate-300 font-semibold">{title}</div>
      {description && <div className="text-slate-500 text-sm max-w-xs">{description}</div>}
      {action}
    </div>
  );
}
