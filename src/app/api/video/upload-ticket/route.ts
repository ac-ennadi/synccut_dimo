import { createClient } from '@supabase/supabase-js';

const bucket = 'project-videos';

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const editorEmail = process.env.EDITOR_EMAIL?.trim().toLowerCase();
  if (!url || !key || !editorEmail) {
    return Response.json({ error: 'Video upload is not configured on the server.' }, { status: 500 });
  }

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return Response.json({ error: 'Sign in as the editor to upload a cut.' }, { status: 401 });

  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || authData.user?.email?.trim().toLowerCase() !== editorEmail) {
    return Response.json({ error: 'Only the configured editor can upload project videos.' }, { status: 403 });
  }

  let body: { projectId?: string; fileName?: string; contentType?: string };
  try { body = await request.json(); } catch {
    return Response.json({ error: 'Invalid upload details.' }, { status: 400 });
  }
  const projectId = body.projectId?.trim();
  const fileName = body.fileName?.replace(/[^\w.-]+/g, '_').slice(-120);
  const contentType = body.contentType?.toLowerCase() ?? '';
  if (!projectId || !fileName || !contentType.startsWith('video/')) {
    return Response.json({ error: 'Choose a video file for this project.' }, { status: 400 });
  }

  const { data: membership, error: membershipError } = await admin.from('project_members')
    .select('project_id').eq('project_id', projectId).eq('email', editorEmail).eq('role', 'Editor').maybeSingle();
  if (membershipError || !membership) {
    return Response.json({ error: 'You do not have editor access to this project.' }, { status: 403 });
  }

  const path = `${projectId}/${crypto.randomUUID()}-${fileName}`;
  const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data) {
    return Response.json({ error: error?.message ?? 'Could not prepare the video upload.' }, { status: 500 });
  }
  return Response.json({ path: data.path, token: data.token });
}
