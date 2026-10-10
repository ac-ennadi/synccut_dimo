import { createClient } from '@supabase/supabase-js';

const bucket = 'project-videos';

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return Response.json({ error: 'Video upload is not configured on the server.' }, { status: 500 });
  }

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return Response.json({ error: 'Sign in before uploading a project file.' }, { status: 401 });

  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  const email = authData.user?.email?.trim().toLowerCase();
  if (authError || !email) return Response.json({ error: 'Your session expired. Sign in again.' }, { status: 401 });

  let body: { projectId?: string; fileName?: string; contentType?: string; assetType?: string };
  try { body = await request.json(); } catch {
    return Response.json({ error: 'Invalid upload details.' }, { status: 400 });
  }
  const projectId = body.projectId?.trim();
  const fileName = body.fileName?.replace(/[^\w.-]+/g, '_').slice(-120);
  const contentType = body.contentType?.toLowerCase() ?? '';
  const isLogo = body.assetType === 'logo';
  const extension = fileName?.split('.').pop()?.toLowerCase();
  const validLogo = isLogo && ['svg', 'ai', 'eps', 'png'].includes(extension ?? '');
  const validEditorAsset = !isLogo && (contentType.startsWith('video/') || contentType.startsWith('image/'));
  if (!projectId || !fileName || (!validLogo && !validEditorAsset)) {
    return Response.json({ error: 'Choose a supported logo, video, or image file.' }, { status: 400 });
  }

  const { data: membership, error: membershipError } = await admin.from('project_members')
    .select('project_id,role').eq('project_id', projectId).eq('email', email).maybeSingle();
  if (membershipError || !membership || (isLogo ? membership.role !== 'Client' : membership.role !== 'Editor')) {
    return Response.json({ error: isLogo ? 'Only a project client can upload its logo.' : 'You do not have editor access to this project.' }, { status: 403 });
  }

  const folder = isLogo ? 'logos' : contentType.startsWith('image/') ? 'references' : 'videos';
  const path = `${projectId}/${folder}/${crypto.randomUUID()}-${fileName}`;
  const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data) {
    return Response.json({ error: error?.message ?? 'Could not prepare the video upload.' }, { status: 500 });
  }
  return Response.json({ path: data.path, token: data.token });
}
