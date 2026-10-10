import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const editorEmail = process.env.EDITOR_EMAIL?.trim().toLowerCase();

  if (!supabaseUrl || !serviceRoleKey || !editorEmail) {
    return Response.json({ error: 'Server setup is incomplete. Configure the editor account and Supabase server key.' }, { status: 500 });
  }

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return Response.json({ error: 'Please sign in as the editor.' }, { status: 401 });

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  const signedInEmail = authData.user?.email?.trim().toLowerCase();
  if (authError || signedInEmail !== editorEmail) {
    return Response.json({ error: 'Only the configured editor account can add clients.' }, { status: 403 });
  }

  const { data: membership, error: membershipError } = await admin
    .from('project_members')
    .select('role')
    .eq('project_id', 'proj_promo_2026')
    .eq('email', editorEmail)
    .maybeSingle();
  if (membershipError || membership?.role !== 'Editor') {
    return Response.json({ error: 'The configured editor email must have Editor access in project_members.' }, { status: 403 });
  }

  let body: { email?: string; password?: string; name?: string; companyName?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid form data.' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? '';
  const name = body.name?.trim();
  const companyName = body.companyName?.trim();
  if (!email || !name || !companyName || password.length < 12) {
    return Response.json({ error: 'Enter the client details and a password of at least 12 characters.' }, { status: 400 });
  }
  if (email === editorEmail) {
    return Response.json({ error: 'The editor account cannot be added as a client.' }, { status: 400 });
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, company_name: companyName },
  });
  if (createError || !created.user) {
    return Response.json({ error: createError?.message || 'Could not create the client account.' }, { status: 400 });
  }

  const { error: insertError } = await admin.from('project_members').insert({
    project_id: 'proj_promo_2026',
    email,
    role: 'Client',
    display_name: name,
    company_name: companyName,
  });
  if (insertError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return Response.json({ error: insertError.code === '23505' ? 'That email already has project access.' : insertError.message }, { status: 400 });
  }

  return Response.json({ success: true, email }, { status: 201 });
}
