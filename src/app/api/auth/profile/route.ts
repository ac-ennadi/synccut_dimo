import { getEditorAdmin } from '@/lib/editor-admin';

export async function GET(request: Request) {
  let editorAuth: ReturnType<typeof getEditorAdmin>;
  try {
    editorAuth = getEditorAdmin();
  } catch {
    return Response.json({ error: 'Server setup is incomplete.' }, { status: 500 });
  }

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return Response.json({ error: 'Authentication is required.' }, { status: 401 });

  const { data, error } = await editorAuth.admin.auth.getUser(token);
  const email = data.user?.email?.trim().toLowerCase();
  if (error || !email || email !== editorAuth.editorEmail) {
    return Response.json({ error: 'This account is not an editor account.' }, { status: 403 });
  }

  const metadata = data.user.user_metadata ?? {};
  return Response.json({
    user: {
      user_id: data.user.id,
      name: metadata.name || email,
      email,
      role: 'Editor',
      company_name: metadata.company_name || '',
    },
  });
}
