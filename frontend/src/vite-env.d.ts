/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_N8N_WEBHOOK_URL: string;
  readonly VITE_N8N_URL: string;
  readonly VITE_ENABLE_MOCK_DATA: string;
  readonly VITE_ENABLE_TTS: string;
  readonly VITE_ENABLE_CHAT: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
