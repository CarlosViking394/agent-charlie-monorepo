// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface UploadRequest {
  fileName: string;      // e.g. speech-123.mp3
  base64Audio: string;   // base64-encoded audio/mpeg
  bucket?: string;       // default from env
}

Deno.serve(async (req) => {
  try {
    const { fileName, base64Audio, bucket } = await req.json() as UploadRequest;
    if (!fileName || !base64Audio) {
      return new Response(JSON.stringify({ error: "fileName and base64Audio required" }), { status: 400 });
    }
    const b64 = base64Audio.split(",").pop() || base64Audio;
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));

    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE")!;
    const bucketName = bucket || Deno.env.get("SUPABASE_BUCKET") || "tts-audio";
    const publicPrefix = Deno.env.get("SUPABASE_PUBLIC_URL_PREFIX")!;

    // Upload via Storage REST API
    const uploadRes = await fetch(`${url}/storage/v1/object/${bucketName}/${fileName}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "audio/mpeg",
        "x-upsert": "true"
      },
      body: bytes
    });

    if (!uploadRes.ok) {
      const t = await uploadRes.text();
      return new Response(JSON.stringify({ error: "upload_failed", detail: t }), { status: 500 });
    }

    const publicUrl = `${publicPrefix}/${fileName}`;
    return new Response(JSON.stringify({ ok: true, publicUrl }), { headers: { "Content-Type": "application/json" }});
  } catch (e) {
    return new Response(JSON.stringify({ error: "bad_request", detail: String(e) }), { status: 400 });
  }
});
