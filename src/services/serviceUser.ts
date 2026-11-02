import type { AuthUser } from 'lib/interfaces/entities/auth-user.entity';
import { getJson, postJson, requestApi } from 'src/lib/utils/http';

type MetadadosResponse = {
  user: {
    id: string;
    email: string | null;
    user_metadata: Record<string, unknown>;
  } | null;
};
type EmailUpdateResponse = {
  user: { id: string; email: string | null } | null;
};
type OkResponse = { ok: boolean };

export function ServiceGetUser() {
  return getJson<AuthUser>('/api/protected/user/auth_user');
}

export function ServiceUpdateMetadados(full_name: string) {
  return getJson<MetadadosResponse>('/api/protected/user/metadados', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name }),
  });
}

export function ServiceUpdateEmail(email: string) {
  return getJson<EmailUpdateResponse>('/api/protected/user/email', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export function ServiceStartPhoneVerification(phone: string) {
  return getJson<OkResponse>('/api/protected/user/phone/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
}

export function ServiceVerifyPhone(token: string) {
  return getJson<OkResponse>('/api/protected/user/phone/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
}

/** Primeira entrada com Google: nome do negócio, telefone e aceite dos termos. */
export function ServiceCompleteSignup(payload: { fullName: string; phone: string; terms: true }) {
  return postJson<OkResponse>('/api/protected/user/complete-signup', payload);
}

/** Resultado de "Excluir minha conta", já traduzido dos códigos do Better Auth. */
export type DeleteAccountOutcome = 'deleted' | 'wrong_password' | 'login_again' | 'failed';

/**
 * A conta tem senha? Quem só entra pelo Google não tem, e a exclusão não pede
 * senha (o Better Auth exige então uma entrada recente). `null` se não deu para saber.
 */
export async function ServiceAccountHasPassword(): Promise<boolean | null> {
  const res = await requestApi('/api/auth/list-accounts').catch(() => null);
  if (!res?.ok) return null;
  const accounts: unknown = await res.json().catch(() => null);
  if (!Array.isArray(accounts)) return null;
  return accounts.some((account) => (account as { providerId?: unknown })?.providerId === 'credential');
}

/** Apaga a conta, a empresa e tudo dela (etapa 07, LGPD art. 18). Sem volta. */
export async function ServiceDeleteAccount(password?: string): Promise<DeleteAccountOutcome> {
  const res = await requestApi('/api/auth/delete-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(password ? { password } : {}),
  }).catch(() => null);
  if (!res) return 'failed';
  if (res.ok) return 'deleted';
  const payload = (await res.json().catch(() => null)) as { code?: unknown } | null;
  if (payload?.code === 'INVALID_PASSWORD') return 'wrong_password';
  if (payload?.code === 'SESSION_EXPIRED') return 'login_again';
  return 'failed';
}
