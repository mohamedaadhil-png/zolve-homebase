-- 006_waitlist.sql
-- Pre-launch marketing waitlist. Standalone from the auth/users tables:
-- anyone (anon) can join, but the list is not publicly readable. At launch
-- these rows are converted into real users and sent invites.

CREATE TABLE IF NOT EXISTS waitlist (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text,
  email       text NOT NULL UNIQUE,
  status      text CHECK (status IN ('student', 'wp', 'dependent')),
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist (email);

-- Row level security: anyone may join (INSERT only). No SELECT/UPDATE/DELETE
-- for anon/authenticated — reads happen via the service role (admin/export).
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waitlist_insert_anyone"
  ON waitlist FOR INSERT
  WITH CHECK (true);
