-- SQL Migration: Add assessments table for Homeowner Dashboard

-- 1. Create assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    property_address TEXT NOT NULL,
    status TEXT CHECK (status IN ('draft', 'pending', 'scheduled', 'completed')) DEFAULT 'pending',
    scheduled_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Policy: Users can only view their own assessments
CREATE POLICY "Users can view own assessments" 
ON public.assessments 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own assessments
CREATE POLICY "Users can insert own assessments" 
ON public.assessments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can see all assessments (Optional but recommended)
-- CREATE POLICY "Admins can view all assessments" 
-- ON public.assessments 
-- FOR SELECT 
-- TO authenticated
-- USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. Sample Data (Optional - replace USER_ID_HERE with a real user ID)
-- INSERT INTO assessments (user_id, property_address, status, scheduled_date)
-- VALUES ('USER_ID_HERE', '123 Energy Way, Dublin', 'scheduled', '2026-03-15T10:00:00Z');
