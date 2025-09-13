import { Audio } from "expo-av";

// Example usage in a component:
// await speakViaN8N("Hola mundo");

export async function speakViaN8N(text: string, voiceId?: string) {
  const res = await fetch("https://n8n.agentcharlie.live/webhook/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice_id: voiceId }),
  });

  if (!res.ok) {
    throw new Error(`TTS failed: ${res.status} ${await res.text()}`);
  }

  // Turn response (audio/mpeg) into object URL for expo-av
  const blob = await res.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const b64 = Buffer.from(bytes).toString("base64");
  const uri = `data:audio/mpeg;base64,${b64}`;

  const { sound } = await Audio.Sound.createAsync({ uri });
  try {
    await sound.playAsync();
  } finally {
    // unload when appropriate in your component lifecycle
    // await sound.unloadAsync();
  }
}
