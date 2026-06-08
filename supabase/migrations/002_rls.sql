-- ============================================================
-- Zolve HomeBase — Migration 002: Row Level Security
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_education           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_employment          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile_completion  ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_views                ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_views            ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications             ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_alerts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies                ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE uscis_sponsor_records    ENABLE ROW LEVEL SECURITY;
ALTER TABLE dol_lca_records          ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_aliases          ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Public read policies (no auth required)
-- ============================================================

CREATE POLICY "companies_public_read"
  ON companies FOR SELECT
  USING (true);

-- Active jobs are always public; recently deactivated visible for 90 days
CREATE POLICY "job_postings_public_read"
  ON job_postings FOR SELECT
  USING (
    is_active = true
    OR created_at > now() - interval '90 days'
  );

CREATE POLICY "uscis_public_read"
  ON uscis_sponsor_records FOR SELECT
  USING (true);

CREATE POLICY "dol_public_read"
  ON dol_lca_records FOR SELECT
  USING (true);

CREATE POLICY "aliases_public_read"
  ON company_aliases FOR SELECT
  USING (true);

-- ============================================================
-- User-owned row policies
-- ============================================================

-- users: each user can only see/mutate their own row
CREATE POLICY "users_own"
  ON users FOR ALL
  USING (auth.uid() = id);

-- user_education
CREATE POLICY "education_own"
  ON user_education FOR ALL
  USING (auth.uid() = user_id);

-- user_employment
CREATE POLICY "employment_own"
  ON user_employment FOR ALL
  USING (auth.uid() = user_id);

-- user_profile_completion
CREATE POLICY "completion_own"
  ON user_profile_completion FOR ALL
  USING (auth.uid() = user_id);

-- saved_jobs
CREATE POLICY "saved_jobs_own"
  ON saved_jobs FOR ALL
  USING (auth.uid() = user_id);

-- job_views: authenticated users can insert their own views and read them back
CREATE POLICY "job_views_insert"
  ON job_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "job_views_own_select"
  ON job_views FOR SELECT
  USING (auth.uid() = user_id);

-- company_views
CREATE POLICY "company_views_insert"
  ON company_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "company_views_own_select"
  ON company_views FOR SELECT
  USING (auth.uid() = user_id);

-- applications
CREATE POLICY "applications_own"
  ON applications FOR ALL
  USING (auth.uid() = user_id);

-- job_alerts
CREATE POLICY "alerts_own"
  ON job_alerts FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- Service-role bypass policies (for Edge Functions)
-- service_role bypasses RLS by default in Supabase, but explicit
-- policies here make the intent clear and support future config changes.
-- ============================================================

CREATE POLICY "service_companies_write"
  ON companies FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service_jobs_write"
  ON job_postings FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service_uscis_write"
  ON uscis_sponsor_records FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service_dol_write"
  ON dol_lca_records FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service_aliases_write"
  ON company_aliases FOR ALL
  USING (auth.role() = 'service_role');
