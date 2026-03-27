/**
 * SEMRush API returns CSV/TSV data. These parsers convert to typed JSON.
 *
 * IMPORTANT: SEMRush returns full header names ("Keyword", "Position", etc.)
 * even when you request columns by code ("Ph", "Po", etc.).
 * We normalize all headers to short codes so the rest of the codebase can
 * use `r.Ph`, `r.Po`, `r.Nq`, etc. consistently.
 */

/** Reverse mapping: SEMRush full header name → short column code */
const HEADER_TO_CODE: Record<string, string> = {
  // Domain organic / keyword fields
  "Keyword": "Ph",
  "Position": "Po",
  "Previous Position": "Pp",
  "Search Volume": "Nq",
  "CPC": "Cp",
  "Competition": "Co",
  "Traffic (%)": "Tr",
  "Traffic Cost (%)": "Tc",
  "Number of Results": "Nr",
  "Trends": "Td",
  "SERP Features by Position": "Fp",
  "Keyword Difficulty Index": "Kd",
  "Keyword Difficulty": "Kd",

  // Domain rank fields
  "Domain": "Dn",
  "Rank": "Rk",
  "Organic Keywords": "Or",
  "Organic Traffic": "Ot",
  "Organic Cost": "Oc",
  "Adwords Keywords": "Ad",
  "Adwords Traffic": "At",
  "Adwords Cost": "Ac",
  "Date": "Dt",

  // Competitor fields
  "Competitor Relevance": "Cr",
  "Common Keywords": "Np",

  // URL field
  "Url": "Ur",
  "URL": "Ur",
};

/** Parse SEMRush CSV response into array of objects keyed by short codes */
export function parseCsv(csv: string): Record<string, string>[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];

  const rawHeaders = lines[0].split(";");

  // Normalize headers: if they are full names, convert to codes.
  // If they are already codes (Ph, Po, etc.), keep them as is.
  const headers = rawHeaders.map((h) => {
    const trimmed = h.trim();
    return HEADER_TO_CODE[trimmed] ?? trimmed;
  });

  return lines.slice(1).map((line) => {
    const values = line.split(";");
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = values[i]?.trim() ?? "";
    });
    return row;
  });
}

/** Parse numeric value, returns 0 for empty/invalid */
export function num(val: string | undefined): number {
  if (!val) return 0;
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

/** Parse integer value */
export function int(val: string | undefined): number {
  if (!val) return 0;
  const n = parseInt(val, 10);
  return isNaN(n) ? 0 : n;
}

/** Parse trends string "0.45,0.67,..." into number array */
export function parseTrends(val: string | undefined): number[] {
  if (!val) return [];
  return val.split(",").map((v) => num(v));
}

/** Parse SERP features from Fp column (comma-separated feature codes) */
export function parseSerpFeatures(val: string | undefined): string[] {
  if (!val) return [];
  return val.split(",").filter(Boolean);
}

/** Column mapping: SEMRush column codes to human-readable names */
export const COLUMN_MAP: Record<string, string> = {
  Ph: "keyword",
  Po: "position",
  Pp: "previousPosition",
  Nq: "searchVolume",
  Cp: "cpc",
  Co: "competition",
  Tr: "trafficPercent",
  Tc: "trafficCostPercent",
  Nr: "numberOfResults",
  Td: "trends",
  Kd: "difficulty",
  Fp: "serpFeatures",
  Dn: "domain",
  Ur: "url",
  Rk: "rank",
  Or: "organicKeywords",
  Ot: "organicTraffic",
  Oc: "organicCost",
  Ad: "adwordsKeywords",
  At: "adwordsTraffic",
  Ac: "adwordsCost",
  Cr: "competitorRelevance",
  Np: "commonKeywords",
};
