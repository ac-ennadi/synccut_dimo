import { mockBrief, mockDeliverable, mockProject } from '@/lib/mock-data';
import { authorizeEditor } from '@/lib/editor-admin';
import { normalizeProjectStatus } from '@/lib/project-status';
import { normalizeProjectType } from '@/lib/project-type';

export async function GET(request: Request) {
  let auth: Awaited<ReturnType<typeof authorizeEditor>>;
  try { auth = await authorizeEditor(request); } catch { return Response.json({ error: 'Server setup is incomplete.' }, { status: 500 }); }
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });

  const { data: editorRows, error } = await auth.admin.from('project_members')
    .select('project_id').eq('email', auth.editorEmail).eq('role', 'Editor');
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const projectIds = [...new Set((editorRows ?? []).map((row) => row.project_id))];
  if (!projectIds.length) return Response.json({ projects: [] });

  const [{ data: members, error: membersError }, { data: states, error: statesError }] = await Promise.all([
    auth.admin.from('project_members').select('project_id,email,display_name,company_name,role').in('project_id', projectIds).eq('role', 'Client').order('display_name'),
    auth.admin.from('project_portal_state').select('project_id,state').in('project_id', projectIds),
  ]);
  if (membersError || statesError) return Response.json({ error: membersError?.message ?? statesError?.message }, { status: 500 });
  const stateByProject = new Map((states ?? []).map((row) => [row.project_id, row.state as {
    project?: { title?: string; status?: string; project_type?: string };
    deliverable?: { version_number?: string };
  }]));
  const membersByProject = new Map<string, typeof members>();
  for (const member of members ?? []) membersByProject.set(member.project_id, [...(membersByProject.get(member.project_id) ?? []), member]);

  const projects = projectIds.map((projectId) => {
    const state = stateByProject.get(projectId);
    const projectType = normalizeProjectType(state?.project?.project_type);
    const projectMembers = membersByProject.get(projectId) ?? [];
    return {
      project_id: projectId,
      title: state?.project?.title ?? projectId,
      company_name: projectMembers[0]?.company_name ?? '',
      members: projectMembers,
      projectType,
      status: normalizeProjectStatus(state?.project?.status, projectType),
      latestCut: state?.deliverable?.version_number ?? 'No video uploaded',
    };
  });
  return Response.json({ projects });
}

export async function POST(request: Request) {
  let auth: Awaited<ReturnType<typeof authorizeEditor>>;
  try { auth = await authorizeEditor(request); } catch { return Response.json({ error: 'Server setup is incomplete.' }, { status: 500 }); }
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });

  let body: { action?: string; projectName?: string; companyName?: string; projectType?: string };
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid form data.' }, { status: 400 }); }
  const projectName = body.projectName?.trim();
  const companyName = body.companyName?.trim();
  const projectType = body.projectType === 'after_effects' ? 'after_effects' : body.projectType === 'premiere_pro' ? 'premiere_pro' : null;
  if (body.action !== 'create-project') return Response.json({ error: 'Choose a valid project action.' }, { status: 400 });
  if (!projectName || !companyName || projectName.length < 2 || companyName.length < 2 || !projectType) {
    return Response.json({ error: 'Enter a project name, company name, and project type.' }, { status: 400 });
  }

  const projectId = `project_${crypto.randomUUID()}`;
  const project = { ...mockProject, project_id: projectId, client_id: '', title: projectName, project_type: projectType, status: 'Scripting' as const };
  const brief = { ...mockBrief, brief_id: `brief_${projectId}`, project_id: projectId, version_label: 'Script draft', is_locked: false, target_audience: '', script_scenes: [], script_sections: [] };
  const deliverable = { ...mockDeliverable, deliverable_id: `deliverable_${projectId}`, project_id: projectId, video_url: '', feedback_notes: [], uploaded_at: 'No video uploaded yet', action_required_by: 'Editor' as const, action_banner_text: 'Add the first video cut when it is ready.' };
  const { error: stateError } = await auth.admin.from('project_portal_state').insert({
    project_id: projectId,
    state: { project: { ...project, company_name: companyName }, brief, deliverable },
  });
  if (stateError) return Response.json({ error: stateError.message }, { status: 500 });
  const { error: memberError } = await auth.admin.from('project_members').insert({
    project_id: projectId, email: auth.editorEmail, role: 'Editor', display_name: 'Editor', company_name: 'SyncCut',
  });
  if (memberError) {
    await auth.admin.from('project_portal_state').delete().eq('project_id', projectId);
    return Response.json({ error: memberError.message }, { status: 500 });
  }
  return Response.json({ success: true, projectId }, { status: 201 });
}
