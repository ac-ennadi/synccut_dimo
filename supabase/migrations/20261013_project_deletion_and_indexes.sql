-- Adds the missing access rule for removing project members, the indexes the
-- hot paths were doing without, and a cascade so deleting a project also
-- removes its membership rows. Safe to run on an existing database.
begin;

-- 1. Members could be added but never removed: only a SELECT policy existed, so
--    every DELETE was silently filtered out by row level security.
drop policy if exists "Project members can delete their own membership" on public.project_members;
create policy "Project members can delete their own membership"
  on public.project_members
  for delete
  to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

-- 2. Indexes. Every row level security check looks up a member by email and
--    project, and the agent's list view counts members per project, so both
--    columns are read on nearly every request.
create index if not exists project_members_email_idx
  on public.project_members (email);
create index if not exists project_members_project_id_idx
  on public.project_members (project_id);

-- Feedback cleanup by author needs this when a member is removed.
create index if not exists project_feedback_notes_author_email_idx
  on public.project_feedback_notes (author_email);

-- The portal already orders notes newest first for every project load.
create index if not exists project_feedback_notes_project_created_idx
  on public.project_feedback_notes (project_id, created_at desc);

-- 3. Deleting a project should not leave membership rows behind. The constraint
--    is only added when the existing data can satisfy it, so this migration
--    never deletes data on its own.
do $$
declare
  orphan_count integer;
begin
  select count(*) into orphan_count
  from public.project_members member
  where not exists (
    select 1 from public.project_portal_state state where state.project_id = member.project_id
  );

  if orphan_count > 0 then
    raise warning
      'Skipped the project_members cascade: % membership row(s) reference a project with no state row. Delete or fix those rows, then re-run this block.',
      orphan_count;
    return;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'project_members_project_id_fkey'
  ) then
    alter table public.project_members
      add constraint project_members_project_id_fkey
      foreign key (project_id) references public.project_portal_state(project_id) on delete cascade;
  end if;
end
$$;

commit;
