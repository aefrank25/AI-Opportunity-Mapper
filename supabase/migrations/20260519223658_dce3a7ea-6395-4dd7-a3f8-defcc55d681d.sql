-- Drop the overly permissive policy that allows listing all files
drop policy if exists "Public read demo-videos" on storage.objects;

-- Create a narrow policy that only allows reading the specific shared video
create policy "Public read specific demo video"
on storage.objects for select
using (bucket_id = 'demo-videos' and name = 'ai-opp-mapper-demo.mp4');