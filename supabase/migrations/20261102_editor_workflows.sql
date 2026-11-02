begin;

alter table public.project_feedback_notes
  add column if not exists status text not null default 'open',
  add column if not exists cut_version text;

alter table public.project_feedback_notes
  drop constraint if exists project_feedback_notes_status_check;
alter table public.project_feedback_notes
  add constraint project_feedback_notes_status_check
  check (status in ('open', 'in_progress', 'resolved'));

drop policy if exists "Editors can update feedback status" on public.project_feedback_notes;
create policy "Editors can update feedback status"
  on public.project_feedback_notes for update to authenticated
  using (exists (
    select 1 from public.project_members
    where project_members.project_id = project_feedback_notes.project_id
      and lower(project_members.email) = lower(auth.jwt() ->> 'email')
      and project_members.role = 'Editor'
  ))
  with check (exists (
    select 1 from public.project_members
    where project_members.project_id = project_feedback_notes.project_id
      and lower(project_members.email) = lower(auth.jwt() ->> 'email')
      and project_members.role = 'Editor'
  ));

grant update (status) on public.project_feedback_notes to authenticated;

commit;
