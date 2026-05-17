import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, MetricCard } from "../components/ui/Card";
import { RiskBadge } from "../components/ui/StatusBadge";
import { CircleScore } from "../components/ui/ScoreGauge";
import { VeryFiiMark } from "../components/ui/VeryFiiLogo";

const DEMO_VALIDATIONS = [
  { id: "VAL-0001", activity: "SBLC — Deutsche Bank / $5M", status: "SAFE", risk: "Low", date: "2025-05-15", type: "Trade" },
  { id: "VAL-0002", activity: "SaaS Market — AI scheduling tools", status: "SAFE", risk: "Low", date: "2025-05-14", type: "Market" },
  { id: "VAL-0003", activity: "MT760 — Unknown issuer / $120M", status: "HIGH RISK", risk: "High", date: "2025-05-13", type: "Trade" },
];

function ValidationRow({ item, onView }) {
  const riskColor = {
    Low: "text-emerald-400",
    Medium: "text-amber-400",
    High: "text-rose-400",
  };
  return (
    <tr className="border-t border-white/5 hover:bg-white/3 transition">
      <td className="py-3 px-4">
        <div className="text-xs text-slate-400">{item.id}</div>
        <div className="text-sm text-slate-200 font-medium truncate max-w-xs">{item.activity}</div>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-slate-400">{item.type}</span>
      </td>
      <td className="py-3 px-4">
        <RiskBadge level={item.risk.toUpperCase()} />
      </td>
      <td className="py-3 px-4">
        <span className={`text-sm font-bold ${riskColor[item.risk]}`}>{item.status}</span>
      </td>
      <td className="py-3 px-4 text-xs text-slate-500">{item.date}</td>
      <td className="py-3 px-4">
        <button
          onClick={() => onView(item)}
          className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
        >
          View
        </button>
      </td>
    </tr>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [validations] = useState(DEMO_VALIDATIONS);

  function handleNew() {
    navigate("/trade");
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <VeryFiiMark size={32} />
            <h1 className="text-2xl font-black text-slate-100">Global Console</h1>
          </div>
          <p className="text-sm text-slate-500">Validation overview — all modules</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          New Validation
        </button>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Global Score */}
        <Card className="col-span-2 lg:col-span-1">
          <div className="space-y-3">
            <div className="text-xs text-slate-500 uppercase tracking-wider">Global Score</div>
            <div className="flex items-end gap-3">
              <div className="text-5xl font-black text-white">88</div>
              <div className="text-2xl text-slate-500 font-light mb-1">/100</div>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 px-3 py-1 rounded-full text-sm font-bold ring-1 ring-emerald-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              SAFE
            </div>
          </div>
        </Card>

        <MetricCard
          label="Instrument Risk"
          value="Low"
          sub="0 active alerts"
          accent="green"
        />
        <MetricCard
          label="Client Risk"
          value="High"
          sub="1 flagged client"
          accent="red"
        />
        <MetricCard
          label="Market Score"
          value="82/100"
          sub="Last analysis: SaaS AI"
          accent="blue"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Score Distribution" className="lg:col-span-2">
          <div className="flex items-center justify-around py-4">
            <div className="text-center space-y-2">
              <CircleScore score={88} max={100} size={96} />
              <div className="text-xs text-slate-500">Overall</div>
            </div>
            <div className="text-center space-y-2">
              <CircleScore score={72} max={100} size={80} />
              <div className="text-xs text-slate-500">Trade</div>
            </div>
            <div className="text-center space-y-2">
              <CircleScore score={82} max={100} size={80} />
              <div className="text-xs text-slate-500">Market</div>
            </div>
            <div className="text-center space-y-2">
              <CircleScore score={91} max={100} size={80} />
              <div className="text-xs text-slate-500">Client</div>
            </div>
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="space-y-2">
            {[
              { label: "Market Intelligence", to: "/market", icon: "📊", color: "text-blue-400" },
              { label: "Trade Validator", to: "/trade", icon: "🏦", color: "text-emerald-400" },
              { label: "Client Risk (KYC)", to: "/client", icon: "👤", color: "text-amber-400" },
              { label: "Build Offer", to: "/offer", icon: "⭐", color: "text-purple-400" },
              { label: "Export Report", to: "/report", icon: "📄", color: "text-slate-400" },
            ].map((a) => (
              <button
                key={a.to}
                onClick={() => navigate(a.to)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/6 transition text-left"
              >
                <span>{a.icon}</span>
                <span className={`text-sm font-medium ${a.color}`}>{a.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent validations */}
      <Card title="Recent Validations">
        <div className="overflow-x-auto -mx-5 -mb-5">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Activity", "Type", "Risk", "Status", "Date", ""].map((h) => (
                  <th key={h} className="text-left text-xs text-slate-500 uppercase tracking-wider py-3 px-4 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {validations.map((v) => (
                <ValidationRow
                  key={v.id}
                  item={v}
                  onView={(item) => navigate(item.type === "Trade" ? "/trade" : "/market")}
                />
              ))}
            </tbody>
          </table>
          {validations.length === 0 && (
            <div className="text-center text-slate-500 text-sm py-8">No validations yet.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
