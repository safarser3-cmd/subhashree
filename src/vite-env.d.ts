/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_APIFY_API_TOKEN?: string;
  readonly VITE_TWITTER_BEARER_TOKEN?: string;
  readonly VITE_REDIS_URL?: string;
  readonly VITE_APP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
