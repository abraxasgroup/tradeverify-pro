export function Card({ title, subtitle, children, className = "", id }) {
  return (
    <div
      id={id}
      className={`rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm ${className}`}
    >
      {(title || subtitle) && (
        <div className="px-5 pt-4 pb-0">
          {title && <div className="text-sm font-semibold text-slate-300">{title}</div>}
          {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function MetricCard({ label, value, sub, accent = "blue", className = "" }) {
  const colors = {
    blue: "text-blue-400",
    green: "text-emerald-400",
    amber: "text-amber-400",
    red: "text-rose-400",
    slate: "text-slate-300",
  };
  return (
    <div className={`rounded-2xl border border-white/8 bg-white/4 p-4 ${className}`}>
      <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">{label}</div>
      <div className={`text-2xl font-black ${colors[accent]}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

export function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-white/8" />
      <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-white/8" />
    </div>
  );
}
