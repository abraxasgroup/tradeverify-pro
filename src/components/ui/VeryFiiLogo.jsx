// SVG logo approximating the Veryfii Validator brand mark
// Drop public/logo.png for the full render; this fallback is used when it's absent

export function VeryFiiMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="globe" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#0a1628" />
        </radialGradient>
        <linearGradient id="vmark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Globe base */}
      <circle cx="24" cy="24" r="22" fill="url(#globe)" stroke="#1d4ed8" strokeWidth="0.5" opacity="0.9" />

      {/* Network dots */}
      {[[8,12],[40,12],[8,36],[40,36],[24,6],[24,42],[6,24],[42,24]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="1.2" fill="#3b82f6" opacity="0.7" />
      ))}

      {/* Blue glow ring */}
      <circle cx="24" cy="24" r="19" stroke="#3b82f6" strokeWidth="0.4" fill="none" opacity="0.5" />

      {/* Shield */}
      <path d="M24 16 L28 18.5 L28 23 Q28 27 24 29 Q20 27 20 23 L20 18.5 Z"
            fill="#1e40af" stroke="#3b82f6" strokeWidth="0.6" opacity="0.9" />

      {/* V checkmark */}
      <path d="M13 18 L20 30 L35 14"
            stroke="url(#vmark)" strokeWidth="3.5" strokeLinecap="round"
            strokeLinejoin="round" fill="none" filter="url(#glow)" />

      {/* Green accent dots */}
      <circle cx="20" cy="30" r="1.5" fill="#22c55e" opacity="0.9" />
      <circle cx="28" cy="22" r="1" fill="#22c55e" opacity="0.7" />
    </svg>
  );
}

export function VeryFiiWordmark({ size = "md" }) {
  const sizes = { sm: "text-base", md: "text-xl", lg: "text-2xl" };
  return (
    <div className={`flex items-center gap-2.5 select-none`}>
      <VeryFiiMark size={size === "lg" ? 52 : size === "sm" ? 28 : 40} />
      <div>
        <div className={`${sizes[size]} font-black tracking-tight`}>
          <span className="text-slate-200">Veryfii</span>
        </div>
        <div className="text-[10px] text-blue-400 font-semibold tracking-widest uppercase -mt-0.5">
          Validator
        </div>
      </div>
    </div>
  );
}
