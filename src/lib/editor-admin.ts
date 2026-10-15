import { createClient } from '@supabase/supabase-js';
import { PROJECT_STORAGE_FOLDERS, PROJECT_VIDEO_BUCKET } from '@/lib/project-storage';

export function getEditorAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server setup is incomplete.');
  return { admin: createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } }) };
}

export type EditorAdmin = ReturnType<typeof getEditorAdmin>['admin'];

export async function authorizeEditor(request: Request) {
  const { admin } = getEditorAdmin();
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return { error: 'Please sign in as the editor.', status: 401 as const };
  const { data, error } = await admin.auth.getUser(token);
  const editorEmail = data.user?.email?.trim().toLowerCase();
  if (error || !editorEmail) {
    return { error: 'Your session is invalid. Sign in again.', status: 401 as const };
  }
  const { data: membership, error: membershipError } = await admin.from('project_members')
    .select('project_id').eq('email', editorEmail).eq('role', 'Editor').limit(1).maybeSingle();
  if (membershipError) return { error: membershipError.message, status: 500 as const };
  if (!membership) return { error: 'This account is not authorized as an editor.', status: 403 as const };
  return { admin, editorEmail };
}

/** True only when the authenticated editor holds an Editor row on this project. */
export async function hasProjectAccess(admin: EditorAdmin, editorEmail: string, projectId: string) {
  if (!projectId || !/^[a-zA-Z0-9_-]{1,128}$/.test(projectId)) return false;
  const { data, error } = await admin.from('project_members').select('project_id')
    .eq('project_id', projectId).eq('email', editorEmail).eq('role', 'Editor').maybeSingle();
  return !error && Boolean(data);
}

/**
 * Every storage path a project owns. Needed because removing a project state row
 * does not delete its uploaded files, which would otherwise stay in the bucket forever.
 */
export async function listProjectFiles(admin: EditorAdmin, projectId: string): Promise<string[]> {
  if (!projectId || !/^[a-zA-Z0-9_-]{1,128}$/.test(projectId)) return [];
  const listings = await Promise.all(PROJECT_STORAGE_FOLDERS.map((folder) =>
    admin.storage.from(PROJECT_VIDEO_BUCKET).list(`${projectId}/${folder}`, { limit: 1000 })));
  return listings.flatMap(({ data }, index) =>
    (data ?? []).map((entry) => `${projectId}/${PROJECT_STORAGE_FOLDERS[index]}/${entry.name}`));
}
