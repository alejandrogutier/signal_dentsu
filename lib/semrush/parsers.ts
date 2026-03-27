/**
 * SEMRush API returns CSV/TSV data. These parsers convert to typed JSON.
 */

/** Parse SEMRush CSV response into array of objects */
export function parseCsv(csv: string): Record<string, string>[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(";");
  return lines.slice(1).map((line) => {
    const values = line.split(";");
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header.trim()] = values[i]?.trim() ?? "";
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
