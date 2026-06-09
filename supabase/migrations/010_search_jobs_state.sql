-- 010_search_jobs_state.sql
-- Add state filter (p_states) to search_jobs and return state.
DROP FUNCTION IF EXISTS search_jobs(text, text[], text[], text[], text, integer, integer, text[], text);

CREATE OR REPLACE FUNCTION public.search_jobs(
  query text DEFAULT ''::text,
  p_visa_types text[] DEFAULT NULL, p_job_types text[] DEFAULT NULL, p_seniority text[] DEFAULT NULL,
  p_remote text DEFAULT NULL, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0,
  p_role_categories text[] DEFAULT NULL, p_country text DEFAULT NULL, p_states text[] DEFAULT NULL
)
RETURNS TABLE(id uuid, company_id uuid, title text, normalized_title text, locations jsonb, employment_type text, remote text, salary_min numeric, salary_max numeric, tags text[], posted_at timestamp with time zone, source_url text, is_active boolean, seniority text, role_category text, country text, state text, company_name text, company_logo text, sponsor_score numeric, rank real)
LANGUAGE plpgsql STABLE AS $function$
BEGIN
  RETURN QUERY
  SELECT jp.id, jp.company_id, jp.title, jp.normalized_title, jp.locations, jp.employment_type,
    jp.remote, jp.salary_min, jp.salary_max, jp.tags, jp.posted_at, jp.source_url, jp.is_active,
    jp.seniority, jp.role_category, jp.country, jp.state,
    c.canonical_name AS company_name, c.logo_url AS company_logo, c.sponsor_score,
    (CASE WHEN query = '' THEN 0::real ELSE ts_rank(jp.search_vector, plainto_tsquery('english', query)) END
      + (coalesce(c.sponsor_score, 0) / 1000.0))::real AS rank
  FROM job_postings jp JOIN companies c ON c.id = jp.company_id
  WHERE jp.is_active = true
    AND (query = '' OR jp.search_vector @@ plainto_tsquery('english', query)
      OR jp.title ILIKE '%' || query || '%' OR c.canonical_name ILIKE '%' || query || '%')
    AND (p_visa_types IS NULL OR jp.tags && p_visa_types)
    AND (p_job_types IS NULL OR jp.employment_type = ANY(p_job_types))
    AND (p_seniority IS NULL OR jp.seniority = ANY(p_seniority))
    AND (p_remote IS NULL OR jp.remote = p_remote)
    AND (p_role_categories IS NULL OR jp.role_category = ANY(p_role_categories))
    AND (p_country IS NULL OR jp.country = p_country)
    AND (p_states IS NULL OR jp.state = ANY(p_states))
  ORDER BY rank DESC, jp.posted_at DESC NULLS LAST
  LIMIT p_limit OFFSET p_offset;
END;
$function$;
