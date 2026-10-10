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

  -- Store feedback independently so simultaneous comments cannot overwrite each other.
  create table if not exists public.project_feedback_notes (
    project_id text not null references public.project_portal_state(project_id) on delete cascade,
    id text not null,
    author_name text not null,
    timecode text,
    content text not null,
    created_at timestamptz not null default timezone('utc', now()),
    primary key (project_id, id)
  );

  alter table public.project_feedback_notes enable row level security;
  drop policy if exists "Project members can read feedback notes" on public.project_feedback_notes;
  create policy "Project members can read feedback notes"
    on public.project_feedback_notes for select to authenticated
    using (exists (
      select 1 from public.project_members
      where project_members.project_id = project_feedback_notes.project_id
        and lower(project_members.email) = lower(auth.jwt() ->> 'email')
    ));
  drop policy if exists "Project members can add feedback notes" on public.project_feedback_notes;
  create policy "Project members can add feedback notes"
    on public.project_feedback_notes for insert to authenticated
    with check (exists (
      select 1 from public.project_members
      where project_members.project_id = project_feedback_notes.project_id
        and lower(project_members.email) = lower(auth.jwt() ->> 'email')
    ));
  grant select, insert on public.project_feedback_notes to authenticated;

  create or replace function public.merge_project_portal_state(p_project_id text, p_patch jsonb)
  returns void
  language plpgsql
  set search_path = public
  as $$
  begin
    update public.project_portal_state as portal
    set state = portal.state || jsonb_build_object(
          'project', coalesce(portal.state->'project', '{}'::jsonb) || coalesce(p_patch->'project', '{}'::jsonb),
          'brief', coalesce(portal.state->'brief', '{}'::jsonb) || coalesce(p_patch->'brief', '{}'::jsonb),
          'deliverable', coalesce(portal.state->'deliverable', '{}'::jsonb) || coalesce(p_patch->'deliverable', '{}'::jsonb)
        ),
        updated_by = auth.uid(),
        updated_at = timezone('utc', now())
    where portal.project_id = p_project_id;
    if not found then raise exception 'Project state was not found'; end if;
  end;
  $$;
  grant execute on function public.merge_project_portal_state(text, jsonb) to authenticated;

  do $$
  begin
    alter publication supabase_realtime add table public.project_portal_state;
  exception
    when duplicate_object then null;
  end
  $$;

  do $$
  begin
    alter publication supabase_realtime add table public.project_feedback_notes;
  exception
    when duplicate_object then null;
  end
  $$;
