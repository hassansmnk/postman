-- Post-Date Debrief — Supabase schema + RLS
-- Run in Supabase SQL Editor (Dashboard → SQL → New query)

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.debrief_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      TEXT NOT NULL UNIQUE,
  answers         JSONB NOT NULL DEFAULT '[]'::jsonb,
  scores          JSONB NOT NULL DEFAULT '{"A":0,"B":0,"C":0}'::jsonb,
  verdict_key     TEXT,
  verdict_title   TEXT,
  verdict_body    TEXT,
  checklist_choice TEXT,
  current_question INTEGER NOT NULL DEFAULT 0,
  completed       BOOLEAN NOT NULL DEFAULT false,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at    TIMESTAMPTZ
);

COMMENT ON TABLE public.debrief_submissions IS
  'Quiz sessions and final submissions for The Post-Date Debrief app.';

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS debrief_submissions_completed_idx
  ON public.debrief_submissions (completed);

CREATE INDEX IF NOT EXISTS debrief_submissions_submitted_at_idx
  ON public.debrief_submissions (submitted_at DESC);

CREATE INDEX IF NOT EXISTS debrief_submissions_created_at_idx
  ON public.debrief_submissions (created_at DESC);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS debrief_submissions_set_updated_at ON public.debrief_submissions;

CREATE TRIGGER debrief_submissions_set_updated_at
  BEFORE UPDATE ON public.debrief_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.debrief_submissions ENABLE ROW LEVEL SECURITY;

-- Anonymous clients may insert new sessions (quiz is public, no auth).
DROP POLICY IF EXISTS "anon_insert_debrief" ON public.debrief_submissions;
CREATE POLICY "anon_insert_debrief"
  ON public.debrief_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow reading rows (client filters by session_id in application code).
DROP POLICY IF EXISTS "anon_select_debrief" ON public.debrief_submissions;
CREATE POLICY "anon_select_debrief"
  ON public.debrief_submissions
  FOR SELECT
  TO anon
  USING (true);

-- Allow updating in-progress drafts; block overwriting completed submissions.
DROP POLICY IF EXISTS "anon_update_draft_debrief" ON public.debrief_submissions;
CREATE POLICY "anon_update_draft_debrief"
  ON public.debrief_submissions
  FOR UPDATE
  TO anon
  USING (completed = false)
  WITH CHECK (completed = false OR completed = true);

-- ---------------------------------------------------------------------------
-- Optional: tighten SELECT to session_id only (requires custom RPC)
-- For production hardening, replace permissive SELECT with a SECURITY DEFINER
-- function that accepts session_id and returns only that row.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_debrief_session(p_session_id TEXT)
RETURNS SETOF public.debrief_submissions
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.debrief_submissions
  WHERE session_id = p_session_id
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_debrief_session(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_debrief_session(TEXT) TO anon;
