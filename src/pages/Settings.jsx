import { useState } from "react";
import { Card } from "../components/ui/Card";
import { setApiKey, hasApiKey } from "../services/openrouter";
import { VeryFiiWordmark } from "../components/ui/VeryFiiLogo";

export default function Settings() {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(hasApiKey());
  const [model, setModel] = useState(localStorage.getItem("tv_model") || "moonshotai/kimi-k2");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  function saveKey() {
    if (!key.trim().startsWith("sk-")) {
      setError("The key must start with sk-");
      return;
    }
    setApiKey(key.trim());
    setSaved(true);
    setError("");
    setOk("API key saved successfully.");
    setKey("");
    setTimeout(() => setOk(""), 3000);
  }

  function clearKey() {
    localStorage.removeItem("tv_openrouter_key");
    setSaved(false);
    setOk("Key cleared.");
    setTimeout(() => setOk(""), 3000);
  }

  function saveModel() {
    localStorage.setItem("tv_model", model);
    setOk("Model saved.");
    setTimeout(() => setOk(""), 3000);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-100">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">API keys and model configuration</p>
      </div>

      <Card title="Brand" subtitle="Platform identity">
        <VeryFiiWordmark size="md" />
        <p className="text-xs text-slate-600 mt-3">
          Drop your logo PNG at <code className="text-slate-400">public/logo.png</code> to replace the SVG mark.
        </p>
      </Card>

      <Card title="OpenRouter API Key" subtitle="Used for all AI analysis features">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${saved ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
            <span className="text-sm text-slate-400">
              {saved ? "API key is configured" : "No API key configured"}
            </span>
          </div>

          <input
            type="password"
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(""); }}
            placeholder="sk-or-..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/40 placeholder:text-slate-600"
          />

          {error && <p className="text-rose-400 text-xs">{error}</p>}
          {ok && <p className="text-emerald-400 text-xs">{ok}</p>}

          <div className="flex gap-3">
            <button
              onClick={saveKey}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition"
            >
              Save Key
            </button>
            {saved && (
              <button
                onClick={clearKey}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/10 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </Card>

      <Card title="AI Model" subtitle="OpenRouter model ID">
        <div className="space-y-3">
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/40 font-mono"
          />
          <p className="text-xs text-slate-600">Default: moonshotai/kimi-k2 (Kimi K2 via OpenRouter)</p>
          <button
            onClick={saveModel}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition"
          >
            Save Model
          </button>
        </div>
      </Card>

      <Card title="Data" subtitle="Session & local storage">
        <div className="space-y-3">
          <p className="text-sm text-slate-400">
            Market analysis, offer, and trade results are stored in <code className="text-slate-300">sessionStorage</code> and cleared when you close the tab. Your API key is stored in <code className="text-slate-300">localStorage</code>.
          </p>
          <button
            onClick={() => { sessionStorage.clear(); setOk("Session data cleared."); setTimeout(() => setOk(""), 3000); }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/10 transition"
          >
            Clear session data
          </button>
        </div>
      </Card>
    </div>
  );
}
