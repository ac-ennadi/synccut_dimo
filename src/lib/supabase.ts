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
 * Send Magic Link / OTP via Supabase (or fallback to demo simulator)
 */
export async function sendMagicLink(email: string, redirectTo: string) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    if (error) throw error;
    return { data, demoCode: null };
  }

  // Demo simulator mode
  await new Promise((resolve) => setTimeout(resolve, 600)); // simulate network delay
  const demoCode = '482910';
  return { data: { success: true }, demoCode };
}

/**
 * Verify 6-digit OTP token via Supabase (or fallback to demo simulator)
 */
export async function verifyOtpCode(email: string, token: string) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error) throw error;
    return { session: data.session, user: data.user };
  }

  // Demo simulator mode: accept '482910' or any 6-digit code
  await new Promise((resolve) => setTimeout(resolve, 500));
  if (token.length !== 6) {
    throw new Error('Please enter a valid 6-digit verification code.');
  }
  return { session: null, user: null };
}
