-- ============================================================
-- Zolve HomeBase — Migration 004: Trigram Helper for RPC
-- Called by gov-data-ingest Edge Function for fuzzy company matching.
-- ============================================================

-- find_company_by_trgm: returns companies whose normalized_name
-- has pg_trgm similarity above p_threshold, ordered by similarity desc.
CREATE OR REPLACE FUNCTION find_company_by_trgm(p_name text, p_threshold numeric DEFAULT 0.65)
RETURNS TABLE (
  company_id text,
  similarity real
) AS $$
  SELECT id::text, similarity(normalized_name, p_name) AS similarity
  FROM companies
  WHERE similarity(normalized_name, p_name) >= p_threshold
  ORDER BY similarity(normalized_name, p_name) DESC
  LIMIT 3;
$$ LANGUAGE sql STABLE;
