-- Keep source videos private. The application issues short-lived playback and
-- upload URLs only after checking the signed-in user's project membership.
insert into storage.buckets (id, name, public, file_size_limit)
values ('project-videos', 'project-videos', false, 536870912)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit;
