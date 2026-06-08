-- 005_events.sql
-- Event registrations + saved events for the Events page.
-- Events themselves are curated in code (lib/events/data.ts), so event_id is a
-- stable text key from that dataset rather than a FK to an events table.

CREATE TABLE IF NOT EXISTS event_registrations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id     text NOT NULL,
  event_title  text,
  status       text NOT NULL DEFAULT 'registered'
               CHECK (status IN ('registered', 'checked_in', 'cancelled')),
  created_at   timestamptz DEFAULT now(),
  UNIQUE (user_id, event_id)
);

CREATE TABLE IF NOT EXISTS saved_events (
  user_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id  text NOT NULL,
  saved_at  timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, event_id)
);

CREATE INDEX IF NOT EXISTS event_registrations_user_idx ON event_registrations (user_id);

-- Row level security: users manage only their own rows.
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_events        ENABLE ROW LEVEL SECURITY;

CREATE POLICY "event_registrations_own"
  ON event_registrations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_events_own"
  ON saved_events FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
