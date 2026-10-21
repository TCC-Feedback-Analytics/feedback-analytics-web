/**
 * "Entrar com Google" pelo Better Auth do gateway (via o repasse /api da Web):
 * o gateway devolve a URL do Google e o navegador vai para lá. Na volta, quem é
 * novo cai em "Complete seu cadastro" (telefone, nome do negócio e termos).
 * Só aparece com VITE_GOOGLE_AUTH_ENABLED=true (as credenciais ficam no gateway).
 */
import { requestApi } from './http';

export function isGoogleAuthEnabled(): boolean {
  return String(import.meta.env.VITE_GOOGLE_AUTH_ENABLED ?? '').trim() === 'true';
}

export const COMPLETE_SIGNUP_PATH = '/auth/complete-signup';

/** Pede ao gateway a URL de entrada do Google; `null` se não deu. */
export async function googleSignInUrl(origin: string): Promise<string | null> {
  const res = await requestApi('/api/auth/sign-in/social', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'google',
      callbackURL: `${origin}/user/dashboard`,
      newUserCallbackURL: `${origin}${COMPLETE_SIGNUP_PATH}`,
      errorCallbackURL: `${origin}/login?error=google`,
    }),
  });
  if (!res.ok) return null;
  const payload = (await res.json().catch(() => null)) as { url?: unknown } | null;
  return typeof payload?.url === 'string' && payload.url.startsWith('https://') ? payload.url : null;
}
