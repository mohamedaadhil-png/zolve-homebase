-- 009_job_state.sql
-- Normalized 2-letter US state code per posting, to power the Location filter.
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS state text;
CREATE INDEX IF NOT EXISTS idx_jobs_state ON job_postings (state);
