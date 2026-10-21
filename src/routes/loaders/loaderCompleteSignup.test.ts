import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ServiceGetUser } from 'src/services/serviceUser';
import { loadUserContextData } from 'src/routes/load/loadUserContext';
import { LoaderCompleteSignup } from './loaderCompleteSignup';
import { LoaderUserProtected } from './loaderUserProtected';

vi.unmock('react-router-dom');
vi.mock('src/services/serviceUser', () => ({ ServiceGetUser: vi.fn() }));
vi.mock('src/routes/load/loadUserContext', () => ({ loadUserContextData: vi.fn() }));

beforeEach(() => {
  vi.resetAllMocks();
});

async function redirectOf(promise: Promise<unknown>) {
  const thrown = await promise.then(() => null, (error: unknown) => error);
  return thrown instanceof Response ? thrown.headers.get('Location') : null;
}

const user = (phone: string | null) => ({
  user: { id: 'u1', email: 'maria@gmail.com', phone, user_metadata: { full_name: 'Maria Silva' } },
});

describe('LoaderCompleteSignup', () => {
  it('sem sessão volta ao login', async () => {
    vi.mocked(ServiceGetUser).mockRejectedValue({ status: 401 });
    expect(await redirectOf(LoaderCompleteSignup())).toBe('/login');
  });

  it('quem já tem telefone segue para o Dashboard', async () => {
    vi.mocked(ServiceGetUser).mockResolvedValue(user('+5511987654321'));
    expect(await redirectOf(LoaderCompleteSignup())).toBe('/user/dashboard');
  });

  it('sem telefone devolve e-mail e nome para a tela', async () => {
    vi.mocked(ServiceGetUser).mockResolvedValue(user(null));
    expect(await LoaderCompleteSignup()).toEqual({ email: 'maria@gmail.com', fullName: 'Maria Silva' });
  });
});

describe('LoaderUserProtected', () => {
  const args = {} as Parameters<typeof LoaderUserProtected>[0];

  it('sem telefone manda completar o cadastro', async () => {
    vi.mocked(loadUserContextData).mockResolvedValue(user(null) as never);
    expect(await redirectOf(LoaderUserProtected(args))).toBe('/auth/complete-signup');
  });

  it('com telefone devolve o contexto', async () => {
    const data = user('+5511987654321');
    vi.mocked(loadUserContextData).mockResolvedValue(data as never);
    expect(await LoaderUserProtected(args)).toBe(data);
  });
});
