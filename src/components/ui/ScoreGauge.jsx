export function ScoreBar({ label, value, max = 10 }) {
  const pct = Math.min(100, (value / max) * 100);
  const color =
    pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="text-slate-200 font-bold">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/8">
        <div
          className={`h-1.5 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function CircleScore({ score, max = 100, size = 96 }) {
  const pct = Math.min(100, (score / max) * 100);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const color =
    pct >= 70 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#f43f5e";
  const label =
    pct >= 70 ? "SAFE" : pct >= 40 ? "MODERATE" : "HIGH RISK";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#ffffff10" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="40" y="38" textAnchor="middle" fill="white" fontSize="14" fontWeight="900">{score}</text>
        <text x="40" y="50" textAnchor="middle" fill="#94a3b8" fontSize="6" fontWeight="600">{label}</text>
      </svg>
    </div>
  );
}

export function TrustScore({ score }) {
  const color = score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-rose-400";
  const level = score >= 70 ? "LOW" : score >= 40 ? "MEDIUM" : "HIGH";
  const levelColor = score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-rose-400";
  return (
    <div className="space-y-1">
      <div className="text-xs text-slate-500 uppercase tracking-wider">Trust Score</div>
      <div className={`text-5xl font-black ${color}`}>{score}</div>
      <div className={`text-xs font-bold ${levelColor} uppercase`}>{level} RISK</div>
    </div>
  );
}
