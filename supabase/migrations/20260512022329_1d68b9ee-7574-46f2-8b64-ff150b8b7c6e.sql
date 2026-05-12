-- Raw event log
CREATE TABLE public.resend_webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  email TEXT,
  payload JSONB NOT NULL,
  resend_event_id TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX resend_webhook_events_resend_event_id_key
  ON public.resend_webhook_events (resend_event_id)
  WHERE resend_event_id IS NOT NULL;

CREATE INDEX resend_webhook_events_email_idx
  ON public.resend_webhook_events (email);

CREATE INDEX resend_webhook_events_event_type_idx
  ON public.resend_webhook_events (event_type);

ALTER TABLE public.resend_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view resend webhook events"
  ON public.resend_webhook_events
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Suppression list (one row per email + reason)
CREATE TABLE public.email_suppressions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('unsubscribed', 'bounced', 'complained')),
  source TEXT NOT NULL DEFAULT 'resend',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (email, reason)
);

CREATE INDEX email_suppressions_email_idx ON public.email_suppressions (email);

ALTER TABLE public.email_suppressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email suppressions"
  ON public.email_suppressions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));