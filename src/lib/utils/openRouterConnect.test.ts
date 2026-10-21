import { afterEach, describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import {
  OPENROUTER_CALLBACK_PATH,
  createPkcePair,
  prepareOpenRouterConnect,
  takePendingOpenRouterConnect,
} from './openRouterConnect';
import { saveOnboardingDraft, takeOnboardingDraft } from './onboardingDraft';

const base64Url = (buffer: Buffer) => buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

afterEach(() => sessionStorage.clear());

describe('Conectar com OpenRouter (PKCE)', () => {
  it('verificador no formato do PKCE e desafio = SHA-256 em base64url', async () => {
    const { codeVerifier, codeChallenge } = await createPkcePair();
    expect(codeVerifier).toMatch(/^[A-Za-z0-9_-]{64}$/);
    expect(codeChallenge).toBe(base64Url(createHash('sha256').update(codeVerifier).digest()));
  });

  it('monta a URL do OpenRouter com o retorno e guarda o pedido uma vez só', async () => {
    const url = new URL(await prepareOpenRouterConnect({ returnTo: '/user/dashboard', model: 'vendor/model', origin: 'https://app.exemplo' }));
    expect(url.origin + url.pathname).toBe('https://openrouter.ai/auth');
    expect(url.searchParams.get('callback_url')).toBe(`https://app.exemplo${OPENROUTER_CALLBACK_PATH}`);
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');

    const pending = takePendingOpenRouterConnect();
    expect(pending).toMatchObject({ returnTo: '/user/dashboard', model: 'vendor/model' });
    expect(base64Url(createHash('sha256').update(pending!.codeVerifier).digest())).toBe(url.searchParams.get('code_challenge'));
    expect(takePendingOpenRouterConnect()).toBeNull();
  });

  it('pedido vencido ou com retorno para fora do site não vale', async () => {
    await prepareOpenRouterConnect({ returnTo: 'https://outro.site', origin: 'https://app.exemplo' });
    expect(takePendingOpenRouterConnect(Date.now() + 16 * 60_000)).toBeNull();
    await prepareOpenRouterConnect({ returnTo: 'https://outro.site', origin: 'https://app.exemplo' });
    expect(takePendingOpenRouterConnect()?.returnTo).toBe('/user/dashboard');
  });
});

describe('rascunho da configuração inicial', () => {
  const values = { business_summary: 'Padaria', company_objective: 'Crescer', analytics_goal: 'Entender' };

  it('volta para o mesmo usuário, uma vez só', () => {
    saveOnboardingDraft('user-1', values);
    expect(takeOnboardingDraft('user-1')).toEqual(values);
    expect(takeOnboardingDraft('user-1')).toBeNull();
  });

  it('não vale para outro usuário nem depois de 30 minutos', () => {
    saveOnboardingDraft('user-1', values);
    expect(takeOnboardingDraft('user-2')).toBeNull();
    saveOnboardingDraft('user-1', values);
    expect(takeOnboardingDraft('user-1', Date.now() + 31 * 60_000)).toBeNull();
  });
});
