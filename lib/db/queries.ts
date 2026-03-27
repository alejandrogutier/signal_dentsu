/**
 * Typed database queries for Signal Dentsu
 */

import { query, queryOne, execute } from "@/lib/aws/rds";

// ─── Types ───────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  domain: string;
  target_keywords: string[];
  database_region: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Snapshot {
  id: string;
  project_id: string;
  snapshot_type: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface KeywordTracking {
  id: string;
  project_id: string;
  keyword: string;
  position: number;
  previous_position: number;
  search_volume: number;
  difficulty: number;
  cpc: number;
  in_ai_overview: boolean;
  serp_features: string[];
  tracked_at: string;
}

export interface Report {
  id: string;
  project_id: string;
  title: string;
  report_type: string;
  content: Record<string, unknown>;
  llm_analysis: string;
  created_by: string;
  created_at: string;
}

// ─── Projects ────────────────────────────────────────────────

export async function getProjects(userId: string): Promise<Project[]> {
  return query<Project>(
    "SELECT * FROM projects WHERE created_by = $1 ORDER BY updated_at DESC",
    [userId]
  );
}

export async function getProject(id: string): Promise<Project | null> {
  return queryOne<Project>("SELECT * FROM projects WHERE id = $1", [id]);
}

export async function createProject(data: {
  name: string;
  domain: string;
  targetKeywords: string[];
  databaseRegion: string;
  createdBy: string;
}): Promise<Project> {
  const rows = await query<Project>(
    `INSERT INTO projects (name, domain, target_keywords, database_region, created_by)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.name, data.domain, data.targetKeywords, data.databaseRegion, data.createdBy]
  );
  return rows[0];
}

export async function updateProject(
  id: string,
  data: Partial<{ name: string; domain: string; targetKeywords: string[]; databaseRegion: string }>
): Promise<void> {
  const sets: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (data.name !== undefined) { sets.push(`name = $${idx++}`); params.push(data.name); }
  if (data.domain !== undefined) { sets.push(`domain = $${idx++}`); params.push(data.domain); }
  if (data.targetKeywords !== undefined) { sets.push(`target_keywords = $${idx++}`); params.push(data.targetKeywords); }
  if (data.databaseRegion !== undefined) { sets.push(`database_region = $${idx++}`); params.push(data.databaseRegion); }

  sets.push(`updated_at = NOW()`);
  params.push(id);

  await execute(
    `UPDATE projects SET ${sets.join(", ")} WHERE id = $${idx}`,
    params
  );
}

export async function deleteProject(id: string): Promise<void> {
  await execute("DELETE FROM projects WHERE id = $1", [id]);
}

// ─── Snapshots ───────────────────────────────────────────────

export async function saveSnapshot(data: {
  projectId: string;
  snapshotType: string;
  payload: Record<string, unknown>;
}): Promise<Snapshot> {
  const rows = await query<Snapshot>(
    `INSERT INTO snapshots (project_id, snapshot_type, data)
     VALUES ($1, $2, $3) RETURNING *`,
    [data.projectId, data.snapshotType, JSON.stringify(data.payload)]
  );
  return rows[0];
}

export async function getSnapshots(
  projectId: string,
  type?: string,
  limit = 30
): Promise<Snapshot[]> {
  if (type) {
    return query<Snapshot>(
      `SELECT * FROM snapshots WHERE project_id = $1 AND snapshot_type = $2
       ORDER BY created_at DESC LIMIT $3`,
      [projectId, type, limit]
    );
  }
  return query<Snapshot>(
    `SELECT * FROM snapshots WHERE project_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [projectId, limit]
  );
}

// ─── Keyword Tracking ────────────────────────────────────────

export async function saveKeywordTracking(data: {
  projectId: string;
  keywords: {
    keyword: string;
    position: number;
    previousPosition: number;
    searchVolume: number;
    difficulty: number;
    cpc: number;
    inAiOverview: boolean;
    serpFeatures: string[];
  }[];
}): Promise<void> {
  if (data.keywords.length === 0) return;

  const values: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  for (const kw of data.keywords) {
    values.push(
      `($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`
    );
    params.push(
      data.projectId, kw.keyword, kw.position, kw.previousPosition,
      kw.searchVolume, kw.difficulty, kw.cpc, kw.inAiOverview, kw.serpFeatures
    );
  }

  await execute(
    `INSERT INTO keyword_tracking (project_id, keyword, position, previous_position, search_volume, difficulty, cpc, in_ai_overview, serp_features)
     VALUES ${values.join(", ")}`,
    params
  );
}

export async function getKeywordHistory(
  projectId: string,
  keyword?: string,
  limit = 90
): Promise<KeywordTracking[]> {
  if (keyword) {
    return query<KeywordTracking>(
      `SELECT * FROM keyword_tracking WHERE project_id = $1 AND keyword = $2
       ORDER BY tracked_at DESC LIMIT $3`,
      [projectId, keyword, limit]
    );
  }
  return query<KeywordTracking>(
    `SELECT DISTINCT ON (keyword) * FROM keyword_tracking
     WHERE project_id = $1 ORDER BY keyword, tracked_at DESC`,
    [projectId]
  );
}

// ─── Reports ─────────────────────────────────────────────────

export async function saveReport(data: {
  projectId: string;
  title: string;
  reportType: string;
  content: Record<string, unknown>;
  llmAnalysis?: string;
  createdBy: string;
}): Promise<Report> {
  const rows = await query<Report>(
    `INSERT INTO reports (project_id, title, report_type, content, llm_analysis, created_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.projectId, data.title, data.reportType, JSON.stringify(data.content), data.llmAnalysis ?? null, data.createdBy]
  );
  return rows[0];
}

export async function getReports(projectId: string, limit = 20): Promise<Report[]> {
  return query<Report>(
    "SELECT * FROM reports WHERE project_id = $1 ORDER BY created_at DESC LIMIT $2",
    [projectId, limit]
  );
}
