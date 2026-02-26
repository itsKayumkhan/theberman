-- Create the leads table
create table leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status text default 'new' -- 'new', 'contacted', 'closed'
);

-- Enable Row Level Security (RLS)
alter table leads enable row level security;

-- Policy: Allow anyone (anon) to insert leads
create policy "Anyone can insert leads"
on leads for insert
with check (true);

-- Policy: Only authenticated users (admins) can view leads
create policy "Admins can view leads"
on leads for select
to authenticated
using (true);
