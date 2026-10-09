-- Run this in the Supabase SQL editor before using the shared project state.
-- Add one row per real email address that should access the project.
create table if not exists public.project_members (
  project_id text not null,
  email text not null,
  role text not null check (role in ('Client', 'Editor')),
  display_name text not null default '',
  company_name text not null default '',
  primary key (project_id, email)
);

alter table public.project_members enable row level security;

drop policy if exists "Users can read their own project membership"
  on public.project_members;
create policy "Users can read their own project membership"
  on public.project_members
  for select
  to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

create table if not exists public.project_portal_state (
  project_id text primary key,
  state jsonb not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.project_portal_state enable row level security;

drop policy if exists "Authenticated users can read project state"
  on public.project_portal_state;
create policy "Authenticated users can read project state"
  on public.project_portal_state
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.project_members
      where project_members.project_id = project_portal_state.project_id
        and lower(project_members.email) = lower(auth.jwt() ->> 'email')
    )
  );

drop policy if exists "Authenticated users can insert project state"
  on public.project_portal_state;
create policy "Authenticated users can insert project state"
  on public.project_portal_state
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.project_members
      where project_members.project_id = project_portal_state.project_id
        and lower(project_members.email) = lower(auth.jwt() ->> 'email')
    )
  );

drop policy if exists "Authenticated users can update project state"
  on public.project_portal_state;
create policy "Authenticated users can update project state"
  on public.project_portal_state
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.project_members
      where project_members.project_id = project_portal_state.project_id
        and lower(project_members.email) = lower(auth.jwt() ->> 'email')
    )
  )
  with check (
    exists (
      select 1
      from public.project_members
      where project_members.project_id = project_portal_state.project_id
        and lower(project_members.email) = lower(auth.jwt() ->> 'email')
    )
  );

alter table public.project_portal_state replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.project_portal_state;
exception
  when duplicate_object then null;
end
$$;
