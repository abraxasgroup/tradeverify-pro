import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { FlagItem, RiskBadge, RiskLevelSelector } from "../../components/ui/StatusBadge";
import { TrustScore } from "../../components/ui/ScoreGauge";
import { AnalyzingState, EmptyState } from "../../components/ui/LoadingSpinner";
import { ApiKeyGate } from "../../components/ui/ApiKeyGate";
import { complete, extractJSON, CLIENT_SYSTEM_PROMPT } from "../../services/openrouter";

const COUNTRY_RISK_COUNTRIES = [
  "Afghanistan","Belarus","Burma","Cuba","Iran","Iraq","Libya","Mali","Nicaragua",
  "North Korea","Russia","Somalia","Sudan","Syria","Venezuela","Yemen","Zimbabwe",
];

const ROLES = ["Buyer","Seller","Intermediary","Broker","Mandated Seller","Bank Representative","Legal Representative","Other"];

export default function ClientValidator() {
  const [form, setForm] = useState({ name: "", company: "", country: "", role: "Buyer" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  function set(k, v) { setForm((p) => ({ ...p, [k]: v })); }

  async function validate() {
    if (!form.name.trim() && !form.company.trim()) {
      setError("Provide a name or company.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const userMsg = [
        `Name: ${form.name || "Not provided"}`,
        `Company: ${form.company || "Not provided"}`,
        `Country: ${form.country || "Not specified"}`,
        `Role in transaction: ${form.role}`,
        COUNTRY_RISK_COUNTRIES.includes(form.country)
          ? "NOTE: This country is on high-risk / sanctioned watchlists."
          : "",
      ]
        .filter(Boolean)
        .join("\n");

      const raw = await complete(CLIENT_SYSTEM_PROMPT, userMsg);
      const data = extractJSON(raw);
      setResult(data);
    } catch (e) {
      setError(e.message || "Analysis failed. Check your API key.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ApiKeyGate>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-100">Client Risk Analysis</h1>
          <p className="text-sm text-slate-500 mt-1">KYC / KYB — preliminary risk assessment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          {/* Inputs */}
          <Card title="Client Details">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 uppercase tracking-wider">Name or Company</label>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Full legal name"
                  data-testid="client-name"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/40 placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 uppercase tracking-wider">Company</label>
                <input
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  placeholder="Company legal name"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/40 placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 uppercase tracking-wider">Country</label>
                <input
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  placeholder="Country of incorporation"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/40 placeholder:text-slate-600"
                />
                {COUNTRY_RISK_COUNTRIES.includes(form.country) && (
                  <p className="text-rose-400 text-xs">⚠ High-risk / sanctioned jurisdiction</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 uppercase tracking-wider">Role in Transaction</label>
                <select
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="bg-[#0d1025]">{r}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="text-rose-400 text-xs rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2">
                  {error}
                </div>
              )}

              <button
                onClick={validate}
                disabled={loading}
                data-testid="client-validate-btn"
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl text-sm transition"
              >
                {loading ? "Analyzing…" : "Analyze Client Risk"}
              </button>
            </div>
          </Card>

          {/* Results */}
          <div className="space-y-4">
            {loading && <AnalyzingState label="Running KYC/KYB analysis…" />}

            {!result && !loading && (
              <EmptyState
                icon="👤"
                title="Enter client details"
                description="AI will assess company existence, country risk, and reputational flags."
              />
            )}

            {result && !loading && (
              <>
                <Card>
                  <div className="flex items-start justify-between gap-4">
                    <TrustScore score={result.trustScore} />
                    <div className="space-y-2 text-right">
                      <RiskBadge level={result.riskLevel} />
                      <div className="text-xs text-slate-500">
                        Country risk: <span className={
                          result.countryRisk === "LOW" ? "text-emerald-400" :
                          result.countryRisk === "HIGH" ? "text-rose-400" : "text-amber-400"
                        }>{result.countryRisk}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card title="Risk Level">
                  <RiskLevelSelector value={result.riskLevel} onChange={() => {}} />
                  <p className="text-xs text-slate-500 mt-2">{result.countryReason}</p>
                </Card>

                {result.companyAssessment && (
                  <Card title="Company Assessment">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {result.companyAssessment}
                    </p>
                    <div className="mt-2 text-xs text-slate-500">
                      Company existence: {result.companyExists === true ? "✓ Likely real" : result.companyExists === false ? "✗ Not verifiable" : "? Uncertain"}
                    </div>
                  </Card>
                )}

                {result.flags?.length > 0 && (
                  <Card title="Flags">
                    <div className="space-y-1" data-testid="client-flags">
                      {result.flags.map((f, i) => (
                        <FlagItem key={i} severity={f.severity} description={f.description} />
                      ))}
                    </div>
                  </Card>
                )}

                {result.recommendations?.length > 0 && (
                  <Card title="Recommendations">
                    <ul className="space-y-1.5">
                      {result.recommendations.map((r, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-300">
                          <span className="text-blue-400">→</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ApiKeyGate>
  );
}
