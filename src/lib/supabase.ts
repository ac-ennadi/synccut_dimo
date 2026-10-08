import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-project.supabase.co'
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Send a real Supabase email OTP.
 */
export async function sendMagicLink(
  email: string,
  redirectTo: string,
  metadata?: Record<string, string>,
) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Add the Supabase variables to .env.local.');
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
      data: metadata,
    },
  });
  if (error) throw error;
  return { data };
}

/**
 * Verify a Supabase email OTP.
 */
export async function verifyOtpCode(email: string, token: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Add the Supabase variables to .env.local.');
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  if (error) throw error;
  return { session: data.session, user: data.user };
}
