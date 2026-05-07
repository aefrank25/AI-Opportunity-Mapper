
create table public.implementation_brief_waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source_url text,
  top_opportunity text,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index implementation_brief_waitlist_email_key
  on public.implementation_brief_waitlist (lower(email));

alter table public.implementation_brief_waitlist enable row level security;

create policy "Anyone can join the waitlist"
  on public.implementation_brief_waitlist
  for insert
  to anon, authenticated
  with check (true);
