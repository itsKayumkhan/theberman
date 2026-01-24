-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new'
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public to insert leads (Contact Form)
CREATE POLICY "Allow public insert" ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Allow admins/authenticated users to view leads
CREATE POLICY "Allow authenticated view" ON public.leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow admins to update leads (e.g. change status)
CREATE POLICY "Allow authenticated update" ON public.leads
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow admins to delete leads
CREATE POLICY "Allow authenticated delete" ON public.leads
  FOR DELETE
  TO authenticated
  USING (true);
