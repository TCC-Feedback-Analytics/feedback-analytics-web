import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requestApi } from 'src/lib/utils/http';
import { ServiceResendConfirmation } from './serviceAuth';

vi.mock('src/lib/utils/http', () => ({
  requestApi: vi.fn(),
}));

const mockedRequestApi = vi.mocked(requestApi);

function jsonResponse(
  status: number,
  body: unknown,
  headers?: HeadersInit,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

describe('ServiceResendConfirmation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('propaga o tempo de espera do corpo em uma solicitação aceita', async () => {
    mockedRequestApi.mockResolvedValue(
      jsonResponse(200, {
        ok: true,
        message: 'Solicitação recebida.',
        retryAfterSeconds: 75,
      }),
    );

    await expect(ServiceResendConfirmation('pessoa@empresa.com')).resolves.toEqual({
      ok: true,
      status: 200,
      message: 'Solicitação recebida.',
      retryAfterSeconds: 75,
    });
  });

  it('usa Retry-After como alternativa quando o corpo não traz o tempo', async () => {
    mockedRequestApi.mockResolvedValue(
      jsonResponse(
        429,
        { error: 'rate_limited', message: 'Aguarde antes de tentar novamente.' },
        { 'Retry-After': '125' },
      ),
    );

    await expect(ServiceResendConfirmation('pessoa@empresa.com')).resolves.toMatchObject({
      ok: false,
      status: 429,
      error: 'rate_limited',
      retryAfterSeconds: 125,
    });
  });

  it('não cria tempo de espera para 503 sem valor válido', async () => {
    mockedRequestApi.mockResolvedValue(
      jsonResponse(503, {
        error: 'service_unavailable',
        message: 'Tente novamente mais tarde.',
        retryAfterSeconds: 0,
      }),
    );

    await expect(ServiceResendConfirmation('pessoa@empresa.com')).resolves.toMatchObject({
      ok: false,
      status: 503,
      error: 'service_unavailable',
      retryAfterSeconds: undefined,
    });
  });

  it('distingue falha de rede de respostas HTTP', async () => {
    mockedRequestApi.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(ServiceResendConfirmation('pessoa@empresa.com')).resolves.toMatchObject({
      ok: false,
      status: 0,
      error: 'network_error',
    });
  });
});
