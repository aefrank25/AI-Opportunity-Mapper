insert into storage.buckets (id, name, public) values ('demo-videos', 'demo-videos', true) on conflict (id) do update set public = true;

create policy "Public read demo-videos"
on storage.objects for select
using (bucket_id = 'demo-videos');