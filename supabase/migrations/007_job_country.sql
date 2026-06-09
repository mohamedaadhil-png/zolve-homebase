-- 007_job_country.sql
-- Scope is US-only for now. Add a first-class country column on job_postings
-- (structured city/state/country also live in the locations jsonb) and indexes
-- to support role + country filtering.

ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS country text;

CREATE INDEX IF NOT EXISTS idx_jobs_country       ON job_postings (country);
CREATE INDEX IF NOT EXISTS idx_jobs_role_category ON job_postings (role_category);
