-- Batch analytics / metrics / errors sink (server-side inserts via service role)

CREATE TABLE IF NOT EXISTS public.analytics_ingest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL CHECK (kind IN ('events', 'metrics', 'errors')),
  item_count integer NOT NULL DEFAULT 0,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_analytics_ingest_created_at ON public.analytics_ingest (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_ingest_kind ON public.analytics_ingest (kind);

ALTER TABLE public.analytics_ingest ENABLE ROW LEVEL SECURITY;

-- No client policies: only service role (Edge / server) inserts

COMMENT ON TABLE public.analytics_ingest IS 'Optional batch sink for client analytics; RLS blocks direct user access.';
