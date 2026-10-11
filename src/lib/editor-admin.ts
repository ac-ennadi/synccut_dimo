import { createClient } from '@supabase/supabase-js';

export function getEditorAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const editorEmail = process.env.EDITOR_EMAIL?.trim().toLowerCase();
  if (!url || !key || !editorEmail) throw new Error('Server setup is incomplete.');
  return { admin: createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } }), editorEmail };
}

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
