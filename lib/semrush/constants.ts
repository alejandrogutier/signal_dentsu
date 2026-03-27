/** SEMRush API constants */

export const SEMRUSH_BASE_URL = "https://api.semrush.com/";
export const SEMRUSH_BACKLINKS_URL = "https://api.semrush.com/analytics/v1/";
export const SEMRUSH_TRENDS_URL = "https://api.semrush.com/analytics/ta/api/v3/";

/** Regional databases available in SEMRush */
export const DATABASES = {
  us: "United States",
  uk: "United Kingdom",
  ca: "Canada",
  au: "Australia",
  de: "Germany",
  fr: "France",
  es: "Spain",
  it: "Italy",
  br: "Brazil",
  mx: "Mexico",
  ar: "Argentina",
  co: "Colombia",
  cl: "Chile",
  jp: "Japan",
  in: "India",
} as const;

export type Database = keyof typeof DATABASES;

/** SERP Feature codes tracked by SEMRush */
export const SERP_FEATURES = {
  aio: "AI Overview",
  aim: "AI Summary",
  aic: "AI Chat",
  ais: "AI Stories",
  aai: "Ask AI",
  fsn: "Featured Snippet",
  rel: "People Also Ask",
  res: "Related Searches",
  kng: "Knowledge Panel",
  knw: "Instant Answer",
  geo: "Local Pack",
  img: "Images",
  vid: "Video",
  vib: "Featured Video",
  new: "Top Stories",
  shp: "Shopping Ads",
  adt: "AdWords Top",
  adb: "AdWords Bottom",
  stl: "Sitelinks",
  rev: "Reviews",
  car: "Organic Carousel",
  amp: "AMP",
  twt: "Twitter/X",
  app: "Apps Block",
  job: "Jobs",
  hot: "Hotels",
  flg: "Flights",
  ind: "Indented",
} as const;

export type SerpFeatureCode = keyof typeof SERP_FEATURES;

/** AI-specific SERP feature codes */
export const AI_SERP_FEATURES: SerpFeatureCode[] = ["aio", "aim", "aic", "ais", "aai"];

/** Export columns commonly used */
export const EXPORT_COLUMNS = {
  domainOrganic: "Ph,Po,Pp,Nq,Cp,Co,Tr,Tc,Nr,Td,Fp",
  keywordOverview: "Ph,Nq,Cp,Co,Nr,Kd,Td",
  keywordDifficulty: "Ph,Kd",
  competitors: "Dn,Cr,Np,Or,Ot,Oc,Ad",
  backlinksOverview: "total,domains_num,urls_num,ips_num,follows_num,nofollows_num,texts_num,images_num",
  domainRank: "Dn,Rk,Or,Ot,Oc,Ad,At,Ac",
  phraseOrganic: "Dn,Ur,Po,Nq,Cp,Co,Tr,Tc,Nr",
} as const;
