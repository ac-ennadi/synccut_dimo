import { authorizeProjectRequest, PROJECT_VIDEO_BUCKET } from '@/lib/project-storage';

export async function POST(request: Request) {
  let body: { projectId?: string; path?: string; downloadName?: string };
  try { body = await request.json(); } catch {
    return Response.json({ error: 'Invalid playback request.' }, { status: 400 });
  }
  const projectId = body.projectId?.trim();
  const path = body.path?.trim();
  // The prefix check stops a valid project member from reading another project's file.
  if (!projectId || !path || !path.startsWith(`${projectId}/`)) {
    return Response.json({ error: 'This video does not belong to the selected project.' }, { status: 400 });
  }

  const auth = await authorizeProjectRequest(request, projectId);
  if ('error' in auth) return Response.json({ error: auth.error }, { status: auth.status });

  const downloadName = body.downloadName?.replace(/[^\w.-]+/g, '_').slice(-120);
  const { data, error } = await auth.admin.storage.from(PROJECT_VIDEO_BUCKET)
    .createSignedUrl(path, 60 * 60, downloadName ? { download: downloadName } : undefined);
  if (error || !data) return Response.json({ error: error?.message ?? 'Could not open this video.' }, { status: 404 });
  return Response.json({ url: data.signedUrl });
}
