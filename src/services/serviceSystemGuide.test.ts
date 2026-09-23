import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ServiceGetSystemGuide, ServiceUpdateSystemGuide } from './serviceSystemGuide';

const mockFetch = vi.fn<typeof fetch>();

beforeEach(() => {
  mockFetch.mockReset().mockImplementation(async () => Response.json({
    tourKey: 'system-guide', version: 1, status: 'pending', finishedAt: null,
  }));
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => vi.unstubAllGlobals());

describe('Service guia do sistema — contrato HTTP com o Gateway', () => {
  it('consulta o estado pela sessão, sem identificadores no request', async () => {
    const signal = new AbortController().signal;
    await ServiceGetSystemGuide(signal);
    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/protected\/user\/onboarding\/system-guide$/);
    expect(init).toEqual({ credentials: 'include', signal, cache: 'no-store' });
  });

  it('persiste somente versão e ação do guia pela sessão', async () => {
    await ServiceUpdateSystemGuide({ version: 1, status: 'completed' });
    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/protected\/user\/onboarding\/system-guide$/);
    expect(init).toEqual({
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: 1, status: 'completed' }),
    });
  });
});
