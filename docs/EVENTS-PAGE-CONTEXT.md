# Events Page — Build Context

> Status: **PLANNING — do not build yet.** Two prerequisites must be resolved first (see
> "Blocked on" at the bottom). This doc is the spec a future session uses to build the page.

## Goal

Replace the current "Coming Soon" placeholder at `app/(dashboard)/events/page.tsx` with a
real, live **Events** page for Zolve HomeBase. It lists:

- **Upcoming events** — sourced from a planned CSV (not yet ingested). These are not live yet,
  so each card needs a clear date description (e.g. "Event in 9 days", "Wed, Jun 17–Thu, Jun 18").
- **Past events** — sourced from Zolve's public webinars, including their YouTube recording links.

## Data sources

1. **Upcoming events CSV** — user will provide. Take all upcoming event info from here
   (title, host/employer, date(s), medium virtual/in-person, tags, description, register link).
   Events are not live, so render a human-friendly relative date ("Event in N days") + absolute range.
2. **Past events** — from `https://account.zolve.com/services/visa-webinars` (see scraping notes).
   Past events should surface their **YouTube recording link** as the primary CTA (Watch recording).

> Ingestion lands in `gov-data/` style CSVs / a Supabase table. Final storage = a new
> `events` table (see Schema below). Keep raw scraped/CSV files in `useless-data/` or `gov-data/`
> (both git-ignored) — do not commit raw data.

## UI structure (from reference screenshots)

Reference screenshots are saved in `useless-data/` (git-ignored). **Take only the structure**, not
the visuals — restyle everything to the HomeBase theme.

**Keep:**
- Page header "Events" + notification bell + avatar (already in the dashboard layout).
- Search bar ("Search events").
- Filters: **Medium** (Virtual / In-person) and **Date** (All upcoming / Today / Next 10 days /
  Next 30 days / Past year; plus Time of day + Days of week). Filter is a popover with
  Reset + "View N results" button.
- Quick stat chips: Saved · N, Registered · N, Check-ins · N.
- Section heading "All events".
- Card grid (3-up on desktop): host logo + name, bookmark/save icon, title, medium + date line,
  category tag pills (HIRING / GUIDANCE / NETWORKING / EMPLOYER INFO), and a footer line
  ("N students going" or "Event in N days").

**Drop (do NOT build):**
- The **Employer** filter dropdown.
- The extra **filter/sort icon button** to the right of the filters (the round icon after Employer).

**Add:**
- A **Register** button on each card / event detail.
  - Upcoming events → "Register".
  - Past events → "Watch recording" (links to YouTube) instead of register.

## Theme (match current HomeBase — NOT the screenshot's purple)

The reference screenshots use indigo/purple. **Ignore that.** Use the HomeBase palette from
`tailwind.config.ts`:

- Brand / primary CTA (Register button): `brand` = `#ff6633` (hover `#e5572b`, light `#fff1ec`).
- Text / dark surfaces: `navy` scale (`#0F172A` … `#F8FAFC`).
- Font: `Plus Jakarta Sans`.
- Match existing card styling: `bg-white border border-slate-100 rounded-xl/2xl shadow-sm`.

Mirror patterns already used in `app/(dashboard)/jobs`, `companies`, and the login page.

## Auth / register flow

Auth is Supabase (Google OAuth + email/password), see `app/(auth)/login/page.tsx`,
`lib/supabase/{client,server}.ts`, `components/auth/OnboardingModal.tsx`.

- **Not logged in** + clicks Register → send them through the **same sign-up flow** as the rest of
  the app (login/OAuth → onboarding). After auth, ideally return them to the event and complete
  registration.
- **Logged in** + clicks Register → the event is registered for that user (write a row to
  `event_registrations`, update the "Registered · N" chip and the card state to "Registered ✓").

## Schema (new — not in `supabase/migrations/001_schema.sql` yet)

Add a migration (`005_events.sql` or next number) with roughly:

- `events`: `id`, `title`, `host_name`, `host_logo_url`, `description`, `medium` (virtual|in_person),
  `start_at`, `end_at`, `timezone`, `tags text[]`, `register_url`, `youtube_url`, `is_past bool`,
  `attendee_count int`, `created_at`.
- `event_registrations`: `id`, `event_id fk`, `user_id fk`, `status` (registered|checked_in),
  `created_at`; unique(`event_id`,`user_id`). Add RLS (mirror `002_rls.sql`): users read all events,
  read/write only their own registrations.

## Files likely touched (when we build)

- `app/(dashboard)/events/page.tsx` — replace placeholder (server component: fetch events).
- `components/events/*` — `EventCard`, `EventFilters`, `EventSearch`, `RegisterButton` (client).
- `app/api/events/register/route.ts` — registration endpoint (or a server action).
- `supabase/migrations/00X_events.sql` + `lib/supabase/types.ts` — schema + types.
- A seed/ingest script under `scripts/` to load the CSV + scraped past events.

## Past-events data — DONE (scraped 2026-06-08)

The SPA at `https://account.zolve.com/services/visa-webinars` renders cards via a **public JSON API**
(no auth actually required for the data):

```
GET https://api.zolve.com/japi/v1/zedge/public/catalog/item-page?item=visa-webinars
```

`.data.cards[]` holds each webinar: `data.heading` (title), `data.subheading`, `data.author.{name,
designation}`, `data.description` (human date string e.g. "13th June'25, 6:30 PM IST Friday"),
`data.cta.redirect` (YouTube link), `tag`. Note `author.image` is the literal placeholder
`"static image"` — real speaker photos are separate public assets at `static.zolve.com/images/*`.

**Extracted output (all git-ignored, in `useless-data/`):**
- `events_zolve_past.json` — **24 past webinars, normalized**: title, subtitle, speaker name +
  designation, `date_text`, `youtube_url`, `youtube_id`, `youtube_thumbnail`, tag. All 24 have a
  valid YouTube link. **This is the source of truth for the Past Events section.**
- `photos/yt_<id>.jpg` — 24 YouTube thumbnails (reliable per-event image; use as the card image).
- `photos/speaker_*.{png,jpg,jpeg}` — 9 real speaker headshots (best-effort; map by `speaker_name`,
  e.g. Sanjay Kaushik → `speaker_sanjay-kaushik-profile.png`, Shachi → `speaker_sachi.png`). Not 1:1
  mapped — prefer the YouTube thumbnail as the card image and treat headshots as optional avatars.
- `api/resp_01.json` — raw API response; `webinars_raw.html`, `tab_past.*` — raw captures (reference).

> The "Upcoming Webinars" tab on Zolve is **empty** — there are no upcoming events on their side.
> All upcoming events come from the user's CSV (still pending).
> Scrape tooling lives in `/tmp/zolve-scrape/` (Playwright + runner/scrape/parse scripts), outside the repo.

## Blocked on (do these before building)

1. **Upcoming-events CSV** — still needed from the user (past events are done). This feeds the
   "Upcoming" section; each gets a relative date ("Event in N days") since they aren't live yet.
2. **Skills install** — the `ui-ux-pro-max-skill` and `frontend-design` skills are not installed
   yet. Install them (into `~/.claude/skills/` or `.claude/skills/`) and restart Claude Code only
   AFTER data ingestion is done, then use them to style the page.
