-- Migration: Fix profiles deletion error by updating assessments and quotes foreign keys
-- Description: Sets ON DELETE SET NULL and drops NOT NULL constraints

-- Fix Assessments Table
ALTER TABLE public.assessments
DROP CONSTRAINT IF EXISTS assessments_contractor_id_fkey;

ALTER TABLE public.assessments
ADD CONSTRAINT assessments_contractor_id_fkey
FOREIGN KEY (contractor_id)
REFERENCES public.profiles(id)
ON DELETE SET NULL;

-- Fix Quotes Table
-- We must allow nulls in created_by for ON DELETE SET NULL to work
ALTER TABLE public.quotes 
ALTER COLUMN created_by DROP NOT NULL;

ALTER TABLE public.quotes
DROP CONSTRAINT IF EXISTS quotes_created_by_profile_fkey;

ALTER TABLE public.quotes
ADD CONSTRAINT quotes_created_by_profile_fkey
FOREIGN KEY (created_by)
REFERENCES public.profiles(id)
ON DELETE SET NULL;
