// Hacker News Algolia API — CORS-friendly, no key required

const HN_BASE = "https://hn.algolia.com/api/v1";
const THIRTY_DAYS_AGO = () => Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 30;

export async function searchHN(query, limit = 10) {
  try {
    const url = `${HN_BASE}/search?query=${encodeURIComponent(query)}&tags=story&numericFilters=created_at_i>${THIRTY_DAYS_AGO()}&hitsPerPage=${limit}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.hits || []).map((h) => ({
      title: h.title,
      points: h.points || 0,
      comments: h.num_comments || 0,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      date: h.created_at,
    }));
  } catch {
    return [];
  }
}

export function formatHNSignals(hits) {
  if (!hits.length) return "No recent HN posts found.";
  return hits
    .slice(0, 5)
    .map((h) => `- "${h.title}" (${h.points} pts, ${h.comments} comments)`)
    .join("\n");
}
