// SyncCut feedback diagnostic — reproduces the exact write that fails in the UI.
//
//   node scripts/feedback-diag.js CLIENT_EMAIL "CLIENT_PASSWORD"
//
// It signs in as that account with the public key (the same key the browser
// uses) and runs the four checks that the "Could not save your feedback" error
// depends on. Run it while the client is logged out of the app, or on a fresh
// browser, so the probe session matches what the failing user sees.
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';

const [emailArg, passwordArg] = process.argv.slice(2);
if (!emailArg || !passwordArg) {
  console.error('Usage: node scripts/feedback-diag.js CLIENT_EMAIL "CLIENT_PASSWORD"');
  process.exit(2);
}
const email = emailArg.trim().toLowerCase();

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^\s*[A-Za-z_]+=/.test(line))
    .map((line) => {
      const index = line.indexOf('=');
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    }),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '');
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local');
  process.exit(2);
}

const supabase = createClient(url, key);
const log = (label, value) => console.log(`\n[diag] ${label}\n`, value);

const { data: auth, error: authError } = await supabase.auth.signInWithPassword({ email, password: passwordArg });
if (authError) { log('RESULT', `SIGN-IN FAILED: ${authError.message}`); process.exit(1); }
const sessionEmail = auth.session.user.email?.trim().toLowerCase();
log('signed in as', { email: sessionEmail, id: auth.user.id });

// 1. Membership rows this email owns (the RLS policy reads exactly this table).
const members = await supabase.from('project_members').select('project_id,email,role,display_name').eq('email', sessionEmail);
log('1. project_members for this email', members);
if (members.error || !members.data?.length) {
  log('RESULT', 'NO MEMBERSHIP ROW → the feedback insert is denied by RLS. Add this email to the project in the editor workspace, or run 20261010_client_project_isolation.sql.');
  process.exit(0);
}

for (const member of members.data) {
  const projectId = member.project_id;

  const state = await supabase.from('project_portal_state').select('project_id').eq('project_id', projectId).maybeSingle();
  log(`2. project_portal_state[${projectId}]`, state);

  const read = await supabase.from('project_feedback_notes').select('id').eq('project_id', projectId).limit(1);
  log(`3. read notes[${projectId}] (SELECT policy)`, read);

  const probe = await supabase.from('project_feedback_notes')
    .insert({ project_id: projectId, id: `diag_${Date.now()}`, author_name: 'diagnostic', author_email: sessionEmail, timecode: null, content: '__diag_probe__' })
    .select('id').single();
  log(`4. insert note[${projectId}] (the failing write)`, probe);

  if (probe.error) {
    const message = probe.error.message;
    if (/column .* does not exist/i.test(message)) {
      log('RESULT', 'MISSING COLUMN → run 20261011_project_member_feedback_attribution.sql (adds author_email).');
    } else if (/row-level security|permission denied/i.test(message) || probe.error.code === '42501') {
      log('RESULT', 'RLS DENIED THE INSERT → run 20261011_concurrent_project_edits.sql (creates the INSERT policy and the feedback table).');
    } else if (/foreign key|violates|not present/i.test(message) || probe.error.code === '23503') {
      log('RESULT', 'MISSING STATE ROW → project_portal_state has no row for this project, so notes cannot reference it.');
    } else {
      log('RESULT', `UNEXPECTED ERROR: ${message}`);
    }
  } else if (probe.data) {
    log('RESULT', 'INSERT SUCCEEDED → saving works. If the app still fails, the problem is the session/redirect race: hard-refresh and retry.');
    const del = await supabase.from('project_feedback_notes').delete().eq('id', probe.data.id);
    log('cleanup probe', del);
  }
}

await supabase.auth.signOut();
