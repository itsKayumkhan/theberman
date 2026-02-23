-- migration.sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS manual_override_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
