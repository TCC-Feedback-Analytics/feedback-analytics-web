/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  /** Gateway direto, para as rotas públicas que contam por IP; ausente = VITE_API_BASE_URL. */
  readonly VITE_PUBLIC_API_BASE_URL?: string;
  /** "true" mostra o "Continuar com Google" (as credenciais ficam no gateway). */
  readonly VITE_GOOGLE_AUTH_ENABLED?: string;
  readonly GEMINI_API_KEY: string;
  readonly PUBLIC_SITE_URL: string;
  // Adicione outras variáveis de ambiente que você usar aqui
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
