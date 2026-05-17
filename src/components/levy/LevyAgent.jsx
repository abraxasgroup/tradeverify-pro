import { useState, useRef, useEffect } from "react";
import { streamChat, LEVY_SYSTEM_PROMPT } from "../../services/openrouter";
import { hasApiKey } from "../../services/openrouter";

function LevyAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-900/40">
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M6 20v-1a6 6 0 0112 0v1" strokeLinecap="round" />
        <path d="M18 12l2 2-2 2M6 12l-2 2 2 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && <LevyAvatar />}
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-blue-600 text-white rounded-tr-sm"
            : "bg-white/8 text-slate-200 rounded-tl-sm border border-white/8"
        }`}
      >
        {msg.content}
        {msg.streaming && (
          <span className="inline-block w-0.5 h-3.5 bg-blue-400 ml-0.5 animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}

export function LevyAgent() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm Levy, your Validation AI. I can guide you through Market Intelligence, Trade Instrument Verification, and Client Risk Analysis. How can I help?",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || streaming) return;

    if (!hasApiKey()) {
      setMessages((p) => [
        ...p,
        { role: "user", content: text },
        { role: "assistant", content: "Please configure your OpenRouter API key in Settings first." },
      ]);
      setInput("");
      return;
    }

    setMessages((p) => [...p, { role: "user", content: text }]);
    setInput("");
    setStreaming(true);

    // Add empty assistant message to stream into
    setMessages((p) => [...p, { role: "assistant", content: "", streaming: true }]);

    try {
      await streamChat(
        LEVY_SYSTEM_PROMPT,
        text,
        (chunk) => {
          setMessages((p) => {
            const copy = [...p];
            const last = { ...copy[copy.length - 1] };
            last.content += chunk;
            copy[copy.length - 1] = last;
            return copy;
          });
        }
      );
    } catch (e) {
      setMessages((p) => {
        const copy = [...p];
        copy[copy.length - 1] = { role: "assistant", content: `Error: ${e.message}` };
        return copy;
      });
    } finally {
      // Remove streaming flag
      setMessages((p) => {
        const copy = [...p];
        const last = { ...copy[copy.length - 1] };
        delete last.streaming;
        copy[copy.length - 1] = last;
        return copy;
      });
      setStreaming(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          data-testid="levy-toggle"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-3 rounded-2xl shadow-xl shadow-blue-900/40 transition"
        >
          <LevyAvatar />
          <span className="text-sm">Meet Levy</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          data-testid="levy-panel"
          className="fixed bottom-6 right-6 z-50 w-80 rounded-3xl border border-white/12 bg-[#0d1025] shadow-2xl shadow-black/60 flex flex-col overflow-hidden"
          style={{ maxHeight: "500px" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/8 bg-white/4">
            <div className="flex items-center gap-2">
              <LevyAvatar />
              <div>
                <div className="text-sm font-bold text-slate-200">Levy</div>
                <div className="text-xs text-blue-400">Your Validation AI</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-500 hover:text-slate-300 transition text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((m, i) => (
              <Message key={i} msg={m} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-white/8">
            <div className="flex gap-2 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Levy anything…"
                data-testid="levy-input"
                className="flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600"
              />
              <button
                onClick={send}
                disabled={streaming || !input.trim()}
                className="px-3 text-blue-400 hover:text-blue-300 disabled:opacity-30 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="text-center text-[10px] text-slate-600 mt-1.5">Levy · Veryfii Validator AI</div>
          </div>
        </div>
      )}
    </>
  );
}
