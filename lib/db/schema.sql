-- Signal Dentsu — GEO/AEO Tracker Database Schema
-- PostgreSQL on AWS RDS

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  target_keywords TEXT[] DEFAULT '{}',
  database_region VARCHAR(10) DEFAULT 'us',
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEMRush data snapshots (historical)
CREATE TABLE IF NOT EXISTS snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  snapshot_type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Keyword tracking history
CREATE TABLE IF NOT EXISTS keyword_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  keyword VARCHAR(500) NOT NULL,
  position INTEGER,
  previous_position INTEGER,
  search_volume INTEGER,
  difficulty REAL,
  cpc REAL,
  in_ai_overview BOOLEAN DEFAULT FALSE,
  serp_features TEXT[] DEFAULT '{}',
  tracked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255),
  report_type VARCHAR(50),
  content JSONB,
  llm_analysis TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site audits
CREATE TABLE IF NOT EXISTS site_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  url VARCHAR(2000),
  score INTEGER,
  checks JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_snapshots_project ON snapshots(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_keyword_tracking_project ON keyword_tracking(project_id, tracked_at DESC);
CREATE INDEX IF NOT EXISTS idx_keyword_tracking_keyword ON keyword_tracking(project_id, keyword);
CREATE INDEX IF NOT EXISTS idx_reports_project ON reports(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_audits_project ON site_audits(project_id, created_at DESC);
