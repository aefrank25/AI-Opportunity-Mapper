
-- Roles enum
create type public.app_role as enum ('admin', 'moderator', 'user');

-- user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- has_role security definer function (avoids recursive RLS)
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Admins manage user_roles
create policy "Admins can view all user_roles"
  on public.user_roles
  for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert user_roles"
  on public.user_roles
  for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete user_roles"
  on public.user_roles
  for delete
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Users can view their own roles"
  on public.user_roles
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Admins can view waitlist entries
create policy "Admins can view all waitlist entries"
  on public.implementation_brief_waitlist
  for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));
