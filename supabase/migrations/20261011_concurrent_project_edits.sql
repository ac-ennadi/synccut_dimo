begin;

-- Comments are independent rows so simultaneous feedback never replaces another note.
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

-- Move historical comments out of the shared JSON snapshot before clients begin using the new path.
insert into public.project_feedback_notes (project_id, id, author_name, timecode, content, created_at)
select state_row.project_id,
       coalesce(note.value->>'id', 'legacy_' || md5(state_row.project_id || note.value::text)),
       coalesce(note.value->>'author_name', 'Team member'),
       nullif(note.value->>'timecode', ''),
       coalesce(note.value->>'content', ''),
       coalesce((note.value->>'created_at')::timestamptz, timezone('utc', now()))
from public.project_portal_state state_row
cross join lateral jsonb_array_elements(coalesce(state_row.state #> '{deliverable,feedback_notes}', '[]'::jsonb)) as note(value)
where coalesce(note.value->>'content', '') <> ''
on conflict (project_id, id) do nothing;

update public.project_portal_state
set state = jsonb_set(
  state,
  '{deliverable}',
  coalesce(state->'deliverable', '{}'::jsonb) - 'feedback_notes',
  true
)
where state #> '{deliverable,feedback_notes}' is not null;

-- Merge only the changed fields into the existing JSON. Concurrent updates to
-- separate fields therefore cannot restore an older full-project snapshot.
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

  if not found then
    raise exception 'Project state was not found';
  end if;
end;
$$;

grant execute on function public.merge_project_portal_state(text, jsonb) to authenticated;

alter table public.project_feedback_notes replica identity full;
do $$
begin
  alter publication supabase_realtime add table public.project_feedback_notes;
exception
  when duplicate_object then null;
end
$$;

commit;
