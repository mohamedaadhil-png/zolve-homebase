-- 011_state_facets.sql
-- Accurate per-state job counts for the Location filter dropdown
-- (avoids the PostgREST 1000-row select cap).
CREATE OR REPLACE FUNCTION public.job_state_facets()
RETURNS TABLE(state text, count bigint)
LANGUAGE sql STABLE AS $$
  SELECT state, count(*)::bigint
  FROM job_postings
  WHERE is_active AND country = 'US' AND state IS NOT NULL
  GROUP BY state
  ORDER BY count(*) DESC;
$$;
