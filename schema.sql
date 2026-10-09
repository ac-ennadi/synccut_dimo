-- Run this in the Supabase SQL editor before using the shared project state.
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
  using (true);

drop policy if exists "Authenticated users can insert project state"
  on public.project_portal_state;
create policy "Authenticated users can insert project state"
  on public.project_portal_state
  for insert
  to authenticated
  with check (true);

drop policy if exists "Authenticated users can update project state"
  on public.project_portal_state;
create policy "Authenticated users can update project state"
  on public.project_portal_state
  for update
  to authenticated
  using (true)
  with check (true);

alter table public.project_portal_state replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.project_portal_state;
exception
  when duplicate_object then null;
end
$$;
