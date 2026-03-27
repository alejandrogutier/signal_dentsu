/**
 * SEMRush API Client
 *
 * Wraps all SEMRush API calls with caching, CSV parsing, and typed responses.
 * Base URL: https://api.semrush.com/
 * Auth: query parameter `key=API_KEY`
 * Response format: CSV (semicolon-delimited)
 */

import { SEMRUSH_BASE_URL, EXPORT_COLUMNS, type Database } from "./constants";
import { parseCsv, num, int, parseTrends, parseSerpFeatures } from "./parsers";
import type {
  OrganicKeyword,
  KeywordOverview,
  KeywordDifficulty,
  OrganicCompetitor,
  BacklinksOverview,
  DomainRank,
  PhraseOrganicResult,
  RelatedKeyword,
  QuestionKeyword,
} from "./types";

const API_KEY = process.env.SEMRUSH_API_KEY;

/** Simple in-memory cache with TTL */
const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) return entry.data as T;
  if (entry) cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
}

/** Core fetch function for SEMRush API */
async function semrushFetch(params: Record<string, string>): Promise<string> {
  if (!API_KEY) throw new Error("SEMRUSH_API_KEY not configured");

  const searchParams = new URLSearchParams({ ...params, key: API_KEY });
  const url = `${SEMRUSH_BASE_URL}?${searchParams}`;

  const cacheKey = url.replace(API_KEY, "***");
  const cached = getCached<string>(cacheKey);
  if (cached) return cached;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SEMRush API error (${res.status}): ${text}`);
  }

  const text = await res.text();

  // SEMRush returns "ERROR X :: message" for errors
  if (text.startsWith("ERROR")) {
    throw new Error(`SEMRush: ${text}`);
  }

  setCache(cacheKey, text);
  return text;
}

// ─── Domain Analytics ────────────────────────────────────────

/** Get organic keywords for a domain */
export async function getDomainOrganic(
  domain: string,
  database: Database = "us",
  limit = 50,
  offset = 0,
  sortBy = "tr_desc",
  filter?: string
): Promise<OrganicKeyword[]> {
  const params: Record<string, string> = {
    type: "domain_organic",
    domain,
    database,
    display_limit: String(limit),
    display_offset: String(offset),
    display_sort: sortBy,
    export_columns: EXPORT_COLUMNS.domainOrganic,
  };
  if (filter) params.display_filter = filter;

  const csv = await semrushFetch(params);
  const rows = parseCsv(csv);

  return rows.map((r) => ({
    keyword: r.Ph ?? "",
    position: int(r.Po),
    previousPosition: int(r.Pp),
    positionDifference: int(r.Po) - int(r.Pp),
    searchVolume: int(r.Nq),
    cpc: num(r.Cp),
    url: r.Ur ?? "",
    trafficPercent: num(r.Tr),
    trafficCostPercent: num(r.Tc),
    competition: num(r.Co),
    numberOfResults: int(r.Nr),
    trends: parseTrends(r.Td),
    serpFeatures: parseSerpFeatures(r.Fp),
  }));
}

/** Get domain organic keywords that appear in AI Overviews */
export async function getDomainAiOverviewKeywords(
  domain: string,
  database: Database = "us",
  limit = 50
): Promise<OrganicKeyword[]> {
  return getDomainOrganic(domain, database, limit, 0, "tr_desc", "+|Fp|Eq|aio");
}

/** Get domain rank overview */
export async function getDomainRank(
  domain: string,
  database: Database = "us"
): Promise<DomainRank | null> {
  const csv = await semrushFetch({
    type: "domain_rank",
    domain,
    database,
    export_columns: EXPORT_COLUMNS.domainRank,
  });
  const rows = parseCsv(csv);
  if (!rows[0]) return null;

  const r = rows[0];
  return {
    domain: r.Dn ?? domain,
    rank: int(r.Rk),
    organicKeywords: int(r.Or),
    organicTraffic: int(r.Ot),
    organicCost: num(r.Oc),
    adwordsKeywords: int(r.Ad),
    adwordsTraffic: int(r.At),
    adwordsCost: num(r.Ac),
  };
}

/** Get domain rank history (monthly) */
export async function getDomainRankHistory(
  domain: string,
  database: Database = "us"
): Promise<DomainRank[]> {
  const csv = await semrushFetch({
    type: "domain_rank_history",
    domain,
    database,
    export_columns: "Dt,Rk,Or,Ot,Oc,Ad,At,Ac",
  });
  const rows = parseCsv(csv);
  return rows.map((r) => ({
    domain,
    rank: int(r.Rk),
    organicKeywords: int(r.Or),
    organicTraffic: int(r.Ot),
    organicCost: num(r.Oc),
    adwordsKeywords: int(r.Ad),
    adwordsTraffic: int(r.At),
    adwordsCost: num(r.Ac),
  }));
}

// ─── Keyword Analytics ───────────────────────────────────────

/** Get keyword overview for one or more keywords */
export async function getKeywordOverview(
  keywords: string[],
  database: Database = "us"
): Promise<KeywordOverview[]> {
  const csv = await semrushFetch({
    type: "phrase_this",
    phrase: keywords.join(";"),
    database,
    export_columns: EXPORT_COLUMNS.keywordOverview,
  });
  const rows = parseCsv(csv);
  return rows.map((r) => ({
    keyword: r.Ph ?? "",
    searchVolume: int(r.Nq),
    cpc: num(r.Cp),
    competition: num(r.Co),
    numberOfResults: int(r.Nr),
    difficulty: num(r.Kd),
    trends: parseTrends(r.Td),
  }));
}

/** Get keyword difficulty for multiple keywords */
export async function getKeywordDifficulty(
  keywords: string[],
  database: Database = "us"
): Promise<KeywordDifficulty[]> {
  const csv = await semrushFetch({
    type: "phrase_kdi",
    phrase: keywords.join(";"),
    database,
    export_columns: EXPORT_COLUMNS.keywordDifficulty,
  });
  const rows = parseCsv(csv);
  return rows.map((r) => ({
    keyword: r.Ph ?? "",
    difficulty: num(r.Kd),
  }));
}

/** Get domains ranking for a keyword */
export async function getKeywordOrganicResults(
  keyword: string,
  database: Database = "us",
  limit = 20
): Promise<PhraseOrganicResult[]> {
  const csv = await semrushFetch({
    type: "phrase_organic",
    phrase: keyword,
    database,
    display_limit: String(limit),
    export_columns: EXPORT_COLUMNS.phraseOrganic,
  });
  const rows = parseCsv(csv);
  return rows.map((r) => ({
    domain: r.Dn ?? "",
    url: r.Ur ?? "",
    position: int(r.Po),
    searchVolume: int(r.Nq),
    cpc: num(r.Cp),
    competition: num(r.Co),
    trafficPercent: num(r.Tr),
    trafficCostPercent: num(r.Tc),
    numberOfResults: int(r.Nr),
  }));
}

/** Get related keywords */
export async function getRelatedKeywords(
  keyword: string,
  database: Database = "us",
  limit = 20
): Promise<RelatedKeyword[]> {
  const csv = await semrushFetch({
    type: "phrase_related",
    phrase: keyword,
    database,
    display_limit: String(limit),
    export_columns: EXPORT_COLUMNS.keywordOverview,
  });
  const rows = parseCsv(csv);
  return rows.map((r) => ({
    keyword: r.Ph ?? "",
    searchVolume: int(r.Nq),
    cpc: num(r.Cp),
    competition: num(r.Co),
    numberOfResults: int(r.Nr),
    trends: parseTrends(r.Td),
  }));
}

/** Get question-based keyword variations */
export async function getQuestionKeywords(
  keyword: string,
  database: Database = "us",
  limit = 20
): Promise<QuestionKeyword[]> {
  const csv = await semrushFetch({
    type: "phrase_questions",
    phrase: keyword,
    database,
    display_limit: String(limit),
    export_columns: EXPORT_COLUMNS.keywordOverview,
  });
  const rows = parseCsv(csv);
  return rows.map((r) => ({
    keyword: r.Ph ?? "",
    searchVolume: int(r.Nq),
    cpc: num(r.Cp),
    competition: num(r.Co),
    numberOfResults: int(r.Nr),
    trends: parseTrends(r.Td),
  }));
}

// ─── Competitor Analysis ─────────────────────────────────────

/** Get organic competitors for a domain */
export async function getOrganicCompetitors(
  domain: string,
  database: Database = "us",
  limit = 20
): Promise<OrganicCompetitor[]> {
  const csv = await semrushFetch({
    type: "domain_organic_organic",
    domain,
    database,
    display_limit: String(limit),
    export_columns: EXPORT_COLUMNS.competitors,
  });
  const rows = parseCsv(csv);
  return rows.map((r) => ({
    domain: r.Dn ?? "",
    competitorRelevance: num(r.Cr),
    commonKeywords: int(r.Np),
    organicKeywords: int(r.Or),
    organicTraffic: int(r.Ot),
    organicCost: num(r.Oc),
    adwordsKeywords: int(r.Ad),
  }));
}

// ─── Backlinks ───────────────────────────────────────────────

/** Get backlinks overview for a domain */
export async function getBacklinksOverview(
  domain: string
): Promise<BacklinksOverview | null> {
  const csv = await semrushFetch({
    type: "backlinks_overview",
    target: domain,
    target_type: "root_domain",
    export_columns: EXPORT_COLUMNS.backlinksOverview,
  });
  const rows = parseCsv(csv);
  if (!rows[0]) return null;

  const r = rows[0];
  return {
    total: int(r.total),
    domainsNum: int(r.domains_num),
    urlsNum: int(r.urls_num),
    ipsNum: int(r.ips_num),
    followsNum: int(r.follows_num),
    nofollowsNum: int(r.nofollows_num),
    textsNum: int(r.texts_num),
    imagesNum: int(r.images_num),
  };
}

// ─── URL Analytics ───────────────────────────────────────────

/** Get organic keywords for a specific URL */
export async function getUrlOrganic(
  url: string,
  database: Database = "us",
  limit = 50
): Promise<OrganicKeyword[]> {
  const csv = await semrushFetch({
    type: "url_organic",
    url,
    database,
    display_limit: String(limit),
    export_columns: EXPORT_COLUMNS.domainOrganic,
  });
  const rows = parseCsv(csv);
  return rows.map((r) => ({
    keyword: r.Ph ?? "",
    position: int(r.Po),
    previousPosition: int(r.Pp),
    positionDifference: int(r.Po) - int(r.Pp),
    searchVolume: int(r.Nq),
    cpc: num(r.Cp),
    url,
    trafficPercent: num(r.Tr),
    trafficCostPercent: num(r.Tc),
    competition: num(r.Co),
    numberOfResults: int(r.Nr),
    trends: parseTrends(r.Td),
    serpFeatures: parseSerpFeatures(r.Fp),
  }));
}
