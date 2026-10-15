-- Hardens merge_project_portal_state against injection, sets safe search_path,
-- and adds explicit project access verification.
begin;

create or replace function public.merge_project_portal_state(p_project_id text, p_patch jsonb)
returns void
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  if p_project_id is null or length(trim(p_project_id)) = 0 then
    raise exception 'Invalid project ID';
  end if;

  if not exists (
    select 1 from public.project_members
    where project_members.project_id = p_project_id
      and lower(project_members.email) = lower(auth.jwt() ->> 'email')
  ) then
    raise exception 'Access denied for project %', p_project_id;
  end if;

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

commit;
