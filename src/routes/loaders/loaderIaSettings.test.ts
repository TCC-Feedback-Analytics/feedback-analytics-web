import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ServiceGetIaConfig } from 'src/services/serviceIaConfig';
import { LoaderIaSettings } from './loaderIaSettings';

vi.mock('src/services/serviceIaConfig', () => ({ ServiceGetIaConfig: vi.fn() }));
beforeEach(() => { vi.mocked(ServiceGetIaConfig).mockReset(); });

describe('Loader IA — estado conhecido versus falha de leitura', () => {
  it('retorna a configuração do servidor', async () => {
    const iaConfig = { hasKey: true, provider: 'openrouter', model: 'vendor/model', keyHint: '1234' };
    vi.mocked(ServiceGetIaConfig).mockResolvedValue(iaConfig);
    expect(await LoaderIaSettings()).toEqual({ iaConfig });
  });

  it('falha de leitura não simula ausência de chave e não expõe detalhes do erro', async () => {
    vi.mocked(ServiceGetIaConfig).mockRejectedValue(new Error('sensitive-details'));
    const result = await LoaderIaSettings();
    expect(result.iaConfig).toBeNull();
    expect(result.error).toContain('Não foi possível carregar');
    expect(result.error).not.toContain('sensitive');
  });

  it('informa quando a sessão expirou', async () => {
    vi.mocked(ServiceGetIaConfig).mockRejectedValue({ status: 401 });
    expect((await LoaderIaSettings()).error).toContain('Sua sessão expirou');
  });
});
