import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return Response.json({ error: 'Video playback is not configured.' }, { status: 500 });
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return Response.json({ error: 'Sign in to view this video.' }, { status: 401 });
  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  const email = authData.user?.email?.trim().toLowerCase();
  if (authError || !email) return Response.json({ error: 'Your session expired. Sign in again.' }, { status: 401 });

  let body: { projectId?: string; path?: string };
  try { body = await request.json(); } catch {
    return Response.json({ error: 'Invalid playback request.' }, { status: 400 });
  }
  const projectId = body.projectId?.trim();
  const path = body.path?.trim();
  if (!projectId || !path || !path.startsWith(`${projectId}/`)) {
    return Response.json({ error: 'This video does not belong to the selected project.' }, { status: 400 });
  }
  const { data: membership, error: membershipError } = await admin.from('project_members')
    .select('role').eq('project_id', projectId).eq('email', email).maybeSingle();
  if (membershipError || !membership || !['Editor', 'Client'].includes(membership.role)) {
    return Response.json({ error: 'You do not have access to this project video.' }, { status: 403 });
  }
  const { data, error } = await admin.storage.from('project-videos').createSignedUrl(path, 60 * 60);
  if (error || !data) return Response.json({ error: error?.message ?? 'Could not open this video.' }, { status: 404 });
  return Response.json({ url: data.signedUrl });
}
