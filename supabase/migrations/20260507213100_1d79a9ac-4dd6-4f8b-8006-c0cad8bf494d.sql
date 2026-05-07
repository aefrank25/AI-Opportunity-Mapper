CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  props jsonb NOT NULL DEFAULT '{}'::jsonb,
  path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT analytics_events_name_chk CHECK (length(name) BETWEEN 1 AND 100),
  CONSTRAINT analytics_events_path_chk CHECK (path IS NULL OR length(path) <= 2048)
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics events"
  ON public.analytics_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(name) BETWEEN 1 AND 100
    AND (path IS NULL OR length(path) <= 2048)
  );

CREATE POLICY "Admins can view analytics events"
  ON public.analytics_events
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE INDEX analytics_events_created_at_idx ON public.analytics_events (created_at DESC);
CREATE INDEX analytics_events_name_idx ON public.analytics_events (name);
