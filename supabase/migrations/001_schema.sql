-- ============================================================
-- Zolve HomeBase — Migration 001: Schema
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- companies
-- ============================================================
CREATE TABLE companies (
  id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_raw           text NOT NULL,
  canonical_name     text NOT NULL,
  normalized_name    text NOT NULL,
  domain             text,
  ats_provider       text DEFAULT 'greenhouse',
  ats_board_token    text,
  sponsor_flag       boolean DEFAULT false,
  sponsor_score      numeric(5,2),
  role_grades        jsonb DEFAULT '{}',
  approval_rate      numeric(5,2),
  years_sponsoring   int,
  recent_activity    text,
  industry           text,
  company_size       text,
  headquarters       text,
  logo_url           text,
  last_synced_at     timestamptz,
  created_at         timestamptz DEFAULT now()
);

-- ============================================================
-- company_aliases
-- ============================================================
CREATE TABLE company_aliases (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alias_raw   text NOT NULL,
  company_id  uuid REFERENCES companies(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- job_postings
-- ============================================================
CREATE TABLE job_postings (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id        uuid REFERENCES companies(id) ON DELETE CASCADE,
  source_ats        text NOT NULL DEFAULT 'greenhouse',
  source_job_id     text NOT NULL,
  title             text NOT NULL,
  normalized_title  text,
  role_category     text,
  seniority         text,
  track             text,
  description_html  text,
  locations         jsonb DEFAULT '[]',
  employment_type   text,
  remote            text,
  salary_min        numeric,
  salary_max        numeric,
  salary_source     text,
  posted_at         timestamptz,
  updated_at        timestamptz DEFAULT now(),
  source_url        text NOT NULL,
  tags              text[] DEFAULT '{}',
  jsonld            jsonb,
  is_active         boolean DEFAULT true,
  inactive_since    timestamptz,
  search_vector     tsvector,
  created_at        timestamptz DEFAULT now(),
  UNIQUE(source_ats, source_job_id)
);

-- ============================================================
-- uscis_sponsor_records
-- ============================================================
CREATE TABLE uscis_sponsor_records (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_name_raw     text NOT NULL,
  normalized_name       text,
  tax_id_last4          text,
  naics                 text,
  fiscal_year           int NOT NULL,
  initial_approvals     int DEFAULT 0,
  initial_denials       int DEFAULT 0,
  continuing_approvals  int DEFAULT 0,
  continuing_denials    int DEFAULT 0,
  city                  text,
  state                 text,
  zip                   text,
  company_id            uuid REFERENCES companies(id),
  match_confidence      numeric,
  match_method          text,
  created_at            timestamptz DEFAULT now()
);

-- ============================================================
-- dol_lca_records
-- ============================================================
CREATE TABLE dol_lca_records (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_name_raw text NOT NULL,
  normalized_name   text,
  soc_code          text,
  job_title         text,
  worksite_city     text,
  worksite_state    text,
  prevailing_wage   numeric,
  offered_wage      numeric,
  case_status       text,
  decision_date     date,
  company_id        uuid REFERENCES companies(id),
  match_confidence  numeric,
  match_method      text,
  created_at        timestamptz DEFAULT now()
);

-- ============================================================
-- users  (id mirrors auth.users.id)
-- ============================================================
CREATE TABLE users (
  id                    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  google_sub            text UNIQUE,
  zolve_user_id         text,
  name                  text,
  email                 text NOT NULL,
  mobile                text,
  status_type           text CHECK (status_type IN ('student','wp','dependent')),
  visa_status           text CHECK (visa_status IN ('F-1','OPT','H-1B','other')),
  opt_status            text,
  grad_year             int,
  preferred_role        text,
  resume_url            text,
  visible_to_employers  boolean DEFAULT false,
  consent_version       text,
  consent_at            timestamptz,
  onboarding_complete   boolean DEFAULT false,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- ============================================================
-- user_education
-- ============================================================
CREATE TABLE user_education (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid REFERENCES users(id) ON DELETE CASCADE,
  level           text,
  university      text,
  field_of_study  text,
  start_date      date,
  end_date        date,
  created_at      timestamptz DEFAULT now()
);

-- ============================================================
-- user_employment
-- ============================================================
CREATE TABLE user_employment (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid REFERENCES users(id) ON DELETE CASCADE,
  company      text,
  designation  text,
  start_date   date,
  end_date     date,
  is_current   boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

-- ============================================================
-- user_profile_completion
-- ============================================================
CREATE TABLE user_profile_completion (
  user_id     uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  percent     numeric DEFAULT 0,
  breakdown   jsonb DEFAULT '{}',
  updated_at  timestamptz DEFAULT now()
);

-- ============================================================
-- saved_jobs
-- ============================================================
CREATE TABLE saved_jobs (
  user_id   uuid REFERENCES users(id) ON DELETE CASCADE,
  job_id    uuid REFERENCES job_postings(id) ON DELETE CASCADE,
  saved_at  timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, job_id)
);

-- ============================================================
-- job_views
-- ============================================================
CREATE TABLE job_views (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid REFERENCES users(id) ON DELETE SET NULL,
  job_id     uuid REFERENCES job_postings(id) ON DELETE CASCADE,
  viewed_at  timestamptz DEFAULT now()
);

-- ============================================================
-- company_views
-- ============================================================
CREATE TABLE company_views (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid REFERENCES users(id) ON DELETE SET NULL,
  company_id  uuid REFERENCES companies(id) ON DELETE CASCADE,
  viewed_at   timestamptz DEFAULT now()
);

-- ============================================================
-- applications
-- ============================================================
CREATE TABLE applications (
  id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          uuid REFERENCES users(id) ON DELETE CASCADE,
  job_id           uuid REFERENCES job_postings(id) ON DELETE CASCADE,
  clicked_apply_at timestamptz DEFAULT now(),
  response         text CHECK (response IN ('applied','saved_for_later','not_yet')),
  responded_at     timestamptz,
  UNIQUE(user_id, job_id)
);

-- ============================================================
-- job_alerts
-- ============================================================
CREATE TABLE job_alerts (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid REFERENCES users(id) ON DELETE CASCADE,
  query_json  jsonb NOT NULL,
  frequency   text DEFAULT 'daily',
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================

-- companies
CREATE INDEX idx_companies_normalized_name ON companies USING gin(normalized_name gin_trgm_ops);
CREATE INDEX idx_companies_sponsor_score ON companies(sponsor_score DESC NULLS LAST);
CREATE INDEX idx_companies_ats_board_token ON companies(ats_board_token);

-- company_aliases
CREATE INDEX idx_aliases_alias_raw ON company_aliases USING gin(alias_raw gin_trgm_ops);
CREATE INDEX idx_aliases_company_id ON company_aliases(company_id);

-- job_postings
CREATE INDEX idx_jobs_company_id ON job_postings(company_id);
CREATE INDEX idx_jobs_is_active ON job_postings(is_active) WHERE is_active = true;
CREATE INDEX idx_jobs_posted_at ON job_postings(posted_at DESC);
CREATE INDEX idx_jobs_search_vector ON job_postings USING gin(search_vector);
CREATE INDEX idx_jobs_role_category ON job_postings(role_category);
CREATE INDEX idx_jobs_tags ON job_postings USING gin(tags);
CREATE INDEX idx_jobs_inactive_since ON job_postings(inactive_since) WHERE inactive_since IS NOT NULL;

-- uscis_sponsor_records
CREATE INDEX idx_uscis_normalized ON uscis_sponsor_records USING gin(normalized_name gin_trgm_ops);
CREATE INDEX idx_uscis_fiscal_year ON uscis_sponsor_records(fiscal_year);
CREATE INDEX idx_uscis_company_id ON uscis_sponsor_records(company_id);

-- dol_lca_records
CREATE INDEX idx_dol_normalized ON dol_lca_records USING gin(normalized_name gin_trgm_ops);
CREATE INDEX idx_dol_soc_code ON dol_lca_records(soc_code);
CREATE INDEX idx_dol_company_id ON dol_lca_records(company_id);

-- behavioral tables
CREATE INDEX idx_job_views_job_id ON job_views(job_id);
CREATE INDEX idx_job_views_user_id ON job_views(user_id);
CREATE INDEX idx_company_views_company_id ON company_views(company_id);
CREATE INDEX idx_company_views_viewed_at ON company_views(viewed_at);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_saved_jobs_user_id ON saved_jobs(user_id);

-- ============================================================
-- Full-text search vector trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_job_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.normalized_title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.employment_type, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.remote, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_job_search_vector
BEFORE INSERT OR UPDATE ON job_postings
FOR EACH ROW EXECUTE FUNCTION update_job_search_vector();

-- ============================================================
-- Profile completion trigger
-- ============================================================
CREATE OR REPLACE FUNCTION compute_profile_completion(p_user_id uuid)
RETURNS numeric AS $$
DECLARE
  u         users%ROWTYPE;
  edu_count int;
  emp_count int;
  pct       numeric := 0;
  breakdown jsonb   := '{}';
BEGIN
  SELECT * INTO u FROM users WHERE id = p_user_id;

  -- Survey questions (30%)
  IF u.status_type IS NOT NULL
     AND u.visa_status IS NOT NULL
     AND u.grad_year IS NOT NULL
     AND u.preferred_role IS NOT NULL
  THEN
    pct       := pct + 30;
    breakdown := breakdown || '{"survey": 30}';
  END IF;

  -- Resume (25%)
  IF u.resume_url IS NOT NULL THEN
    pct       := pct + 25;
    breakdown := breakdown || '{"resume": 25}';
  END IF;

  -- Education (15%)
  SELECT count(*) INTO edu_count FROM user_education WHERE user_id = p_user_id;
  IF edu_count > 0 THEN
    pct       := pct + 15;
    breakdown := breakdown || '{"education": 15}';
  END IF;

  -- Employment (15%)
  SELECT count(*) INTO emp_count FROM user_employment WHERE user_id = p_user_id;
  IF emp_count > 0 THEN
    pct       := pct + 15;
    breakdown := breakdown || '{"employment": 15}';
  END IF;

  -- Mobile (10%)
  IF u.mobile IS NOT NULL THEN
    pct       := pct + 10;
    breakdown := breakdown || '{"mobile": 10}';
  END IF;

  -- Employer visibility / consent (5%)
  IF u.consent_at IS NOT NULL THEN
    pct       := pct + 5;
    breakdown := breakdown || '{"visibility": 5}';
  END IF;

  INSERT INTO user_profile_completion (user_id, percent, breakdown, updated_at)
  VALUES (p_user_id, pct, breakdown, now())
  ON CONFLICT (user_id) DO UPDATE
    SET percent   = EXCLUDED.percent,
        breakdown = EXCLUDED.breakdown,
        updated_at = now();

  RETURN pct;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION trigger_profile_completion()
RETURNS trigger AS $$
BEGIN
  PERFORM compute_profile_completion(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profile_completion
AFTER INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trigger_profile_completion();
