import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ServiceGetIaModels, ServiceUpdateIaModel, ServiceUpdateIaConfig, ServiceDeleteIaConfig } from './serviceIaConfig';

const mockFetch = vi.fn<typeof fetch>();
beforeEach(() => {
  mockFetch.mockReset().mockImplementation(async () => Response.json({ ok: true }));
  vi.stubGlobal('fetch', mockFetch);
});
afterEach(() => { vi.unstubAllGlobals(); });

describe('Service IA — contrato HTTP com o Gateway', () => {
  it('catálogo GET usa sessão, permite abort e não envia chave/Authorization/body', async () => {
    const signal = new AbortController().signal;
    await ServiceGetIaModels(signal);
    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/protected\/user\/ia-models$/);
    expect(init).toEqual({ credentials: 'include', signal, cache: 'no-store' });
    expect(String(url)).not.toContain('openrouter.ai');
  });

  it('PATCH envia exatamente {model}, com cookie de sessão e JSON', async () => {
    await ServiceUpdateIaModel('vendor/model');
    const [url, init] = mockFetch.mock.calls[0];
    expect(String(url)).toMatch(/\/api\/protected\/user\/ia-config\/model$/);
    expect(init).toEqual({
      method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'vendor/model' }),
    });
  });

  it('cadastro inicial continua usando PUT e só ele envia token', async () => {
    const payload = { provider: 'openrouter', model: 'vendor/model', apiKey: 'test-key' };
    await ServiceUpdateIaConfig(payload);
    expect(mockFetch.mock.calls[0][1]).toMatchObject({ method: 'PUT', credentials: 'include', body: JSON.stringify(payload) });
    await ServiceDeleteIaConfig();
    expect(mockFetch.mock.calls[1][1]).toEqual({ method: 'DELETE', credentials: 'include' });
  });

  it('preserva status e código do Gateway para tratamento na interface', async () => {
    mockFetch.mockResolvedValueOnce(Response.json({ error: 'ia_model_unavailable' }, { status: 400 }));
    await expect(ServiceUpdateIaModel('retired/model')).rejects.toMatchObject({ code: 'ia_model_unavailable', status: 400 });
  });
});
