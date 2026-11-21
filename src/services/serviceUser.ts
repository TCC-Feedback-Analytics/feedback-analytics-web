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
  /** E-mail pedido: vale depois da aprovação no endereço atual e da confirmação no novo. */
  pending_email: string;
};
type OkResponse = { ok: boolean };

/** `deletion_scheduled_for`: data (ISO) em que a conta será apagada, ou null se ela está ativa. */
export type AuthUserWithDeletion = AuthUser & { deletion_scheduled_for?: string | null };

export function ServiceGetUser() {
  return getJson<AuthUserWithDeletion>('/api/protected/user/auth_user');
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

/** Primeira entrada com Google: nome do negócio, telefone e aceite dos termos. */
export function ServiceCompleteSignup(payload: { fullName: string; phone: string; terms: true }) {
  return postJson<OkResponse>('/api/protected/user/complete-signup', payload);
}

/** Pedido de "Excluir minha conta" no Perfil, já traduzido dos códigos do gateway. */
export type DeletionRequestOutcome =
  | 'email_sent'
  | 'wrong_password'
  | 'password_required'
  | 'login_again'
  | 'rate_limited'
  | 'failed';

/** Link do e-mail aberto na página /conta/excluir. */
export type DeletionConfirmResult =
  | { outcome: 'scheduled'; scheduledFor: string }
  | { outcome: 'invalid_link' | 'not_logged_in' | 'failed' };

const DELETION_REQUEST_ERRORS: Record<string, DeletionRequestOutcome> = {
  invalid_password: 'wrong_password',
  password_required: 'password_required',
  login_again: 'login_again',
  rate_limited: 'rate_limited',
};

async function readApiError(res: Response): Promise<string | undefined> {
  const payload = (await res.json().catch(() => null)) as { error?: unknown } | null;
  return typeof payload?.error === 'string' ? payload.error : undefined;
}

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

/**
 * "Excluir minha conta", passo 1 (LGPD art. 18): confere a senha e manda o link de
 * confirmação ao e-mail da conta. Nada é apagado ainda.
 */
export async function ServiceRequestAccountDeletion(password?: string): Promise<DeletionRequestOutcome> {
  const res = await requestApi('/api/protected/user/account-deletion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(password ? { password } : {}),
  }).catch(() => null);
  if (!res) return 'failed';
  if (res.ok) return 'email_sent';
  return DELETION_REQUEST_ERRORS[(await readApiError(res)) ?? ''] ?? 'failed';
}

/** Passo 2: o link do e-mail. A conta fica parada por 15 dias e todas as sessões caem. */
export async function ServiceConfirmAccountDeletion(token: string): Promise<DeletionConfirmResult> {
  const res = await requestApi('/api/protected/user/account-deletion/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  }).catch(() => null);
  if (!res) return { outcome: 'failed' };
  if (res.ok) {
    const payload = (await res.json().catch(() => null)) as { deletion_scheduled_for?: unknown } | null;
    const scheduledFor = payload?.deletion_scheduled_for;
    return typeof scheduledFor === 'string' ? { outcome: 'scheduled', scheduledFor } : { outcome: 'failed' };
  }
  if (res.status === 401) return { outcome: 'not_logged_in' };
  const error = await readApiError(res);
  return { outcome: error === 'invalid_deletion_link' || error === 'deletion_already_scheduled' ? 'invalid_link' : 'failed' };
}

/** Desistência, dentro dos 15 dias, depois de entrar de novo. */
export async function ServiceCancelAccountDeletion(): Promise<boolean> {
  const res = await requestApi('/api/protected/user/account-deletion/cancel', { method: 'POST' }).catch(() => null);
  return Boolean(res?.ok);
}
