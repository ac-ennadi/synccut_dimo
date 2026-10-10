-- One-time migration for existing rows that used the shared project ID.
-- Existing client workspaces are copied into their own project rows. Historical
-- feedback is cleared because the shared row cannot identify which client wrote it.
begin;

with client_projects as (
  select pm.project_id as old_project_id, pm.email, pm.company_name,
         'client_' || md5(lower(pm.email)) as new_project_id,
         ps.state as old_state, ps.updated_by
  from public.project_members pm
  left join public.project_portal_state ps on ps.project_id = pm.project_id
  where pm.role = 'Client' and pm.project_id = 'proj_promo_2026'
)
insert into public.project_portal_state (project_id, state, updated_by)
select new_project_id,
  old_state || jsonb_build_object(
    'project', coalesce(old_state->'project','{}'::jsonb) || jsonb_build_object(
      'project_id',new_project_id,'title','Project: '||company_name,'client_id',email),
    'brief', coalesce(old_state->'brief','{}'::jsonb) || jsonb_build_object('project_id',new_project_id),
    'deliverable', coalesce(old_state->'deliverable','{}'::jsonb) || jsonb_build_object(
      'project_id',new_project_id,'feedback_notes','[]'::jsonb)
  ),
  updated_by
from client_projects where old_state is not null
on conflict (project_id) do nothing;

update public.project_members
set project_id='client_'||md5(lower(email))
where role='Client' and project_id='proj_promo_2026';

insert into public.project_members(project_id,email,role,display_name,company_name)
select distinct client.project_id, editor.email, 'Editor', editor.display_name, editor.company_name
from public.project_members client
cross join lateral (
  select email,display_name,company_name from public.project_members
  where role='Editor' order by project_id limit 1
) editor
where client.role='Client'
on conflict(project_id,email) do nothing;

commit;
