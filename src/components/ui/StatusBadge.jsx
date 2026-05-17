export function RiskBadge({ level }) {
  const map = {
    LOW: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
    MEDIUM: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
    HIGH: "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30",
    SAFE: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
    VERDE: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
    AMARILLO: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
    ROJO: "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30",
    GO: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
    PIVOT: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
    NO_GO: "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30",
  };
  const dot = {
    LOW: "bg-emerald-400", MEDIUM: "bg-amber-400", HIGH: "bg-rose-400",
    SAFE: "bg-emerald-400", VERDE: "bg-emerald-400", AMARILLO: "bg-amber-400", ROJO: "bg-rose-400",
    GO: "bg-emerald-400", PIVOT: "bg-amber-400", NO_GO: "bg-rose-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${map[level] || map.MEDIUM}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot[level] || dot.MEDIUM}`} />
      {level}
    </span>
  );
}

export function RiskLevelSelector({ value, onChange }) {
  const levels = ["LOW", "MEDIUM", "HIGH"];
  const active = {
    LOW: "bg-emerald-500 text-white",
    MEDIUM: "bg-amber-500 text-slate-900",
    HIGH: "bg-rose-500 text-white",
  };
  const inactive = "bg-white/6 text-slate-400 hover:bg-white/10";
  return (
    <div className="flex rounded-xl overflow-hidden border border-white/10 w-fit">
      {levels.map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`px-4 py-1.5 text-xs font-bold transition ${value === l ? active[l] : inactive}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function FlagItem({ severity, description }) {
  const colors = {
    HIGH: "text-rose-400",
    MEDIUM: "text-amber-400",
    LOW: "text-slate-400",
  };
  const icons = { HIGH: "●", MEDIUM: "◆", LOW: "○" };
  return (
    <div className="flex items-start gap-2 text-sm py-1">
      <span className={`mt-0.5 text-xs ${colors[severity]}`}>{icons[severity]}</span>
      <span className="text-slate-300">{description}</span>
    </div>
  );
}

export function RecommendationBanner({ rec, reasoning }) {
  const config = {
    GO: { bg: "bg-emerald-500/10 border-emerald-500/30", text: "text-emerald-400", icon: "✓" },
    PIVOT: { bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-400", icon: "⟳" },
    NO_GO: { bg: "bg-rose-500/10 border-rose-500/30", text: "text-rose-400", icon: "✕" },
  };
  const c = config[rec] || config.PIVOT;
  return (
    <div className={`rounded-2xl border p-4 ${c.bg}`}>
      <div className={`flex items-center gap-2 text-lg font-black ${c.text}`}>
        <span>{c.icon}</span>
        <span>{rec}</span>
      </div>
      {reasoning && <p className="text-slate-300 text-sm mt-1">{reasoning}</p>}
    </div>
  );
}
