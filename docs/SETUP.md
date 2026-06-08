# Local Setup Guide

Step-by-step instructions to get Zolve Home Base running on your machine.

---

## Prerequisites

Install these before starting:

| Tool | Version | Install |
|---|---|---|
| **Node.js** | 20+ | [nodejs.org](https://nodejs.org/) |
| **npm** | Comes with Node | — |
| **Supabase CLI** | Latest | `npm install -g supabase` |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

Optional (for deployment):

| Tool | Purpose |
|---|---|
| **Wrangler** | Included as a dev dependency — used for Cloudflare Pages preview/deploy |

---

## 1. Clone the repository

```bash
git clone <repo-url>
cd homebase
```

Replace `<repo-url>` with the actual remote URL from your Git host.

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

| Variable | Required for local dev | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (server routes) | Service role key — **never expose to the browser** |
| `ANTHROPIC_API_KEY` | For resume parsing | Anthropic API key |
| `NEXT_PUBLIC_APP_URL` | Yes | `http://localhost:3000` for local dev |
| `CLOUDFLARE_ACCOUNT_ID` | Deploy only | Cloudflare account ID |
| `CLOUDFLARE_API_TOKEN` | Deploy only | Cloudflare API token |

### Where to find Supabase keys

1. Go to your [Supabase dashboard](https://supabase.com/dashboard)
2. Select your project → **Settings** → **API**
3. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 4. Start Supabase locally

```bash
supabase start
```

This spins up local Postgres, Auth, Storage, and Studio. On first run it may pull Docker images — allow a few minutes.

After it starts, the CLI prints local URLs and keys. You can use those in `.env.local` instead of a remote project if you prefer fully local development.

Open Supabase Studio (usually `http://localhost:54323`) to inspect tables and run SQL.

---

## 5. Apply database migrations

```bash
npm run db:migrate
```

This runs all SQL files in `supabase/migrations/` against your database:

- `001_schema.sql` — tables, indexes, triggers
- `002_rls.sql` — Row Level Security policies
- `003_functions.sql` — `search_jobs` and other Postgres functions
- `004_trgm_helpers.sql` — fuzzy matching helpers

---

## 6. (Optional) Seed sample data

```bash
npm run seed
```

Populates companies and jobs from staging fixtures so you have something to browse in the UI.

---

## 7. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Google OAuth (optional for local auth testing)

Google OAuth credentials are configured in the **Supabase dashboard**, not in `.env.local`:

1. Supabase dashboard → **Authentication** → **Providers** → **Google**
2. Add your Google OAuth Client ID and Secret
3. Set the redirect URL to include `http://localhost:3000/auth/callback`

For local Supabase, also add the local callback URL shown when you run `supabase start`.

Email/password auth works without extra OAuth setup if enabled in Supabase Auth settings.

---

## Useful commands

### Development

```bash
npm run dev          # Start Next.js dev server (port 3000)
npm run build        # Production build
npm run start        # Run production build locally
npm run lint         # ESLint
```

### Database

```bash
npm run db:migrate   # Push migrations to linked Supabase project
npm run db:reset     # Reset local DB and re-apply migrations (destructive)
```

### Data pipeline

```bash
npm run seed                  # Seed companies and jobs
npm run validate:greenhouse   # Validate Greenhouse ATS integration
npm run validate:gov-data     # Validate USCIS/DOL data ingestion
```

### Cloudflare deployment

```bash
npm run pages:build   # Build Cloudflare-compatible output
npm run preview       # Preview with Wrangler locally
npm run deploy        # Deploy to Cloudflare Pages
```

---

## Troubleshooting

### `supabase start` fails

- Ensure Docker Desktop is running
- Try `supabase stop` then `supabase start` again

### Auth redirect loops

- Check `NEXT_PUBLIC_APP_URL` matches your dev URL exactly
- Confirm `/auth/callback` is listed in Supabase Auth redirect URLs

### API routes return 401

- Session cookies may be stale — sign out and sign back in
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

### Migrations fail

- Run `npm run db:reset` locally (destructive — only for local dev)
- Check migration order in `supabase/migrations/`

### Empty jobs list

- Run `npm run seed` to populate sample data
- Or invoke the `greenhouse-sync` edge function against a linked Supabase project

---

## Project structure quick reference

| Path | What it is |
|---|---|
| `app/` | Pages and API routes |
| `components/` | React UI components |
| `lib/supabase/` | Supabase client setup |
| `supabase/migrations/` | Database schema |
| `supabase/functions/` | Edge Functions (job + gov data sync) |
| `scripts/` | Seed and validation scripts |
| `middleware.ts` | Auth and onboarding route guards |

See [ARCHITECTURE.md](./ARCHITECTURE.md) for a full backend walkthrough.
