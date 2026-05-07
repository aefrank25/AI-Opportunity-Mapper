
CREATE TABLE public.recommendation_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rating SMALLINT NOT NULL,
  notes TEXT,
  source_url TEXT,
  top_opportunity TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recommendation_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
ON public.recommendation_feedback
FOR INSERT
TO anon, authenticated
WITH CHECK (
  rating >= 1 AND rating <= 5
  AND (notes IS NULL OR length(notes) <= 2000)
  AND (source_url IS NULL OR length(source_url) <= 2048)
  AND (top_opportunity IS NULL OR length(top_opportunity) <= 200)
);

CREATE POLICY "Admins can view all feedback"
ON public.recommendation_feedback
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_recommendation_feedback_created_at
ON public.recommendation_feedback (created_at DESC);
