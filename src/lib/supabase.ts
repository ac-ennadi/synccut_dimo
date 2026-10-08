import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-project.supabase.co'
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** The demo OTP code used in dev mode (no Supabase needed). */
export const DEMO_OTP = '482910';

/**
 * Send a real Supabase email OTP — or simulate in demo mode.
 *
 * In demo mode (no Supabase env vars):
 *   - Waits 600 ms to simulate a network round-trip.
 *   - Returns `{ demoCode: '482910' }` so the UI can show it in the inbox simulator.
 *
 * In production mode (Supabase configured):
 *   - Calls supabase.auth.signInWithOtp and returns `{ demoCode: null }`.
 */
export async function sendMagicLink(
  email: string,
  redirectTo: string,
  metadata?: Record<string, string>,
): Promise<{ demoCode: string | null }> {
  if (!isSupabaseConfigured) {
    // Demo / dev mode — simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 600));
    return { demoCode: DEMO_OTP };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      data: metadata,
    },
  });
  if (error) throw error;
  return { demoCode: null };
}

/**
 * Verify a Supabase email OTP — or accept any 6-digit code in demo mode.
 *
 * In demo mode: accepts the fixed DEMO_OTP (482910) or any 6-digit code (loose check).
 * In production mode: delegates to supabase.auth.verifyOtp.
 */
export async function verifyOtpCode(
  email: string,
  token: string,
): Promise<{ session: unknown; user: unknown }> {
  if (!isSupabaseConfigured) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (token.length !== 6 || !/^\d{6}$/.test(token)) {
      throw new Error('Please enter a valid 6-digit code.');
    }
    // In demo mode we accept any 6 digits
    return { session: null, user: null };
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  if (error) throw error;
  return { session: data.session, user: data.user };
}
