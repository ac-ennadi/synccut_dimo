import { getEditorAdmin } from '@/lib/editor-admin';

export async function GET(request: Request) {
  let admin: ReturnType<typeof getEditorAdmin>;
  try {
    admin = getEditorAdmin();
  } catch {
    return Response.json({ error: 'Server setup is incomplete.' }, { status: 500 });
  }

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return Response.json({ error: 'Authentication is required.' }, { status: 401 });

  const { data: authData, error: authError } = await admin.admin.auth.getUser(token);
  const email = authData.user?.email?.trim().toLowerCase();
  if (authError || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Your session is invalid.' }, { status: 401 });
  }

  const { data, error } = await admin.admin
    .from('project_members')
    .select('project_id,display_name,company_name,role')
    .eq('email', email)
    .eq('role', 'Client')
    .order('project_id');
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const projectIds = [...new Set((data ?? []).map((membership) => membership.project_id))];
  if (!projectIds.length) {
    return Response.json({ error: 'This account is not assigned to a client project.' }, { status: 403 });
  }
  const { data: states, error: statesError } = projectIds.length
    ? await admin.admin.from('project_portal_state').select('project_id,state').in('project_id', projectIds)
    : { data: [], error: null };
  if (statesError) return Response.json({ error: statesError.message }, { status: 500 });
  const projectTitles = Object.fromEntries((states ?? []).map((row) => {
    const state = row.state as { project?: { title?: string } };
    return [row.project_id, state.project?.title?.trim() || row.project_id];
  }));

  return Response.json({
    user: {
      user_id: authData.user.id,
      name: data?.[0]?.display_name || authData.user.user_metadata?.name || email,
      email,
      role: 'Client',
      company_name: data?.[0]?.company_name || authData.user.user_metadata?.company_name || '',
      project_id: data?.[0]?.project_id,
      project_ids: projectIds,
      project_titles: projectTitles,
    },
  });
}
