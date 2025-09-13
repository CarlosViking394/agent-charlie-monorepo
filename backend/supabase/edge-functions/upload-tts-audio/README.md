# upload-tts-audio Edge Function (optional)
- Expects JSON with { fileName, base64Audio, bucket? }
- Writes to Supabase Storage, returns a public URL.

Run locally (example):
  supabase functions serve --env-file ../../.env --no-verify-jwt
