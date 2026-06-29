CREATE TABLE IF NOT EXISTS public.assistant_action_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  original_message TEXT NOT NULL,
  action_type TEXT NOT NULL,
  entities JSONB NOT NULL DEFAULT '{}'::jsonb,
  result TEXT NOT NULL CHECK (result IN ('success', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.assistant_action_audit ENABLE ROW LEVEL SECURITY;
