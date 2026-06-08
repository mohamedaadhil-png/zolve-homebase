# Zolve HomeBase — Data Pipeline Context (resume from here)

> **Purpose:** This is the single source of truth to **resume the H-1B sponsor-data work** without re-deriving everything. Last updated: 2026-06-08. Read this top-to-bottom before continuing.

---

## 0. TL;DR — where we are

- **Goal:** Make the **Sponsor Directory** show every real H-1B sponsoring employer, backed by official US government data (USCIS approvals + DOL LCA filings).
- **USCIS phase = DONE.** 149,809 companies, real sponsor scores, FY2009–2026, live in the DB and on the deployed site.
- **LCA phase = PAUSED** (intentionally, by user). Approach decided = **aggregate-only** (free tier can't hold raw LCA rows). Nothing partial was written — DB is clean.
- **⚠️ BEFORE doing more data work, we owe two normalization passes** (see §7) — the user explicitly asked: **"normalise all the company names and roles properly."**

---

## 1. Access / key identifiers (NO secrets in this file)

| Thing | Value |
|---|---|
| Supabase project ref | `yyrhjlepkdvxvqcrvfvi` |
| Supabase URL | `https://yyrhjlepkdvxvqcrvfvi.supabase.co` |
| Region / tier | us-east-1, **FREE TIER (500 MB DB limit)** ← critical constraint |
| Storage bucket (gov data) | `gov-data-raw` (flat, no subfolders) |
| Vercel project | `zolve-homebase` (personal acct `agamsachan-1881`), live at `https://zolve-homebase.vercel.app` |
| Local gov-data copy | `gov-data/datahub/` (USCIS CSVs) + `gov-data/*.csv` (raw 2024-26) — gitignored |
| Ingestion scripts | `scripts/gov-data/` — **gitignored** (embedded keys). See §6/§7. |

**Secrets:**
- Supabase **anon + service_role** keys → in `.env.local` (gitignored).
- Supabase **Management API PAT** (`sbp_...`) and **Vercel token** were session-only and should be **regenerated** when resuming (dashboard → account tokens). The saved scripts in `scripts/gov-data/` have an old PAT/service_role hardcoded — **rotate + replace** before reuse.
- Google OAuth client + secret are configured in Supabase Auth (Google SSO works).

---

## 2. What is DONE ✅

### USCIS approval data (drives sponsor_score)
- Source: USCIS H-1B Employer Data Hub. Static CSVs exist only for **FY2009–2023** (download: `https://www.uscis.gov/sites/default/files/document/data/h1b_datahubexport-YYYY.csv`). FY2024/2025/2026 are NOT published as files — user supplied them from the Tableau "Employer Information" export (UTF-16 TSV, 6 granular approval categories).
- All 18 fiscal years (2009–2026) ingested. `gov-data-raw` holds `h1b_datahubexport-2009..2026.csv` (15 original + 3 converted from the 2024-25/2026 files).
- **Result:** 149,809 companies, 495,557 USCIS records, **91,090 with sponsor_score > 0**, 32,827 "Active" (filed 2026).
- Top sponsors verified correct: Meta 99.55, Apple 99.53, Cognizant, Google, Infosys, Amazon, Microsoft, Walmart, Deloitte, JPMorgan.

### Scoring (set-based SQL, dynamic window)
- `sponsor_score = 0.5*approval_rate + 0.3*volume_score + 0.2*recency_score`, capped 100.
- **Dynamic window:** anchored on `max(fiscal_year)` present in the data (currently 2026), uses last 3 FYs. Auto-advances when newer data is added. Recency: maxFY→Active(100), -1→Recent(60), -2→(30), else 0.
- Run via Management API `database/query` (NOT the per-row RPC — too slow at scale).

### Infra
- Google SSO live (provider enabled in Supabase, redirect URLs set for localhost + vercel).
- Deployed to Vercel (install command `npm install --legacy-peer-deps`; `next.config.mjs` has `typescript.ignoreBuildErrors` + `eslint.ignoreDuringBuilds` for the internal test build — revisit before real prod; there are real table-name bugs in `app/(dashboard)/companies/[companyId]/page.tsx`: it queries `uscis_records`/`lca_records` which should be `uscis_sponsor_records`/`dol_lca_records`, and selects a non-existent `name` column).

---

## 3. Database schema changes already applied

- **companies**: added `avg_wage numeric`, `median_wage numeric`, `lca_count int`, `lca_certified_count int` (for LCA aggregates — currently NULL, not yet populated). `role_grades jsonb` already existed.
- **uscis_sponsor_records**: added 14 columns — the 6 granular approval + 6 granular denial categories (`new_employment_approvals`, `continuation_approvals`, `change_same_employer_*`, `new_concurrent_*`, `change_employer_*`, `amended_*`), plus `industry_naics_desc`, `source_file`. (2009-2023 rows have these NULL; 2024-2026 rows populated, and also derive `initial_*`/`continuing_*` so scoring is uniform.)
- **dol_lca_records**: was redesigned to ~45 typed cols + `raw_data jsonb`, **then `raw_data` was DROPPED** after the free-tier blowup. Table currently **EMPTY** (typed-cols schema remains as a placeholder for a future raw load if upgraded to Pro).
- **company_aliases**: 19 rows mapping legal/parent names → brand (e.g. `social finance`→SoFi, `maplebear`→Instacart, `robinhood markets`→Robinhood, `formagrid`→Airtable, `anthropic pbc...`→Anthropic).

---

## 4. ⚠️ Free-tier constraint + recovery procedure (READ THIS)

- Free tier = **500 MB** DB cap. Current DB ≈ **308 MB** (USCIS 201 + companies 88 + system). Headroom ≈ 190 MB.
- Loading raw LCA rows blew it to ~1 GB → Supabase **auto-locked the DB to read-only** (breaks site writes/logins).
- **Recovery if it happens again:**
  1. `POST https://api.supabase.com/v1/projects/<ref>/readonly/temporary-disable` (with PAT)
  2. `TRUNCATE`/`DROP` the offending data to get under 500 MB
  3. Read-only auto-clears once under limit. Verify: `GET .../readonly` → `enabled:false`, and a test write.
- **Implication:** Do NOT load raw LCA (or anything multi-hundred-MB) into Postgres on the free tier. Either **upgrade to Pro ($25/mo, 8 GB)** or stay **aggregate-only**.

---

## 5. LCA data — PAUSED, approach = aggregate-only

- Source: DOL OFLC disclosure data. In `gov-data-raw` as **split `.xlsx`** (`*.xlsx.part-aa/ab/...`) + `MANIFEST.tsv` + `reassemble.sh`. **30 files, FY2008–2026, ~3.27 GB, ~6.1M rows, 97 columns.** All preserved in storage (lossless) regardless of what's in the DB.
- LCA schema (97 cols): CASE_NUMBER, CASE_STATUS, dates, VISA_CLASS, JOB_TITLE, SOC_CODE/TITLE, employment-type counts, EMPLOYER_NAME, EMPLOYER_FEIN, NAICS_CODE, worksite, WAGE_RATE_OF_PAY_FROM/TO + unit, PREVAILING_WAGE + level, H1B_DEPENDENT, etc.
- **Decision (user):** aggregate-only — don't store raw rows; compute per-company **role_grades + avg/median wages** and write onto `companies`. ~0 added storage. Backfill raw later only if upgraded to Pro.
- Script: `scripts/gov-data/lca_agg.py`. It: loads companies map → streams each FY2024-2026 `.xlsx` (download parts→reassemble→openpyxl read-only) → matches employer→company → accumulates SOC role categories + annualized wages (certified only) → writes summaries via a temp `company_lca_agg` table → UPDATE companies.
- **Where it stopped:** killed during the company-map load (≈80k/149k). **Nothing written** — all companies still have `lca_count IS NULL`. Safe to just re-run `lca_agg.py` from scratch.
- FY2024-2026 LCA files present: FY2024 Q1/Q4, FY2025 Q1-Q4, FY2026 Q2 (note the FY2026 file is misspelled `Dislclosure`).

---

## 6. Pipeline scripts (in `scripts/gov-data/`, gitignored)

| Script | What it does |
|---|---|
| `full_ingest.py` | USCIS 2009-2023 → companies + uscis_sponsor_records + scoring |
| `ingest_2426.py` | Convert UTF-16 2024-25/2026 files → per-year CSVs, upload to bucket, stage rows |
| `ingest_uscis.py` / `ingest_aliases.py` | (earlier, 31-company matching — superseded) |
| `lca_loader.py` | Raw LCA loader (DON'T use on free tier — caused the lockout) |
| `lca_agg.py` | **LCA aggregate-only — the one to resume with** |
| `flatten_storage.py` | Flattened `datahub/`+`lca/` subfolders into bucket root |
| `measure.py` | Counts unique employers in DataHub files |

Common to all: `norm()` company-name normalizer = lowercase → strip legal suffixes (inc/llc/corp/ltd/co/lp/llp/pllc/pc/plc/gmbh/ag) → strip punctuation → collapse whitespace.

---

## 7. ⭐ NEXT WHEN RESUMING — normalization is REQUIRED before more data work

The user's explicit instruction: **"we have to normalise all the company names and roles properly."** Do these first:

### 7a. Company NAME normalization / entity resolution
Current state: matched/deduped by string `normalized_name` only. Problems to fix:
1. **Display names are ugly** — auto-created `canonical_name` is just `initcap(name_raw)` → `Ibm`, `Walmart Associates Inc`, `Jpmorgan Chase And Co`. Need proper casing that **preserves acronyms** (IBM, JPMorgan, USA, NA, LLC handling) and strips trailing legal noise for display.
2. **Entity resolution via FEIN/Tax ID** — both datasets carry a federal tax id (USCIS `Tax ID` last-4, LCA `EMPLOYER_FEIN` full). Merge companies that are the same legal entity but normalize differently (subsidiaries, name changes). This is the single biggest accuracy upgrade. (Caveat: USCIS only has last-4 → weak alone; LCA FEIN is full. Use FEIN where available.)
3. Expand `company_aliases` for known brand≠legal cases beyond the 19 already added.

### 7b. ROLE normalization
Current `role_grades` logic buckets by SOC prefix (`15-12`→swe, `15-11`→management, `15-13`→data, `15-14`→security, `15-2`→math, `15`→it, else other) and outputs `{category: pct}`. Improve:
1. Use a **proper SOC-code → role taxonomy** (official 2018 SOC titles), not just prefix guesses. e.g. 15-1252 Software Developers, 15-2051 Data Scientists, 11-3021 IS Managers, 17-xxxx Engineers, etc.
2. Decide role_grades semantics clearly: **composition** (% of a company's filings per role) vs **certification rate** — and make UI + data agree. UI (`app/(dashboard)/sponsor-directory/page.tsx` SidePanel) currently expects `{key: pct}` and labels swe/ml/data/management.
3. Normalize JOB_TITLE strings if we surface them (huge free-text variety).

### 7c. Then continue LCA aggregate-only
Re-run `scripts/gov-data/lca_agg.py` (after rotating the PAT/service_role inside it) to populate `role_grades`, `avg_wage`, `median_wage`, `lca_count`, `lca_certified_count`. Then verify + spot-check.

---

## 8. Resume checklist

1. Read this file. Confirm DB still healthy: `SELECT pg_database_size(...)` ≈ 308 MB, read-only `enabled:false`.
2. Regenerate a Supabase **PAT** + (if deploying) Vercel token; update them in the `scripts/gov-data/*.py` (or better, switch scripts to read from env).
3. Do the **normalization passes (§7a, §7b)** — user-requested, do before more loading.
4. Run **`lca_agg.py`** (§7c) to populate role grades + wages.
5. (Deferred) Frontend: Sponsor Directory loads ALL companies client-side (`page.tsx`) → only gets 1000 of 149k. Needs **server-side search + pagination** before it's truly usable. Also fix the `companies/[companyId]/page.tsx` wrong table/column names.
6. (Deferred) If raw LCA rows are wanted in DB → upgrade to Supabase Pro first.

---

## 9. UI / app notes
- Sponsor Directory: `app/(dashboard)/sponsor-directory/page.tsx` (client component, loads companies where `sponsor_flag=true`, client-side search — caps at 1000 rows).
- Company detail: `app/(dashboard)/companies/[companyId]/page.tsx` — **has bugs** (wrong table names `uscis_records`/`lca_records`, selects non-existent `name`). Fix during normalization work.
- Auth/middleware works; `(dashboard)` layout requires login.
