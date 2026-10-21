/**
 * Centraliza Fetch Json com credentials inclusas para todos os endpoints
 * Helpers finos ed HTTP, sem lógica de domínio
 */

type HttpError = Error & {
  status?: number;
  code?: string;
};

function normalizeBaseUrl(rawValue: string): string {
  return String(rawValue ?? '').trim().replace(/\/+$/, '');
}

/**
 * Vazio em produção: a Web chama `/api/*` no próprio domínio e a Vercel repassa
 * ao gateway (vercel.json). Assim o cookie de sessão é do site, e não de outro
 * domínio — Safari e Samsung Internet bloqueiam cookie de outro site e o login
 * não se mantinha. Localmente aponta para o gateway (`http://localhost:3000`).
 */
const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL ?? '');

/**
 * Rotas públicas sem sessão que contam por IP (formulário do cliente, reenvio
 * da confirmação) vão direto ao gateway: atrás do repasse da Vercel, todos os
 * pedidos poderiam chegar com o mesmo IP. Sem a variável, usa a base acima.
 */
const PUBLIC_API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_PUBLIC_API_BASE_URL ?? '') || API_BASE_URL;

function resolveApiUrl(path: string, baseUrl = API_BASE_URL): string {
  const value = String(path ?? '').trim();

  if (!value) {
    return baseUrl || '/';
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const normalizedPath = value.startsWith('/') ? value : `/${value}`;

  return baseUrl
    ? `${baseUrl}${normalizedPath}`
    : normalizedPath;
}

// Requisição base para manter um único ponto de resolução de URL + credentials
export async function requestApi(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(resolveApiUrl(path), {
    credentials: 'include',
    ...(init ?? {}),
  });
}

/** Para as rotas públicas sem sessão que contam por IP (ver PUBLIC_API_BASE_URL). */
export async function requestPublicApi(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(resolveApiUrl(path, PUBLIC_API_BASE_URL), {
    credentials: 'omit',
    ...(init ?? {}),
  });
}

async function throwIfNotOk(res: Response): Promise<void> {
  if (res.ok) return;

  let message = 'Request failed';
  let code: string | undefined;

  try {
    const payload = (await res.clone().json()) as {
      error?: string;
      message?: string;
    };

    if (typeof payload?.error === 'string' && payload.error.length > 0) {
      code = payload.error;
      message = payload.error;
    } else if (
      typeof payload?.message === 'string' &&
      payload.message.length > 0
    ) {
      message = payload.message;
    }
  } catch {
    // resposta sem JSON, mantém a mensagem padrão
  }

  const error = new Error(message) as HttpError;
  error.status = res.status;
  error.code = code;
  throw error;
}

export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await requestApi(path, init);

  await throwIfNotOk(res);

  return res.json() as Promise<T>;
}

export async function postJson<T>(
  path: string,
  body: unknown,
  init?: RequestInit,
): Promise<T> {
  const res = await requestApi(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
    ...(init ?? {}),
  });

  await throwIfNotOk(res);

  return res.json() as Promise<T>;
}

/** POST para as rotas públicas que contam por IP, direto no gateway (ver requestPublicApi). */
export async function postPublicJson<T>(path: string, body: unknown): Promise<T> {
  const res = await requestPublicApi(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  await throwIfNotOk(res);

  return res.json() as Promise<T>;
}

export async function patchJson<T>(
  path: string,
  body: unknown,
  init?: RequestInit,
): Promise<T> {
  const res = await requestApi(path, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
    ...(init ?? {}),
  });

  await throwIfNotOk(res);

  return res.json() as Promise<T>;
}

export async function putJson<T>(
  path: string,
  body: unknown,
  init?: RequestInit,
): Promise<T> {
  const res = await requestApi(path, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(body),
    ...(init ?? {}),
  });

  await throwIfNotOk(res);

  return res.json() as Promise<T>;
}

export async function deleteJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await requestApi(path, {
    method: 'DELETE',
    credentials: 'include',
    ...(init ?? {}),
  });

  await throwIfNotOk(res);

  return res.json() as Promise<T>;
}
