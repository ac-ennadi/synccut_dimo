import { authorizeEditor, getEditorAdmin, hasProjectAccess } from '@/lib/editor-admin';

async function findAuthUser(admin: ReturnType<typeof getEditorAdmin>['admin'], email: string) {
  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return { error: error.message } as const;
    const user = data.users.find((entry) => entry.email?.trim().toLowerCase() === email);
    if (user || data.users.length < 1000) return { user } as const;
  }
}

const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: Request) {
  let auth: Awaited<ReturnType<typeof authorizeEditor>>;
  try { auth = await authorizeEditor(request); } catch { return Response.json({ error: 'Server setup is incomplete.' }, { status: 500 }); }
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });
  const projectId = new URL(request.url).searchParams.get('projectId')?.trim();
  if (!projectId || !SAFE_ID_REGEX.test(projectId) || !await hasProjectAccess(auth.admin, auth.editorEmail, projectId)) {
    return Response.json({ error: 'Project not found.' }, { status: 404 });
  }
  const { data, error } = await auth.admin.from('project_members').select('email,display_name,company_name')
    .eq('project_id', projectId).eq('role', 'Client').order('display_name');
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const { data: allMembers, error: allMembersError } = await auth.admin.from('project_members')
    .select('email,display_name,company_name').eq('role', 'Client').order('display_name');
  if (allMembersError) return Response.json({ error: allMembersError.message }, { status: 500 });
  const availableUsers = Array.from(new Map((allMembers ?? []).map((member) => [member.email, member])).values());
  return Response.json({ members: data ?? [], availableUsers });
}

export async function POST(request: Request) {
  let auth: Awaited<ReturnType<typeof authorizeEditor>>;
  try { auth = await authorizeEditor(request); } catch { return Response.json({ error: 'Server setup is incomplete.' }, { status: 500 }); }
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });

  let body: { projectId?: string; email?: string; name?: string; companyName?: string; password?: string };
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid form data.' }, { status: 400 }); }
  const projectId = body.projectId?.trim();
  const email = body.email?.trim().toLowerCase();
  const name = body.name?.trim();
  const companyName = body.companyName?.trim();
  const password = body.password ?? '';
  if (!projectId || !SAFE_ID_REGEX.test(projectId) || !await hasProjectAccess(auth.admin, auth.editorEmail, projectId)) {
    return Response.json({ error: 'Project not found.' }, { status: 404 });
  }
  if (!email || !EMAIL_REGEX.test(email) || !name || !companyName || email === auth.editorEmail) {
    return Response.json({ error: 'Enter a valid user name, email, and company.' }, { status: 400 });
  }

  const lookup = await findAuthUser(auth.admin, email);
  if ('error' in lookup) return Response.json({ error: lookup.error }, { status: 500 });
  const wasCreated = !lookup.user;
  let authUser = lookup.user;
  if (!authUser) {
    if (password.length < 12) return Response.json({ error: 'New users need a password of at least 12 characters.' }, { status: 400 });
    const { data, error } = await auth.admin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { name, company_name: companyName },
    });
    if (error || !data.user) return Response.json({ error: error?.message ?? 'Could not create the user account.' }, { status: 400 });
    authUser = data.user;
  }

  const { error } = await auth.admin.from('project_members').upsert({
    project_id: projectId, email, role: 'Client', display_name: name, company_name: companyName,
  }, { onConflict: 'project_id,email' });
  if (error) {
    if (wasCreated) await auth.admin.auth.admin.deleteUser(authUser.id);
    return Response.json({ error: error.code === '23505' ? 'This user is already on the project.' : error.message }, { status: 400 });
  }
  return Response.json({ success: true, email }, { status: 201 });
}

export async function DELETE(request: Request) {
  let auth: Awaited<ReturnType<typeof authorizeEditor>>;
  try { auth = await authorizeEditor(request); } catch { return Response.json({ error: 'Server setup is incomplete.' }, { status: 500 }); }
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });
  let body: { projectId?: string; email?: string };
  try { body = await request.json(); } catch { return Response.json({ error: 'Invalid request.' }, { status: 400 }); }
  const projectId = body.projectId?.trim();
  const email = body.email?.trim().toLowerCase();
  if (!projectId || !SAFE_ID_REGEX.test(projectId) || !email || !EMAIL_REGEX.test(email) || email === auth.editorEmail || !await hasProjectAccess(auth.admin, auth.editorEmail, projectId)) {
    return Response.json({ error: 'Project member not found.' }, { status: 404 });
  }
  const { data: membership, error: lookupError } = await auth.admin.from('project_members')
    .select('email').eq('project_id', projectId).eq('email', email).eq('role', 'Client').maybeSingle();
  if (lookupError || !membership) return Response.json({ error: 'Project member not found.' }, { status: 404 });
  const { error: deleteError } = await auth.admin.from('project_members').delete()
    .eq('project_id', projectId).eq('email', email).eq('role', 'Client');
  if (deleteError) return Response.json({ error: deleteError.message }, { status: 500 });

  const { error: notesError } = await auth.admin.from('project_feedback_notes').delete()
    .eq('project_id', projectId).eq('author_email', email);
  if (notesError) return Response.json({ error: 'Project access was removed, but this user’s feedback could not be deleted.' }, { status: 500 });

  const { data: remaining, error: remainingError } = await auth.admin.from('project_members').select('project_id')
    .eq('email', email).eq('role', 'Client');
  if (remainingError) return Response.json({ error: 'Access was removed, but the account cleanup check failed.' }, { status: 500 });
  let accountDeleted = false;
  if (!remaining?.length) {
    const lookup = await findAuthUser(auth.admin, email);
    if ('error' in lookup) return Response.json({ error: 'Access was removed, but the account could not be checked for deletion.' }, { status: 500 });
    if (lookup.user) {
      const { error: accountError } = await auth.admin.auth.admin.deleteUser(lookup.user.id);
      if (accountError) return Response.json({ error: 'Project access was removed, but the user account could not be deleted.' }, { status: 500 });
      accountDeleted = true;
    }
  }
  return Response.json({ success: true, accountDeleted });
}
