import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const fetchMock = vi.fn(async () => new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } }));

async function loadHttp(env: Record<string, string>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return import('./http');
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockClear();
});

describe('http: endereço da API', () => {
  it('sem base (produção), chama /api no próprio site e envia o cookie da sessão', async () => {
    const http = await loadHttp({ VITE_API_BASE_URL: '', VITE_PUBLIC_API_BASE_URL: 'https://api.exemplo.app/' });
    await http.requestApi('/api/protected/user/auth_user');
    expect(fetchMock).toHaveBeenCalledWith('/api/protected/user/auth_user', expect.objectContaining({ credentials: 'include' }));
  });

  it('as rotas públicas que contam por IP vão direto ao gateway, sem cookie', async () => {
    const http = await loadHttp({ VITE_API_BASE_URL: '', VITE_PUBLIC_API_BASE_URL: 'https://api.exemplo.app/' });
    await http.postPublicJson('/api/public/qrcode/feedback', { rating: 5 });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.exemplo.app/api/public/qrcode/feedback',
      expect.objectContaining({ method: 'POST', credentials: 'omit', body: JSON.stringify({ rating: 5 }) }),
    );
  });

  it('sem a base pública, as rotas públicas usam a mesma base (local)', async () => {
    const http = await loadHttp({ VITE_API_BASE_URL: 'http://localhost:3000', VITE_PUBLIC_API_BASE_URL: '' });
    await http.requestPublicApi('/api/public/auth/resend-confirmation');
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/public/auth/resend-confirmation', expect.anything());
  });
});

describe('vercel.json: repasse da API', () => {
  const config = JSON.parse(readFileSync(resolve(__dirname, '../../../vercel.json'), 'utf8')) as {
    rewrites: Array<{ source: string; destination: string; has?: unknown[] }>;
  };

  it('repassa /api ao gateway antes de cair no index.html do app', () => {
    const sources = config.rewrites.map((rule) => rule.source);
    expect(sources.indexOf('/api/(.*)')).toBeLessThan(sources.indexOf('/(.*)'));
    expect(config.rewrites.at(-1)).toEqual({ source: '/(.*)', destination: '/index.html' });
  });

  it('a Web de developer usa o gateway de developer; o resto, o de produção', () => {
    const api = config.rewrites.filter((rule) => rule.source === '/api/(.*)');
    expect(api[0].destination).toBe('https://feedback-analytics-api-developer.vercel.app/api/$1');
    expect(api[0].has).toEqual([{ type: 'host', value: 'feedback-analytics-web-developer.vercel.app' }]);
    expect(api[1]).toEqual({ source: '/api/(.*)', destination: 'https://feedback-analytics-api-gateway.vercel.app/api/$1' });
  });
});
