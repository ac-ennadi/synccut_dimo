import { createClient } from '@supabase/supabase-js';
import { PROJECT_STORAGE_FOLDERS, PROJECT_VIDEO_BUCKET } from '@/lib/project-storage';

export function getEditorAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const editorEmail = process.env.EDITOR_EMAIL?.trim().toLowerCase();
  if (!url || !key || !editorEmail) throw new Error('Server setup is incomplete.');
  return { admin: createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } }), editorEmail };
}

export type EditorAdmin = ReturnType<typeof getEditorAdmin>['admin'];

export async function authorizeEditor(request: Request) {
  const { admin, editorEmail } = getEditorAdmin();
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return { error: 'Please sign in as the editor.', status: 401 as const };
  const { data, error } = await admin.auth.getUser(token);
  if (error || data.user?.email?.trim().toLowerCase() !== editorEmail) {
    return { error: 'Only the configured editor account can access project members.', status: 403 as const };
  }
  const { data: member, error: memberError } = await admin.from('project_members')
    .select('email').eq('email', editorEmail).eq('role', 'Editor').limit(1).maybeSingle();
  if (memberError || !member) return { error: 'The configured editor email must have Editor access in project_members.', status: 403 as const };
  return { admin, editorEmail };
}

/** True only when the configured editor email holds an Editor row on this project. */
export async function hasProjectAccess(admin: EditorAdmin, editorEmail: string, projectId: string) {
  const { data, error } = await admin.from('project_members').select('project_id')
    .eq('project_id', projectId).eq('email', editorEmail).eq('role', 'Editor').maybeSingle();
  return !error && Boolean(data);
}

/**
 * Every storage path a project owns. Needed because removing a project state row
 * does not delete its uploaded files, which would otherwise stay in the bucket forever.
 */
export async function listProjectFiles(admin: EditorAdmin, projectId: string): Promise<string[]> {
  const listings = await Promise.all(PROJECT_STORAGE_FOLDERS.map((folder) =>
    admin.storage.from(PROJECT_VIDEO_BUCKET).list(`${projectId}/${folder}`, { limit: 1000 })));
  return listings.flatMap(({ data }, index) =>
    (data ?? []).map((entry) => `${projectId}/${PROJECT_STORAGE_FOLDERS[index]}/${entry.name}`));
}
