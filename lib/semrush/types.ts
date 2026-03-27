/** SEMRush API response types */

export interface OrganicKeyword {
  keyword: string;
  position: number;
  previousPosition: number;
  positionDifference: number;
  searchVolume: number;
  cpc: number;
  url: string;
  trafficPercent: number;
  trafficCostPercent: number;
  competition: number;
  numberOfResults: number;
  trends: number[];
  serpFeatures: string[];
}

export interface KeywordOverview {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  numberOfResults: number;
  difficulty: number;
  trends: number[];
}

export interface KeywordDifficulty {
  keyword: string;
  difficulty: number;
}

export interface OrganicCompetitor {
  domain: string;
  competitorRelevance: number;
  commonKeywords: number;
  organicKeywords: number;
  organicTraffic: number;
  organicCost: number;
  adwordsKeywords: number;
}

export interface BacklinksOverview {
  total: number;
  domainsNum: number;
  urlsNum: number;
  ipsNum: number;
  followsNum: number;
  nofollowsNum: number;
  textsNum: number;
  imagesNum: number;
}

export interface DomainRank {
  domain: string;
  rank: number;
  organicKeywords: number;
  organicTraffic: number;
  organicCost: number;
  adwordsKeywords: number;
  adwordsTraffic: number;
  adwordsCost: number;
}

export interface PhraseOrganicResult {
  domain: string;
  url: string;
  position: number;
  searchVolume: number;
  cpc: number;
  competition: number;
  trafficPercent: number;
  trafficCostPercent: number;
  numberOfResults: number;
}

export interface RelatedKeyword {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  numberOfResults: number;
  trends: number[];
}

export interface QuestionKeyword {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  numberOfResults: number;
  trends: number[];
}

/** Domain overview for rankings */
export interface DomainOverview {
  rank: DomainRank;
  organicKeywords: OrganicKeyword[];
  totalOrganicKeywords: number;
  totalOrganicTraffic: number;
  totalBacklinks: number;
  aiOverviewKeywords: number;
}

/** SEMRush API error */
export interface SemrushError {
  code: string;
  message: string;
}
