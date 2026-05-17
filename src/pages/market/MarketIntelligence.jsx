import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from "recharts";
import { Card, SectionDivider } from "../../components/ui/Card";
import { ScoreBar } from "../../components/ui/ScoreGauge";
import { RecommendationBanner, RiskBadge, FlagItem } from "../../components/ui/StatusBadge";
import { AnalyzingState, EmptyState } from "../../components/ui/LoadingSpinner";
import { ApiKeyGate } from "../../components/ui/ApiKeyGate";
import { complete, extractJSON, MARKET_SYSTEM_PROMPT } from "../../services/openrouter";
import { searchHN, formatHNSignals } from "../../services/hnSearch";

function ScoreCard({ scorecard }) {
  const items = [
    { key: "demand", label: "DEMAND" },
    { key: "pain", label: "PAIN" },
    { key: "payingCapacity", label: "WILLINGNESS TO PAY" },
    { key: "saturation", label: "SATURATION" },
    { key: "growth", label: "GROWTH" },
  ];
  return (
    <div className="space-y-3">
      {items.map((i) => (
        <ScoreBar key={i.key} label={i.label} value={scorecard[i.key]} />
      ))}
    </div>
  );
}

function RadarViz({ scorecard }) {
  const data = [
    { subject: "Demand", value: scorecard.demand * 10 },
    { subject: "Pain", value: scorecard.pain * 10 },
    { subject: "Pay Cap.", value: scorecard.payingCapacity * 10 },
    { subject: "Saturation", value: scorecard.saturation * 10 },
    { subject: "Growth", value: scorecard.growth * 10 },
  ];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart data={data}>
        <PolarGrid stroke="#ffffff15" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 10 }} />
        <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function CompetitorRow({ comp, index }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-t border-white/5 first:border-0">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center text-xs font-bold text-slate-400">
          {index + 1}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-200">{comp.name}</div>
          <div className="text-xs text-slate-500">{comp.pricing}</div>
        </div>
      </div>
      <a
        href={comp.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-400 hover:text-blue-300 font-semibold border border-blue-500/30 px-2 py-1 rounded-lg"
      >
        View →
      </a>
    </div>
  );
}

function SignalCard({ signal, index }) {
  const sourceColor = {
    Reddit: "text-orange-400",
    HackerNews: "text-amber-400",
    YouTube: "text-rose-400",
    GoogleTrends: "text-blue-400",
  };
  return (
    <div className="rounded-xl border border-white/8 bg-white/4 p-3 space-y-1">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold ${sourceColor[signal.source] || "text-slate-400"}`}>
          {signal.source}
        </span>
        <span className="text-xs text-slate-500">#{index + 1}</span>
      </div>
      <div className="text-sm text-slate-300">{signal.signal}</div>
      <div className="text-xs font-mono text-blue-300">{signal.data}</div>
    </div>
  );
}

export default function MarketIntelligence() {
  const navigate = useNavigate();
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  async function analyze() {
    const q = niche.trim();
    if (!q) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Fetch real HN signals first
      const hnHits = await searchHN(q);
      const hnContext = hnHits.length
        ? `\nReal HN signals found:\n${formatHNSignals(hnHits)}`
        : "\nNo recent HN posts found for this niche.";

      const userMsg = `Niche to analyze: "${q}"${hnContext}\n\nReturn ONLY the JSON object.`;
      const raw = await complete(MARKET_SYSTEM_PROMPT, userMsg);
      const data = extractJSON(raw);
      setResult(data);
    } catch (e) {
      setError(e.message || "Analysis failed. Check your API key and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") analyze();
  }

  function buildOffer() {
    // Pass market result via sessionStorage for OfferBuilder
    sessionStorage.setItem("tv_market_result", JSON.stringify({ niche, ...result }));
    navigate("/offer");
  }

  return (
    <ApiKeyGate>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-100">Market Intelligence</h1>
          <p className="text-sm text-slate-500 mt-1">
            AI-powered niche analysis with real market signals
          </p>
        </div>

        {/* Search */}
        <div className="flex gap-3">
          <input
            ref={inputRef}
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter niche or idea (e.g. AI scheduling for dentists)"
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/40 placeholder:text-slate-600"
            data-testid="market-input"
          />
          <button
            onClick={analyze}
            disabled={loading || !niche.trim()}
            data-testid="analyze-btn"
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition text-sm"
          >
            {loading ? "Analyzing…" : "Analyze"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && <AnalyzingState label="Fetching signals and running AI analysis…" />}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-5" data-testid="market-results">
            {/* Scorecard + Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card title="Scorecard" className="lg:col-span-1">
                <ScoreCard scorecard={result.scorecard} />
                <div className="mt-4 pt-4 border-t border-white/8 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Total Score</span>
                  <span className="text-2xl font-black text-blue-400">{result.totalScore}</span>
                </div>
              </Card>

              <Card title="Radar Chart" className="lg:col-span-1">
                <RadarViz scorecard={result.scorecard} />
              </Card>

              <div className="space-y-4">
                <Card title="Top Signals">
                  <div className="space-y-2">
                    {result.signals?.slice(0, 3).map((s, i) => (
                      <SignalCard key={i} signal={s} index={i} />
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Recommendation */}
            <RecommendationBanner
              rec={result.recommendation}
              reasoning={result.reasoning}
            />

            {/* Competitors + Differentiators */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card title="Competitors">
                {result.competitors?.map((c, i) => (
                  <CompetitorRow key={i} comp={c} index={i} />
                ))}
                {result.competitors?.[0]?.gap && (
                  <div className="mt-3 pt-3 border-t border-white/8">
                    <div className="text-xs text-slate-500 mb-2">Main gap: {result.competitors[0].gap}</div>
                  </div>
                )}
              </Card>

              <Card title="Differentiation Angles">
                <div className="space-y-2">
                  {result.differentiators?.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-white/4 border border-white/8">
                      <span className="text-blue-400 font-bold text-sm mt-0.5">{i + 1}</span>
                      <span className="text-sm text-slate-300">{d}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Avatar Profile */}
            {result.avatar && (
              <Card title="Avatar Profile">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Who</div>
                    <div className="text-sm text-slate-200">{result.avatar.who}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Main frustration</div>
                    <div className="text-sm text-slate-200">{result.avatar.frustration}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Desire</div>
                    <div className="text-sm text-slate-200">{result.avatar.desire}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500 uppercase tracking-wider">Words they use</div>
                    <div className="flex flex-wrap gap-1">
                      {result.avatar.wordsTheyUse?.map((w, i) => (
                        <span key={i} className="text-xs bg-white/8 text-slate-300 px-2 py-0.5 rounded-full">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Build Offer CTA */}
            {result.totalScore >= 7 && (
              <div className="rounded-2xl border border-blue-500/30 bg-blue-500/8 p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-blue-300">
                    Score {result.totalScore}/10 — Offer Builder unlocked
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Build a complete Hormozi offer for this niche
                  </div>
                </div>
                <button
                  onClick={buildOffer}
                  data-testid="build-offer-btn"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition whitespace-nowrap"
                >
                  Build Offer →
                </button>
              </div>
            )}

            {result.totalScore < 7 && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/8 p-4 text-sm text-amber-300">
                Score {result.totalScore}/10 — Offer Builder requires a score of 7 or higher. Consider pivoting the niche.
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <EmptyState
            icon="📊"
            title="Enter a niche to start"
            description="AI will fetch real HN signals and generate a complete market scorecard, competitors, and avatar."
          />
        )}
      </div>
    </ApiKeyGate>
  );
}
