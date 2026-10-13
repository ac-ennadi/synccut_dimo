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
  if (authError || !email) return Response.json({ error: 'Your session is invalid.' }, { status: 401 });

  const { data, error } = await admin.admin
    .from('project_members')
    .select('project_id,display_name,company_name,role')
    .ilike('email', email)
    .eq('role', 'Client')
    .order('project_id');
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({
    user: {
      user_id: authData.user.id,
      name: data?.[0]?.display_name || authData.user.user_metadata?.name || email,
      email,
      role: 'Client',
      company_name: data?.[0]?.company_name || authData.user.user_metadata?.company_name || '',
      project_id: data?.[0]?.project_id,
      project_ids: data?.map((membership) => membership.project_id) ?? [],
    },
  });
}
