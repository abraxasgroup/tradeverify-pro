import { useState, useRef } from "react";
import { Card } from "../../components/ui/Card";
import { FlagItem, RiskBadge } from "../../components/ui/StatusBadge";
import { CircleScore } from "../../components/ui/ScoreGauge";
import { AnalyzingState, EmptyState } from "../../components/ui/LoadingSpinner";
import { ApiKeyGate } from "../../components/ui/ApiKeyGate";
import { parseSwift } from "../../services/swiftParser";
import { complete, extractJSON, INSTRUMENT_SYSTEM_PROMPT } from "../../services/openrouter";

const INSTRUMENT_TYPES = ["SBLC", "BG", "MT760", "MT799", "MT700", "LC"];
const CURRENCIES = ["USD", "EUR", "GBP", "CHF", "JPY", "CNY", "AED"];

function RiskScoreDisplay({ score, label }) {
  const pct = score;
  const color = pct < 30 ? "text-emerald-400" : pct < 60 ? "text-amber-400" : "text-rose-400";
  const bgColor = pct < 30 ? "bg-emerald-500" : pct < 60 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-500 uppercase tracking-wider">Risk Score</div>
      <div className={`text-5xl font-black ${color}`}>{score}%</div>
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ${
        pct < 30 ? "bg-emerald-500/15 text-emerald-400 ring-emerald-500/30" :
        pct < 60 ? "bg-amber-500/15 text-amber-400 ring-amber-500/30" :
        "bg-rose-500/15 text-rose-400 ring-rose-500/30"
      }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${bgColor}`} />
        {label || "Requires Bank Confirmation"}
      </div>
    </div>
  );
}

function BankInfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs text-slate-300 font-mono">{value}</span>
    </div>
  );
}

export default function TradeValidator() {
  const [form, setForm] = useState({
    type: "SBLC",
    bank: "",
    amount: "",
    currency: "USD",
    document: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [swiftParsed, setSwiftParsed] = useState(null);
  const fileRef = useRef(null);

  function set(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("document", ev.target.result);
    reader.readAsText(file);
  }

  async function validate() {
    if (!form.bank && !form.document) {
      setError("Provide at least the issuing bank or a document.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    setSwiftParsed(null);

    try {
      // Parse SWIFT locally if document present
      let swiftData = null;
      if (form.document) {
        swiftData = parseSwift(form.document);
        setSwiftParsed(swiftData);
      }

      const userMsg = [
        `Instrument Type: ${form.type}`,
        `Issuing Bank: ${form.bank || "Not specified"}`,
        `Amount: ${form.amount || "Not specified"} ${form.currency}`,
        swiftData
          ? `SWIFT Parse Results: MT=${swiftData.mt}, Sender=${swiftData.sender}, Receiver=${swiftData.receiver}, Flags=${swiftData.flags.map(f => f.msg).join("; ")}`
          : "",
        form.document ? `Document excerpt (first 2000 chars):\n${form.document.slice(0, 2000)}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const raw = await complete(INSTRUMENT_SYSTEM_PROMPT, userMsg);
      const data = extractJSON(raw);
      setResult(data);
    } catch (e) {
      setError(e.message || "Validation failed. Check your API key and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ApiKeyGate>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-100">Trade Instrument Verification</h1>
          <p className="text-sm text-slate-500 mt-1">
            Preliminary structural analysis — all results require official bank confirmation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
          {/* INPUTS */}
          <Card title="Inputs">
            <div className="space-y-4">
              {/* Instrument type */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 uppercase tracking-wider">Instrument Type</label>
                <select
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                  data-testid="instrument-type"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  {INSTRUMENT_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-[#0d1025]">{t}</option>
                  ))}
                </select>
              </div>

              {/* Issuing bank */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 uppercase tracking-wider">Issuing Bank</label>
                <input
                  value={form.bank}
                  onChange={(e) => set("bank", e.target.value)}
                  placeholder="e.g. Deutsche Bank AG"
                  data-testid="issuing-bank"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/40 placeholder:text-slate-600"
                />
              </div>

              {/* Amount + currency */}
              <div className="flex gap-3">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs text-slate-500 uppercase tracking-wider">Amount</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => set("amount", e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/40 placeholder:text-slate-600"
                  />
                </div>
                <div className="w-28 space-y-1.5">
                  <label className="text-xs text-slate-500 uppercase tracking-wider">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => set("currency", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c} className="bg-[#0d1025]">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Document upload */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 uppercase tracking-wider">Upload Document (optional)</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-white/12 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500/40 hover:bg-blue-500/4 transition"
                >
                  <div className="text-slate-500 text-sm">
                    {form.document ? "✓ Document loaded" : "Drag & Drop or click to upload"}
                  </div>
                  {form.document && (
                    <div className="text-xs text-slate-600 mt-1">{form.document.length} characters loaded</div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".txt,.swift,.pdf" className="hidden" onChange={handleFile} />
              </div>

              {/* Or paste text */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-500 uppercase tracking-wider">Or paste SWIFT text</label>
                <textarea
                  value={form.document}
                  onChange={(e) => set("document", e.target.value)}
                  rows={5}
                  placeholder="Paste MT700/760/799 text here…"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/40 placeholder:text-slate-600 font-mono resize-none"
                />
              </div>

              {error && (
                <div className="text-rose-400 text-xs rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2">
                  {error}
                </div>
              )}

              <button
                onClick={validate}
                disabled={loading}
                data-testid="validate-btn"
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl text-sm transition"
              >
                {loading ? "Analyzing…" : "Validate Instrument"}
              </button>
            </div>
          </Card>

          {/* RESULTS */}
          <div className="space-y-4">
            {loading && <AnalyzingState label="Running structural analysis…" />}

            {!result && !loading && (
              <EmptyState
                icon="🏦"
                title="Results will appear here"
                description="Fill in instrument details and click Validate."
              />
            )}

            {result && !loading && (
              <>
                {/* Risk score */}
                <Card>
                  <div className="flex items-start justify-between gap-4">
                    <RiskScoreDisplay score={result.riskScore} />
                    <div className="text-right space-y-1">
                      <RiskBadge level={result.riskLevel} />
                      <div className="text-xs text-slate-500 mt-1">
                        Bank: {result.bankExists === true ? "✓ Found" : result.bankExists === false ? "✗ Not found" : "? Uncertain"}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-300">
                    ⚠ {result.disclaimer}
                  </div>
                </Card>

                {/* Red flags */}
                {result.flags?.length > 0 && (
                  <Card title="Red Flags">
                    <div className="space-y-1">
                      {result.flags.map((f, i) => (
                        <FlagItem key={i} severity={f.severity} description={f.description} />
                      ))}
                    </div>
                  </Card>
                )}

                {/* Bank info */}
                {result.bankInfo && (
                  <Card title="Bank Info">
                    <BankInfoRow label="Name" value={result.bankInfo.name} />
                    <BankInfoRow label="Country" value={result.bankInfo.country} />
                    <BankInfoRow label="SWIFT/BIC" value={result.bankInfo.swift} />
                    {result.bankBIC && <BankInfoRow label="BIC" value={result.bankBIC} />}
                  </Card>
                )}

                {/* Structural analysis */}
                {result.structuralAnalysis && (
                  <Card title="Structural Analysis">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {result.structuralAnalysis}
                    </p>
                  </Card>
                )}

                {/* Next steps */}
                {result.nextSteps?.length > 0 && (
                  <Card title="Next Steps">
                    <ol className="space-y-2">
                      {result.nextSteps.map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-300">
                          <span className="text-blue-400 font-bold">{i + 1}.</span>
                          {s}
                        </li>
                      ))}
                    </ol>
                  </Card>
                )}

                {/* SWIFT local parse (if doc provided) */}
                {swiftParsed && (
                  <Card title="Local SWIFT Parse">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        ["MT Type", swiftParsed.mt],
                        ["Sender", swiftParsed.sender],
                        ["Receiver", swiftParsed.receiver],
                        ["MUR", swiftParsed.mur],
                        ["MIR", swiftParsed.mir],
                        ["LC Field 20", swiftParsed.lc20],
                        ["ACK", swiftParsed.ack ? "Detected" : "Not detected"],
                      ].map(([k, v]) => v ? (
                        <div key={k} className="flex items-center justify-between gap-2 border-b border-white/5 py-1 col-span-1">
                          <span className="text-slate-500">{k}</span>
                          <span className="text-slate-300 font-mono truncate">{v}</span>
                        </div>
                      ) : null)}
                    </div>
                    {swiftParsed.flags.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {swiftParsed.flags.map((f, i) => (
                          <FlagItem key={i} severity={f.level === "ROJO" ? "HIGH" : "MEDIUM"} description={f.msg} />
                        ))}
                      </div>
                    )}
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
