// SWIFT message parser — extracted from App.jsx for reuse across modules

function extractBetweenField59(text) {
  const idx = text.search(/(?:^|\n)\s*59\s*:/i);
  if (idx === -1) return null;
  const after = text.slice(idx);
  const chunk = after
    .replace(/^[\s\S]*?\b59\s*:/i, "")
    .split(/\n\s*\d{2}[A-Z]?\s*:/i)[0];
  const lines = chunk
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
  return lines.length ? lines : null;
}

export function parseSwift(text) {
  const t = (text || "").replace(/\r/g, "");

  const mt = /FIN\s*700|MT\s*700|\bMT700\b/i.test(t)
    ? "MT700"
    : /MT\s*707|\bMT707\b/i.test(t)
    ? "MT707"
    : /MT\s*799|\bMT799\b/i.test(t)
    ? "MT799"
    : /MT\s*199|\bMT199\b/i.test(t)
    ? "MT199"
    : /SBLC|Standby\s+Letter/i.test(t)
    ? "SBLC"
    : /\bBG\b|Bank\s+Guarantee/i.test(t)
    ? "BG"
    : /MT\s*760|\bMT760\b/i.test(t)
    ? "MT760"
    : null;

  const sender = (t.match(/Sender\s*[:\-]?\s*([A-Z0-9]{8,11})/i) || [])[1] || "";
  const receiver = (t.match(/Receiver\s*[:\-]?\s*([A-Z0-9]{8,11})/i) || [])[1] || "";
  const mur = (t.match(/MUR\s*[:\-]?\s*([A-Z0-9]+)/i) || [])[1] || "";
  const mir =
    (t.match(/Message Input Reference\s*[:\-]?\s*([0-9]{4}\s*[0-9]{6}[A-Z0-9]+)/i) || [])[1] ||
    (t.match(/\bMIR\b\s*[:\-]?\s*([0-9]{4}\s*[0-9]{6}[A-Z0-9]+)/i) || [])[1] ||
    "";

  const lc20 =
    (t.match(/(?:^|\n)\s*20\s*:\s*([A-Z0-9\/\-\.\_]+)/m) || [])[1] ||
    (t.match(/Documentary Credit Number\s*[:\-]?\s*([A-Z0-9\/\-\.\_]+)/i) || [])[1] ||
    "";

  const ack = /Network\s+Delivery\s+Status\s*[:\-]?\s*Network\s+Ack/i.test(t) || /\bACK\b/i.test(t);
  const f59 = extractBetweenField59(t);
  const nonOperative = /NON[\s-]*OPERATIVE/i.test(t);
  const ucpLatest = /\bUCP\b\s*LATEST/i.test(t) && !/\bUCP\s*600\b/i.test(t);

  const flags = [];

  if (!mt) flags.push({ level: "ROJO", msg: "No se detecta claramente el tipo de mensaje (MT700/707/799/199/SBLC/BG)." });
  if (!sender) flags.push({ level: "AMARILLO", msg: "No se detecta Sender BIC en el texto." });
  if (!receiver) flags.push({ level: "AMARILLO", msg: "No se detecta Receiver BIC en el texto." });
  if (!mur) flags.push({ level: "AMARILLO", msg: "No se detecta MUR." });
  if (!mir) flags.push({ level: "AMARILLO", msg: "No se detecta MIR / Message Input Reference." });

  if (mt === "MT700") {
    if (!lc20) flags.push({ level: "AMARILLO", msg: "No se detecta Field 20 (LC Number)." });
    if (!f59) {
      flags.push({ level: "ROJO", msg: "Campo 59 (Beneficiary) no aparece / no se puede leer." });
    } else {
      const first = f59[0] || "";
      const hasCompany = /CORP|LTD|LLC|INC|LIMITED|S\.A\.|GMBH|BV/i.test(first);
      const looksAddress = /\d/.test(first) && /(AVE|ST|ROAD|BLVD|UNIT|SUITE|FLOOR|FL)/i.test(first);
      if (!hasCompany && looksAddress) {
        flags.push({ level: "ROJO", msg: "Field 59 parece incompleto: arranca con dirección." });
      }
    }
    if (nonOperative) flags.push({ level: "ROJO", msg: "LC marcada como NON-OPERATIVE." });
    if (ucpLatest) flags.push({ level: "AMARILLO", msg: "UCP dice 'latest version'. Mejor UCP 600 explícito." });
  }

  if (mt === "SBLC" || mt === "BG" || mt === "MT760") {
    if (nonOperative) flags.push({ level: "ROJO", msg: "Instrumento marcado como NON-OPERATIVE." });
    if (!sender && !receiver) flags.push({ level: "ROJO", msg: "No se detectan BIC de banco emisor ni receptor." });
  }

  const uetrNote =
    mt === "MT700"
      ? "UETR es de pagos SWIFT gpi (ej. MT103). Para MT700 normalmente NO hay UETR; se usa MUR/MIR."
      : "UETR aplica si esto es un pago gpi (ej. MT103).";

  return { mt, sender, receiver, mur, mir, lc20, ack, f59, flags, uetrNote };
}

export function getSwiftStatus(parsed) {
  const hasRed = parsed.flags.some((f) => f.level === "ROJO");
  const hasYellow = parsed.flags.some((f) => f.level === "AMARILLO");
  if (hasRed) return "ROJO";
  if (hasYellow) return "AMARILLO";
  return "VERDE";
}
