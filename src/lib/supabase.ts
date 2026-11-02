import { createClient } from '@supabase/supabase-js';

const REQUEST_TIMEOUT_MS = 20_000;

export const fetchWithTimeout: typeof fetch = (input, init = {}) => {
  const controller = new AbortController();
  const upstreamSignal = init.signal ?? (input instanceof Request ? input.signal : undefined);
  const abortFromUpstream = () => controller.abort(upstreamSignal?.reason);
  if (upstreamSignal?.aborted) abortFromUpstream();
  else upstreamSignal?.addEventListener('abort', abortFromUpstream, { once: true });

  const timeout = setTimeout(() => controller.abort(new DOMException('Request timed out', 'TimeoutError')), REQUEST_TIMEOUT_MS);
  return fetch(input, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timeout);
    upstreamSignal?.removeEventListener('abort', abortFromUpstream);
  });
};

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-project.supabase.co',
);

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  global: { fetch: fetchWithTimeout },
});

/**
 * Short-lived signed URLs are cached for speed. Signing out must drop them so a
 * later session cannot reuse a link minted for the previous user.
 */
const signOutListeners = new Set<() => void>();

export function onSignOut(listener: () => void) {
  signOutListeners.add(listener);
  return () => { signOutListeners.delete(listener); };
}

export async function signOutAndClearCaches() {
  for (const listener of signOutListeners) listener();
  if (isSupabaseConfigured) await supabase.auth.signOut();
}

export async function signInWithPassword(email: string, password: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase authentication is not configured.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}
