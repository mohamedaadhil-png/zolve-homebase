-- ============================================================
-- Zolve HomeBase — Migration 003: Postgres Helper Functions
-- ============================================================

-- ============================================================
-- search_jobs: full-text + filter search with ranking
-- ============================================================
CREATE OR REPLACE FUNCTION search_jobs(
  query        text         DEFAULT '',
  p_visa_types text[]       DEFAULT NULL,
  p_job_types  text[]       DEFAULT NULL,
  p_seniority  text[]       DEFAULT NULL,
  p_remote     text         DEFAULT NULL,
  p_limit      int          DEFAULT 20,
  p_offset     int          DEFAULT 0
)
RETURNS TABLE (
  id               uuid,
  company_id       uuid,
  title            text,
  normalized_title text,
  locations        jsonb,
  employment_type  text,
  remote           text,
  salary_min       numeric,
  salary_max       numeric,
  tags             text[],
  posted_at        timestamptz,
  source_url       text,
  is_active        boolean,
  seniority        text,
  role_category    text,
  company_name     text,
  company_logo     text,
  sponsor_score    numeric,
  rank             real
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    jp.id,
    jp.company_id,
    jp.title,
    jp.normalized_title,
    jp.locations,
    jp.employment_type,
    jp.remote,
    jp.salary_min,
    jp.salary_max,
    jp.tags,
    jp.posted_at,
    jp.source_url,
    jp.is_active,
    jp.seniority,
    jp.role_category,
    c.canonical_name  AS company_name,
    c.logo_url        AS company_logo,
    c.sponsor_score,
    (
      CASE
        WHEN query = '' THEN 0::real
        ELSE ts_rank(jp.search_vector, plainto_tsquery('english', query))
      END
      + (coalesce(c.sponsor_score, 0) / 1000.0)
    )::real AS rank
  FROM job_postings jp
  JOIN companies c ON c.id = jp.company_id
  WHERE jp.is_active = true
    AND (
      query = ''
      OR jp.search_vector @@ plainto_tsquery('english', query)
      OR jp.title         ILIKE '%' || query || '%'
      OR c.canonical_name ILIKE '%' || query || '%'
    )
    AND (p_visa_types IS NULL OR jp.tags && p_visa_types)
    AND (p_job_types  IS NULL OR jp.employment_type = ANY(p_job_types))
    AND (p_seniority  IS NULL OR jp.seniority       = ANY(p_seniority))
    AND (p_remote     IS NULL OR jp.remote          = p_remote)
  ORDER BY rank DESC, jp.posted_at DESC NULLS LAST
  LIMIT  p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- get_company_weekly_views
-- ============================================================
CREATE OR REPLACE FUNCTION get_company_weekly_views(p_company_id uuid)
RETURNS bigint AS $$
  SELECT count(*)
  FROM company_views
  WHERE company_id = p_company_id
    AND viewed_at  > now() - interval '7 days';
$$ LANGUAGE sql STABLE;

-- ============================================================
-- get_similar_jobs: same role_category, sponsor companies first
-- ============================================================
CREATE OR REPLACE FUNCTION get_similar_jobs(p_job_id uuid, p_limit int DEFAULT 3)
RETURNS TABLE (
  id            uuid,
  title         text,
  company_name  text,
  company_logo  text,
  salary_min    numeric,
  salary_max    numeric,
  sponsor_score numeric,
  locations     jsonb,
  posted_at     timestamptz,
  source_url    text
) AS $$
DECLARE
  v_role_category text;
  v_company_id    uuid;
BEGIN
  SELECT role_category, company_id
  INTO   v_role_category, v_company_id
  FROM   job_postings
  WHERE  id = p_job_id;

  RETURN QUERY
  SELECT
    jp.id,
    jp.title,
    c.canonical_name AS company_name,
    c.logo_url       AS company_logo,
    jp.salary_min,
    jp.salary_max,
    c.sponsor_score,
    jp.locations,
    jp.posted_at,
    jp.source_url
  FROM job_postings jp
  JOIN companies c ON c.id = jp.company_id
  WHERE jp.is_active     = true
    AND jp.id           != p_job_id
    AND jp.role_category = v_role_category
    AND c.sponsor_flag   = true
  ORDER BY c.sponsor_score DESC NULLS LAST, jp.posted_at DESC NULLS LAST
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- purge_old_inactive_jobs: called via pg_cron (daily)
-- ============================================================
CREATE OR REPLACE FUNCTION purge_old_inactive_jobs()
RETURNS int AS $$
DECLARE
  deleted_count int;
BEGIN
  DELETE FROM job_postings
  WHERE is_active      = false
    AND inactive_since < now() - interval '90 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- normalize_company_name: strip legal suffixes & punctuation
-- (used by gov-data-ingest edge function via SQL call)
-- ============================================================
CREATE OR REPLACE FUNCTION normalize_company_name(raw_name text)
RETURNS text AS $$
DECLARE
  n text;
BEGIN
  n := lower(unaccent(raw_name));
  -- strip common legal suffixes
  n := regexp_replace(n, '\s+(inc\.?|incorporated|llc\.?|corp\.?|corporation|ltd\.?|limited|co\.?|company|lp\.?|llp\.?|pllc\.?|pc\.?|plc\.?|gmbh|ag|sa|bv|nv)\s*$', '', 'gi');
  -- strip trailing punctuation and whitespace
  n := regexp_replace(n, '[^\w\s]+', '', 'g');
  n := trim(n);
  RETURN n;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- compute_sponsor_score: aggregate USCIS data for one company
-- ============================================================
CREATE OR REPLACE FUNCTION compute_sponsor_score(p_company_id uuid)
RETURNS numeric AS $$
DECLARE
  v_total_approvals   numeric := 0;
  v_total_denials     numeric := 0;
  v_approval_rate     numeric := 0;
  v_volume_score      numeric := 0;
  v_recency_score     numeric := 0;
  v_sponsor_score     numeric := 0;
  v_years_sponsoring  int     := 0;
  v_max_fy            int     := 0;
  v_current_fy        int;
  v_role_grades       jsonb   := '{}';
  v_swe_approvals     numeric := 0;
  v_swe_total         numeric := 0;
BEGIN
  -- Determine current fiscal year proxy
  v_current_fy := extract(year FROM now())::int;

  -- Aggregate USCIS data for last 3 fiscal years
  SELECT
    coalesce(sum(initial_approvals + continuing_approvals), 0),
    coalesce(sum(initial_denials   + continuing_denials),   0),
    count(DISTINCT fiscal_year),
    coalesce(max(fiscal_year), 0)
  INTO
    v_total_approvals,
    v_total_denials,
    v_years_sponsoring,
    v_max_fy
  FROM uscis_sponsor_records
  WHERE company_id  = p_company_id
    AND fiscal_year >= (v_current_fy - 3);

  -- Approval rate (0-100)
  IF (v_total_approvals + v_total_denials) > 0 THEN
    v_approval_rate := v_total_approvals / (v_total_approvals + v_total_denials) * 100.0;
  END IF;

  -- Volume score: log-normalized against 10,000 approvals = max score
  IF v_total_approvals > 0 THEN
    v_volume_score := least(ln(v_total_approvals + 1) / ln(10001) * 100.0, 100.0);
  END IF;

  -- Recency score: latest data vs current FY
  IF v_max_fy >= v_current_fy - 1 THEN
    v_recency_score := 100.0;
  ELSIF v_max_fy >= v_current_fy - 2 THEN
    v_recency_score := 60.0;
  ELSIF v_max_fy >= v_current_fy - 3 THEN
    v_recency_score := 30.0;
  ELSE
    v_recency_score := 0.0;
  END IF;

  -- Weighted composite score, capped at 100
  v_sponsor_score := least(
    (v_approval_rate * 0.50) + (v_volume_score * 0.30) + (v_recency_score * 0.20),
    100.0
  );

  -- SWE role grade from DOL LCA records (SOC 15-xxxx = computer occupations)
  SELECT
    coalesce(sum(CASE WHEN case_status ILIKE 'certified%' THEN 1 ELSE 0 END), 0),
    count(*)
  INTO v_swe_approvals, v_swe_total
  FROM dol_lca_records
  WHERE company_id = p_company_id
    AND soc_code   LIKE '15-%';

  IF v_swe_total > 0 THEN
    v_role_grades := jsonb_build_object(
      'SWE', jsonb_build_object(
        'approvals',     v_swe_approvals,
        'total',         v_swe_total,
        'approval_rate', round(v_swe_approvals / v_swe_total * 100.0, 2)
      )
    );
  END IF;

  -- Persist results
  UPDATE companies
  SET
    sponsor_score    = round(v_sponsor_score, 2),
    approval_rate    = round(v_approval_rate, 2),
    years_sponsoring = v_years_sponsoring,
    recent_activity  = CASE
                         WHEN v_max_fy >= v_current_fy - 1 THEN 'Active'
                         WHEN v_max_fy >= v_current_fy - 2 THEN 'Recent'
                         ELSE 'Inactive'
                       END,
    role_grades      = v_role_grades,
    sponsor_flag     = (v_sponsor_score > 0)
  WHERE id = p_company_id;

  RETURN round(v_sponsor_score, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
