'use client';

import { supabase } from '@/lib/supabase';

/**
 * Deletes a project and everything stored under it. The signed-in editor's
 * session token is attached here so both the project list and the workspace
 * share one implementation.
 */
export async function deleteProject(projectId: string): Promise<{ removedFiles: number }> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Your session expired. Sign in again.');
  const response = await fetch('/api/editor/clients', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ projectId }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Could not delete this project.');
  return { removedFiles: result.removedFiles ?? 0 };
}
