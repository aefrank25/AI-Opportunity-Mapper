# Stop file listing in the demo video folder

## What this finding means
The demo video folder is already public, so anyone with the link can watch the homepage demo video. An extra rule also lets anyone ask the folder for its list of files. Right now that rule only covers the single demo video file, so nothing private is exposed. Still, the rule isn't needed.

## Change
- Remove the extra read rule on the demo video folder.
- The homepage video keeps playing, because it loads from the folder's public link and doesn't use this rule.
- Mark the finding as fixed.

## Check
- Open the homepage and confirm the demo video still loads and plays.

## Technical details
- Migration: `DROP POLICY "Public read specific demo video" ON storage.objects;`
- The bucket stays public, so object URLs (`/storage/v1/object/public/demo-videos/...`) keep working without a policy on `storage.objects`.
- I marked this finding as ignored last turn. The user may need to restore it from the Security tab before it can be marked as fixed.
