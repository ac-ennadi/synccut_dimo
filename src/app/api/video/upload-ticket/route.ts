import { authorizeProjectRequest, PROJECT_VIDEO_BUCKET } from '@/lib/project-storage';

export async function POST(request: Request) {
  let body: { projectId?: string; fileName?: string; contentType?: string; assetType?: string };
  try { body = await request.json(); } catch {
    return Response.json({ error: 'Invalid upload details.' }, { status: 400 });
  }
  const projectId = body.projectId?.trim();
  const fileName = body.fileName?.replace(/[^\w.-]+/g, '_').slice(-120);
  if (!projectId || !fileName) return Response.json({ error: 'Choose a supported logo, video, or image file.' }, { status: 400 });

  const auth = await authorizeProjectRequest(request, projectId);
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });

  const contentType = body.contentType?.toLowerCase() ?? '';
  const isLogo = body.assetType === 'logo';
  const extension = fileName.split('.').pop()?.toLowerCase();
  const validLogo = isLogo && ['svg', 'ai', 'eps', 'png'].includes(extension ?? '');
  const validEditorAsset = !isLogo && (contentType.startsWith('video/') || contentType.startsWith('image/'));
  if (!validLogo && !validEditorAsset) {
    return Response.json({ error: 'Choose a supported logo, video, or image file.' }, { status: 400 });
  }
  if (isLogo ? auth.role !== 'Client' : auth.role !== 'Editor') {
    return Response.json({ error: isLogo ? 'Only a project client can upload its logo.' : 'You do not have editor access to this project.' }, { status: 403 });
  }

  const folder = isLogo ? 'logos' : contentType.startsWith('image/') ? 'references' : 'videos';
  const path = `${projectId}/${folder}/${crypto.randomUUID()}-${fileName}`;
  const { data, error } = await auth.admin.storage.from(PROJECT_VIDEO_BUCKET).createSignedUploadUrl(path);
  if (error || !data) {
    return Response.json({ error: error?.message ?? 'Could not prepare the video upload.' }, { status: 500 });
  }
  return Response.json({ path: data.path, token: data.token });
}
