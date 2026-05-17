import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { AnalyzingState, EmptyState } from "../../components/ui/LoadingSpinner";
import { ApiKeyGate } from "../../components/ui/ApiKeyGate";
import { complete, extractJSON, OFFER_SYSTEM_PROMPT } from "../../services/openrouter";

const STEPS = [
  { key: "avatar", label: "Avatar" },
  { key: "valueEquation", label: "Value Equation" },
  { key: "painsDesires", label: "Pains/Desires" },
  { key: "pricing", label: "Pricing" },
  { key: "bonuses", label: "Bonuses" },
  { key: "urgency", label: "Urgency" },
  { key: "guarantee", label: "Guarantee" },
  { key: "bigDomino", label: "Big Domino" },
  { key: "pitch", label: "Pitch" },
];

function StepNav({ current, completed, onSelect }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto pb-1">
      {STEPS.map((s, i) => {
        const isActive = s.key === current;
        const isDone = completed.includes(s.key);
        return (
          <button
            key={s.key}
            onClick={() => onSelect(s.key)}
            className={`flex flex-col items-center gap-1 px-3 py-2 transition relative min-w-fit ${
              isActive ? "text-blue-400" : isDone ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition ${
              isActive ? "border-blue-500 bg-blue-500/20 text-blue-400" :
              isDone ? "border-emerald-500 bg-emerald-500/20 text-emerald-400" :
              "border-slate-700 text-slate-600"
            }`}>
              {isDone ? "✓" : i + 1}
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap">{s.label}</span>
            {i < STEPS.length - 1 && (
              <div className={`absolute right-0 top-4 w-px h-4 ${isDone ? "bg-emerald-700" : "bg-slate-800"}`} />
            )}
          </button>
        );
      })}
    </div>
  );
}

function EditableSection({ title, content, onSave, isText = true }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(typeof content === "string" ? content : JSON.stringify(content, null, 2));

  function save() {
    try {
      const val = isText ? draft : JSON.parse(draft);
      onSave(val);
      setEditing(false);
    } catch {
      onSave(draft);
      setEditing(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</div>
        <button
          onClick={() => editing ? save() : setEditing(true)}
          className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${
            editing ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" : "bg-white/8 text-slate-400 hover:text-slate-200"
          }`}
        >
          {editing ? "Save" : "Edit"}
        </button>
      </div>
      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={6}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/40 font-mono resize-none"
        />
      ) : (
        <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{draft}</div>
      )}
    </div>
  );
}

function AvatarView({ data, onUpdate }) {
  return (
    <div className="space-y-4">
      <EditableSection title="Headline" content={data.headline || ""} onSave={(v) => onUpdate({ ...data, headline: v })} />
      <EditableSection title="Description" content={data.description || ""} onSave={(v) => onUpdate({ ...data, description: v })} />
      <div className="grid grid-cols-2 gap-4">
        <EditableSection title="Demographics" content={data.demographics || ""} onSave={(v) => onUpdate({ ...data, demographics: v })} />
        <EditableSection title="Psychographics" content={data.psychographics || ""} onSave={(v) => onUpdate({ ...data, psychographics: v })} />
      </div>
    </div>
  );
}

function ValueEquationView({ data, onUpdate }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {["dreamOutcome", "likelihood", "effort", "time"].map((k) => (
        <EditableSection
          key={k}
          title={k.replace(/([A-Z])/g, " $1").trim()}
          content={data[k] || ""}
          onSave={(v) => onUpdate({ ...data, [k]: v })}
        />
      ))}
    </div>
  );
}

function ListSection({ data, field, title, onUpdate }) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{title}</div>
      {(data[field] || []).map((item, i) => (
        <EditableSection
          key={i}
          title={`${i + 1}`}
          content={item}
          onSave={(v) => {
            const arr = [...(data[field] || [])];
            arr[i] = v;
            onUpdate({ ...data, [field]: arr });
          }}
        />
      ))}
    </div>
  );
}

function StepContent({ stepKey, offer, onUpdate }) {
  const data = offer[stepKey];
  const upd = (v) => onUpdate(stepKey, v);

  if (!data) return <div className="text-slate-500 text-sm">No data for this step.</div>;

  switch (stepKey) {
    case "avatar": return <AvatarView data={data} onUpdate={upd} />;
    case "valueEquation": return <ValueEquationView data={data} onUpdate={upd} />;
    case "painsDesires": return (
      <div className="grid grid-cols-2 gap-6">
        <ListSection data={data} field="pains" title="Pains" onUpdate={upd} />
        <ListSection data={data} field="desires" title="Desires" onUpdate={upd} />
      </div>
    );
    case "pricing": return (
      <div className="space-y-4">
        {["price", "model", "reasoning", "anchor"].map((k) => (
          <EditableSection key={k} title={k} content={data[k] || ""} onSave={(v) => upd({ ...data, [k]: v })} />
        ))}
      </div>
    );
    case "bonuses": return (
      <div className="space-y-4">
        {(data || []).map((b, i) => (
          <div key={i} className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-slate-200">{b.name}</div>
              <div className="text-xs text-blue-400 font-semibold">{b.value}</div>
            </div>
            <div className="text-sm text-slate-400">{b.description}</div>
          </div>
        ))}
      </div>
    );
    case "urgency": return (
      <div className="space-y-4">
        {["type", "description", "implementation"].map((k) => (
          <EditableSection key={k} title={k} content={data[k] || ""} onSave={(v) => upd({ ...data, [k]: v })} />
        ))}
      </div>
    );
    case "guarantee": return (
      <div className="space-y-4">
        {["type", "headline", "conditions"].map((k) => (
          <EditableSection key={k} title={k} content={data[k] || ""} onSave={(v) => upd({ ...data, [k]: v })} />
        ))}
      </div>
    );
    case "bigDomino": return (
      <div className="rounded-2xl border border-blue-500/30 bg-blue-500/8 p-6">
        <EditableSection title="The One Belief" content={typeof data === "string" ? data : ""} onSave={upd} />
      </div>
    );
    case "pitch": return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-6">
        <EditableSection title="Final Pitch" content={typeof data === "string" ? data : ""} onSave={upd} />
      </div>
    );
    default: return null;
  }
}

export default function OfferBuilder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [offer, setOffer] = useState(null);
  const [currentStep, setCurrentStep] = useState("avatar");
  const [completed, setCompleted] = useState([]);
  const [marketData, setMarketData] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("tv_market_result");
    if (raw) {
      try { setMarketData(JSON.parse(raw)); } catch { /* ignore */ }
    }
  }, []);

  async function buildOffer() {
    if (!marketData) return;
    setLoading(true);
    setError("");
    setOffer(null);

    try {
      const userMsg = [
        `Niche: ${marketData.niche || "Not specified"}`,
        `Market Score: ${marketData.totalScore || "N/A"}/10`,
        `Recommendation: ${marketData.recommendation}`,
        `Avatar: ${JSON.stringify(marketData.avatar)}`,
        `Top Signals: ${JSON.stringify(marketData.signals)}`,
        `Differentiators: ${JSON.stringify(marketData.differentiators)}`,
      ].join("\n");

      const raw = await complete(OFFER_SYSTEM_PROMPT, userMsg);
      const data = extractJSON(raw);
      setOffer(data);
      setCompleted(["avatar"]);
    } catch (e) {
      setError(e.message || "Failed to build offer. Check your API key.");
    } finally {
      setLoading(false);
    }
  }

  function updateSection(key, value) {
    setOffer((prev) => ({ ...prev, [key]: value }));
    if (!completed.includes(key)) {
      setCompleted((prev) => [...prev, key]);
    }
  }

  function goNext() {
    const idx = STEPS.findIndex((s) => s.key === currentStep);
    if (idx < STEPS.length - 1) {
      const next = STEPS[idx + 1].key;
      if (!completed.includes(currentStep)) {
        setCompleted((p) => [...p, currentStep]);
      }
      setCurrentStep(next);
    } else {
      // Save offer to session and go to report
      sessionStorage.setItem("tv_offer_result", JSON.stringify({ ...marketData, offer }));
      navigate("/report");
    }
  }

  function goPrev() {
    const idx = STEPS.findIndex((s) => s.key === currentStep);
    if (idx > 0) setCurrentStep(STEPS[idx - 1].key);
  }

  const currentIdx = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <ApiKeyGate>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-100">Offer Framework</h1>
            <p className="text-sm text-slate-500 mt-1">Hormozi 9-section offer builder</p>
          </div>
          <span className="text-xs text-blue-400 border border-blue-500/30 bg-blue-500/10 px-3 py-1 rounded-full font-semibold">
            Editable Wizard
          </span>
        </div>

        {/* Market data missing */}
        {!marketData && !loading && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/8 p-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-amber-300">No market analysis found</div>
              <div className="text-xs text-slate-500 mt-0.5">Run a Market Intelligence analysis first to enable the Offer Builder.</div>
            </div>
            <button
              onClick={() => navigate("/market")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-sm transition whitespace-nowrap"
            >
              Go to Market →
            </button>
          </div>
        )}

        {/* Ready to build */}
        {marketData && !offer && !loading && (
          <Card>
            <div className="space-y-4">
              <div className="text-sm text-slate-400">
                Market context loaded: <span className="text-slate-200 font-semibold">{marketData.niche}</span>
                {" "}— Score <span className="text-blue-400 font-bold">{marketData.totalScore}/10</span>
              </div>
              {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                  {error}
                </div>
              )}
              <button
                onClick={buildOffer}
                data-testid="generate-offer-btn"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition"
              >
                Generate Complete Offer →
              </button>
            </div>
          </Card>
        )}

        {loading && <AnalyzingState label="Building your Hormozi offer…" />}

        {/* Wizard */}
        {offer && !loading && (
          <div className="space-y-5">
            {/* Step nav */}
            <Card>
              <StepNav current={currentStep} completed={completed} onSelect={setCurrentStep} />
            </Card>

            {/* Step content */}
            <Card
              title={STEPS.find((s) => s.key === currentStep)?.label}
              subtitle={`Section ${currentIdx + 1} of ${STEPS.length}`}
            >
              <StepContent
                stepKey={currentStep}
                offer={offer}
                onUpdate={updateSection}
              />

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/8">
                <button
                  onClick={goPrev}
                  disabled={currentIdx === 0}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 disabled:opacity-30 hover:bg-white/8 transition"
                >
                  ← Previous
                </button>
                <button
                  onClick={goNext}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-sm transition"
                >
                  {currentIdx === STEPS.length - 1 ? "Generate Report →" : "Next →"}
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </ApiKeyGate>
  );
}
