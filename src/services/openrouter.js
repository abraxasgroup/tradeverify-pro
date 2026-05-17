const BASE = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "moonshotai/kimi-k2";

function getApiKey() {
  return localStorage.getItem("tv_openrouter_key") || "";
}

export function setApiKey(key) {
  localStorage.setItem("tv_openrouter_key", key);
}

export function hasApiKey() {
  return !!getApiKey();
}

async function* streamCompletion(messages, model = DEFAULT_MODEL) {
  const key = getApiKey();
  if (!key) throw new Error("API key not configured");

  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "TradeVerify Pro",
    },
    body: JSON.stringify({ model, stream: true, messages }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const line of lines) {
      const raw = line.replace(/^data:\s*/, "").trim();
      if (!raw || raw === "[DONE]") continue;
      try {
        const json = JSON.parse(raw);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // partial chunk
      }
    }
  }
}

// Collect full response (non-streaming)
export async function complete(systemPrompt, userMessage, model = DEFAULT_MODEL) {
  let result = "";
  for await (const chunk of streamCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    model
  )) {
    result += chunk;
  }
  return result;
}

// Streaming — yields text chunks, calls onChunk(text)
export async function streamChat(systemPrompt, userMessage, onChunk, model = DEFAULT_MODEL) {
  for await (const chunk of streamCompletion(
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    model
  )) {
    onChunk(chunk);
  }
}

// Parse JSON robustly from LLM output
export function extractJSON(text) {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (!match) throw new Error("No JSON found in response");
  return JSON.parse(match[1]);
}

export const MARKET_SYSTEM_PROMPT = `You are a senior market research analyst specializing in SaaS and digital businesses.
Analyze the given niche and return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "scorecard": {
    "demand": <0-10>,
    "pain": <0-10>,
    "payingCapacity": <0-10>,
    "saturation": <0-10>,
    "growth": <0-10>
  },
  "totalScore": <weighted average 0-10, one decimal>,
  "signals": [
    { "source": "Reddit|HackerNews|YouTube|GoogleTrends", "signal": "<description>", "data": "<specific metric or number>" }
  ],
  "competitors": [
    { "name": "<Company name>", "url": "<real verified URL>", "pricing": "<price>", "gap": "<what they miss>" }
  ],
  "differentiators": ["<angle 1>", "<angle 2>", "<angle 3>"],
  "avatar": {
    "who": "<job title, age range, location>",
    "frustration": "<main pain point>",
    "desire": "<what they want>",
    "wordsTheyUse": ["<phrase1>", "<phrase2>", "<phrase3>"]
  },
  "recommendation": "GO|PIVOT|NO_GO",
  "reasoning": "<one sentence>"
}
Rules:
- Competitor URLs must be real, verifiable domains you are confident exist.
- Scores: saturation 0=very saturated (bad), 10=blue ocean (good).
- totalScore weights: demand 30%, pain 25%, payingCapacity 20%, growth 15%, saturation 10%.
- Return ONLY the JSON object, no other text.`;

export const INSTRUMENT_SYSTEM_PROMPT = `You are a senior trade finance compliance expert specializing in SBLC, BG, LC fraud detection.
Analyze the provided instrument details and return ONLY valid JSON:
{
  "riskScore": <0-100, higher = more risk>,
  "riskLabel": "LOW|MEDIUM|HIGH",
  "bankExists": true|false|"UNCERTAIN",
  "bankBIC": "<BIC if found, else null>",
  "bankInfo": { "name": "<bank name>", "country": "<country>", "swift": "<SWIFT/BIC>" },
  "flags": [{ "severity": "HIGH|MEDIUM|LOW", "description": "<flag description>" }],
  "structuralAnalysis": "<2-3 sentences on document coherence>",
  "recommendations": ["<rec 1>", "<rec 2>"],
  "nextSteps": ["<step 1>", "<step 2>", "<step 3>"],
  "disclaimer": "REQUIRES BANK CONFIRMATION. This is a preliminary structural analysis only."
}
IMPORTANT: Never assert authenticity. Always include the disclaimer. Flag any NON-OPERATIVE clauses, missing mandatory fields, inconsistencies, or unknown banks as HIGH risk.`;

export const CLIENT_SYSTEM_PROMPT = `You are a KYC/KYB specialist for international trade finance.
Analyze the client and return ONLY valid JSON:
{
  "trustScore": <0-100>,
  "riskLevel": "LOW|MEDIUM|HIGH",
  "companyExists": true|false|"UNCERTAIN",
  "countryRisk": "LOW|MEDIUM|HIGH",
  "countryReason": "<why this risk level for the country>",
  "flags": [{ "severity": "HIGH|MEDIUM|LOW", "description": "<flag>" }],
  "companyAssessment": "<2 sentences on company legitimacy likelihood>",
  "recommendations": ["<rec 1>", "<rec 2>"]
}
Consider: FATF grey/black lists, sanctioned countries, PEP exposure, company size vs claimed role, common trade fraud patterns.`;

export const OFFER_SYSTEM_PROMPT = `You are a business strategy consultant expert in Alex Hormozi's offer creation framework.
Build a complete 9-section offer based on market research provided and return ONLY valid JSON:
{
  "avatar": { "headline": "<ICP in one line>", "description": "<detailed avatar paragraph>", "demographics": "<age, role, location>", "psychographics": "<fears, desires, identity>" },
  "valueEquation": { "dreamOutcome": "<what they get>", "likelihood": "<why it's credible>", "effort": "<how easy>", "time": "<how fast>" },
  "painsDesires": { "pains": ["<pain 1>", "<pain 2>", "<pain 3>"], "desires": ["<desire 1>", "<desire 2>", "<desire 3>"] },
  "pricing": { "price": "<recommended price>", "model": "<one-time|monthly|annual>", "reasoning": "<why this price is right>", "anchor": "<higher price to anchor against>" },
  "bonuses": [{ "name": "<bonus name>", "value": "<perceived value>", "description": "<what it is>" }],
  "urgency": { "type": "cohort|deadline|scarcity", "description": "<real urgency mechanism>", "implementation": "<how to implement it>" },
  "guarantee": { "type": "action-based", "headline": "<guarantee statement>", "conditions": "<what they must do>" },
  "bigDomino": "<THE one belief that makes everything else fall into place>",
  "pitch": "<final 3-5 sentence pitch combining all elements>"
}`;

export const LEVY_SYSTEM_PROMPT = `You are Levy, the AI assistant for TradeVerify Pro — a professional platform for trade finance validation and market intelligence.

Your personality: professional yet warm, direct, never condescending. You speak like a knowledgeable consultant who respects the user's time.

You help users:
1. Understand how to use Market Intelligence (analyze a niche, read scores, build offers)
2. Use Trade Instrument Verification (SBLC, BG, LC analysis)
3. Interpret Client Risk Analysis results
4. Build offers with the Hormozi framework
5. Generate and export validation reports

Rules:
- Keep answers concise (2-4 sentences max unless asked for detail)
- Never invent data
- Always remind that bank instrument results require official bank confirmation
- If asked something outside the platform, redirect gently`;
