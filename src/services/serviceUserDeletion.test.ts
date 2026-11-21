import { beforeEach, describe, expect, it, vi } from 'vitest';

const { requestApi } = vi.hoisted(() => ({ requestApi: vi.fn() }));
vi.mock('src/lib/utils/http', () => ({ requestApi, getJson: vi.fn(), postJson: vi.fn() }));

import {
  ServiceCancelAccountDeletion,
  ServiceConfirmAccountDeletion,
  ServiceRequestAccountDeletion,
} from './serviceUser';

const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });

beforeEach(() => {
  vi.resetAllMocks();
});

describe('Excluir minha conta: chamadas ao gateway', () => {
  it('o pedido manda a senha e traduz os códigos do gateway', async () => {
    requestApi.mockResolvedValueOnce(reply(202, { status: 'email_sent' }));
    await expect(ServiceRequestAccountDeletion('segredo')).resolves.toBe('email_sent');
    const [path, init] = requestApi.mock.calls[0]!;
    expect(path).toBe('/api/protected/user/account-deletion');
    expect(JSON.parse(String((init as RequestInit).body))).toEqual({ password: 'segredo' });

    requestApi.mockResolvedValueOnce(reply(400, { error: 'invalid_password' }));
    await expect(ServiceRequestAccountDeletion('errada')).resolves.toBe('wrong_password');
    requestApi.mockResolvedValueOnce(reply(403, { error: 'login_again' }));
    await expect(ServiceRequestAccountDeletion()).resolves.toBe('login_again');
    requestApi.mockResolvedValueOnce(reply(429, { error: 'rate_limited' }));
    await expect(ServiceRequestAccountDeletion('x')).resolves.toBe('rate_limited');
    requestApi.mockRejectedValueOnce(new Error('rede'));
    await expect(ServiceRequestAccountDeletion('x')).resolves.toBe('failed');
  });

  it('a confirmação devolve a data, e separa link ruim de sessão ausente', async () => {
    requestApi.mockResolvedValueOnce(reply(200, { deletion_scheduled_for: '2026-12-06T12:00:00.000Z' }));
    await expect(ServiceConfirmAccountDeletion('tok')).resolves.toEqual({
      outcome: 'scheduled',
      scheduledFor: '2026-12-06T12:00:00.000Z',
    });

    requestApi.mockResolvedValueOnce(reply(400, { error: 'invalid_deletion_link' }));
    await expect(ServiceConfirmAccountDeletion('tok')).resolves.toEqual({ outcome: 'invalid_link' });
    requestApi.mockResolvedValueOnce(reply(401, { error: 'unauthorized' }));
    await expect(ServiceConfirmAccountDeletion('tok')).resolves.toEqual({ outcome: 'not_logged_in' });
  });

  it('a desistência diz se deu certo', async () => {
    requestApi.mockResolvedValueOnce(reply(200, { ok: true }));
    await expect(ServiceCancelAccountDeletion()).resolves.toBe(true);
    requestApi.mockResolvedValueOnce(reply(409, { error: 'no_deletion_scheduled' }));
    await expect(ServiceCancelAccountDeletion()).resolves.toBe(false);
  });
});
