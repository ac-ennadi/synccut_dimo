import { createClient } from '@supabase/supabase-js';

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

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

export async function sendMagicLink(
  email: string,
  redirectTo: string,
  metadata?: Record<string, string>,
): Promise<{ demoCode: string | null }> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase authentication is not configured.');
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

export async function verifyOtpCode(
  email: string,
  token: string,
): Promise<Awaited<ReturnType<typeof supabase.auth.verifyOtp>>['data']> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase authentication is not configured.');
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
  if (error) throw error;
  return data;
}
