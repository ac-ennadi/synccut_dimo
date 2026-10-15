import { createClient } from '@supabase/supabase-js';

export const PROJECT_VIDEO_BUCKET = 'project-videos';

/** Upload folders inside the bucket, one per asset kind the app stores. */
export const PROJECT_STORAGE_FOLDERS = ['videos', 'references', 'logos'] as const;

/**
 * Verifies the caller's Supabase session and returns an admin client scoped to
 * that request. Used by every signed-URL route: the browser never receives the
 * service role key, it only receives short-lived links minted here.
 */
export async function authorizeProjectRequest(request: Request, projectId: string) {
  if (!projectId || !/^[a-zA-Z0-9_-]{1,128}$/.test(projectId)) {
    return { error: 'Invalid project identifier.', status: 400 as const };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { error: 'Project storage is not configured on the server.', status: 500 as const };

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return { error: 'Sign in before accessing project files.', status: 401 as const };

  const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  const email = authData.user?.email?.trim().toLowerCase();
  if (authError || !email) return { error: 'Your session expired. Sign in again.', status: 401 as const };

  const { data: membership, error: membershipError } = await admin.from('project_members')
    .select('role').eq('project_id', projectId).eq('email', email).maybeSingle();
  if (membershipError) return { error: membershipError.message, status: 500 as const };
  if (!membership) return { error: 'You do not have access to this project.', status: 403 as const };

  return { admin, email, role: membership.role as 'Client' | 'Editor' };
}
