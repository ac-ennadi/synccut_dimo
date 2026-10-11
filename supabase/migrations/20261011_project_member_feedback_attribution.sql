alter table public.project_feedback_notes
  add column if not exists author_email text;
