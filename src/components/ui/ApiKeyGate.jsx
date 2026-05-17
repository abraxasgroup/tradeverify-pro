import { useState } from "react";
import { setApiKey, hasApiKey } from "../../services/openrouter";
import { VeryFiiMark } from "./VeryFiiLogo";

export function ApiKeyGate({ children }) {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(hasApiKey());
  const [error, setError] = useState("");

  function save() {
    if (!key.trim().startsWith("sk-")) {
      setError("The key must start with sk-");
      return;
    }
    setApiKey(key.trim());
    setSaved(true);
  }

  if (saved) return children;

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d1025] p-8 space-y-6">
        <div className="flex items-center gap-3">
          <VeryFiiMark size={40} />
          <div>
            <div className="text-lg font-black text-slate-200">AI Features</div>
            <div className="text-xs text-slate-500">OpenRouter API key required</div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-slate-400 uppercase tracking-wider">
            OpenRouter API Key
          </label>
          <input
            type="password"
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(""); }}
            placeholder="sk-or-..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/40 placeholder:text-slate-600"
          />
          {error && <p className="text-rose-400 text-xs">{error}</p>}
          <p className="text-slate-600 text-xs">
            Model: <span className="text-slate-400">moonshotai/kimi-k2</span> via OpenRouter.
            Your key is stored locally only.
          </p>
        </div>

        <button
          onClick={save}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-3 text-sm font-bold text-white transition"
        >
          Save & Continue
        </button>
      </div>
    </div>
  );
}
