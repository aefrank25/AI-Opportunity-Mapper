-- Track emails captured in exchange for +2 bonus Live Scans.
CREATE TABLE public.scan_bonus_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_bonus_emails ENABLE ROW LEVEL SECURITY;

-- Anyone (anon or authenticated) can join — same shape as the existing waitlist table.
CREATE POLICY "Anyone can claim a scan bonus with a valid email"
ON public.scan_bonus_emails
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(email) >= 3
  AND length(email) <= 320
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND (source_url IS NULL OR length(source_url) <= 2048)
);

-- Only admins can read the captured emails.
CREATE POLICY "Admins can view all scan bonus emails"
ON public.scan_bonus_emails
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));