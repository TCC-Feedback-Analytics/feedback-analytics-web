/**
 * "Conectar com OpenRouter" (OAuth PKCE): a pessoa entra (ou cria a conta) no
 * OpenRouter e volta já conectada, sem copiar nem colar chave. Aqui ficam o par
 * do PKCE e o que guardar até a volta; a troca do código pela chave é no gateway.
 * https://openrouter.ai/docs/use-cases/oauth-pkce
 */
const STORAGE_KEY = 'feedback:openrouter-connect';
export const OPENROUTER_CALLBACK_PATH = '/user/openrouter/callback';
const OPENROUTER_AUTH_URL = 'https://openrouter.ai/auth';
/** Um pedido de conexão vale por 15 minutos. */
const MAX_AGE_MS = 15 * 60_000;

export type PendingOpenRouterConnect = {
  codeVerifier: string;
  /** Para onde voltar depois de conectar (a tela de onde a pessoa saiu). */
  returnTo: string;
  /** Modelo que a pessoa já tinha escolhido, se havia. */
  model?: string;
  createdAt: number;
};

function base64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Verificador aleatório de 64 caracteres (dentro dos 43 a 128 do PKCE) e o desafio S256. */
export async function createPkcePair(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const codeVerifier = base64Url(crypto.getRandomValues(new Uint8Array(48)));
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
  return { codeVerifier, codeChallenge: base64Url(new Uint8Array(digest)) };
}

export function openRouterAuthUrl(origin: string, codeChallenge: string): string {
  const url = new URL(OPENROUTER_AUTH_URL);
  url.searchParams.set('callback_url', `${origin}${OPENROUTER_CALLBACK_PATH}`);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

/** Guarda o verificador (sessionStorage: some ao fechar a aba) e devolve a URL do OpenRouter. */
export async function prepareOpenRouterConnect(params: { returnTo: string; model?: string; origin?: string }): Promise<string> {
  const { codeVerifier, codeChallenge } = await createPkcePair();
  const pending: PendingOpenRouterConnect = {
    codeVerifier,
    returnTo: params.returnTo.startsWith('/') ? params.returnTo : '/user/dashboard',
    ...(params.model ? { model: params.model } : {}),
    createdAt: Date.now(),
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  return openRouterAuthUrl(params.origin ?? window.location.origin, codeChallenge);
}

/** Lê e apaga o pedido pendente (uso único). `null` sem pedido, vencido ou ilegível. */
export function takePendingOpenRouterConnect(now = Date.now()): PendingOpenRouterConnect | null {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const pending = JSON.parse(raw) as PendingOpenRouterConnect;
    if (typeof pending.codeVerifier !== 'string' || typeof pending.returnTo !== 'string') return null;
    if (now - Number(pending.createdAt) > MAX_AGE_MS) return null;
    return pending;
  } catch {
    return null;
  }
}
