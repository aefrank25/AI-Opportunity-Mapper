
drop policy if exists "Anyone can join the waitlist" on public.implementation_brief_waitlist;

create policy "Anyone can join the waitlist with a valid email"
  on public.implementation_brief_waitlist
  for insert
  to anon, authenticated
  with check (
    length(email) between 3 and 320
    and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    and (source_url is null or length(source_url) <= 2048)
    and (top_opportunity is null or length(top_opportunity) <= 200)
  );
