import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { googleSignInUrl } from 'src/lib/utils/googleAuth';

const mocks = vi.hoisted(() => ({ search: '' }));

vi.mock('react-router-dom', () => ({ useSearchParams: () => [new URLSearchParams(mocks.search)] }));
vi.mock('src/lib/utils/googleAuth', async (importOriginal) => ({
  ...(await importOriginal<typeof import('src/lib/utils/googleAuth')>()),
  googleSignInUrl: vi.fn(),
}));

import GoogleSignInButton from './GoogleSignInButton';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  mocks.search = '';
  cleanup();
});

describe('GoogleSignInButton', () => {
  it('some sem o Google ligado', () => {
    vi.stubEnv('VITE_GOOGLE_AUTH_ENABLED', 'false');
    render(<GoogleSignInButton />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('ligado, mostra o botão com o texto pedido', () => {
    vi.stubEnv('VITE_GOOGLE_AUTH_ENABLED', 'true');
    render(<GoogleSignInButton label="Criar conta com Google" />);
    expect(screen.getByRole('button', { name: 'Criar conta com Google' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('volta do Google com erro mostra o aviso', () => {
    vi.stubEnv('VITE_GOOGLE_AUTH_ENABLED', 'true');
    mocks.search = 'error=google';
    render(<GoogleSignInButton />);
    expect(screen.getByRole('alert')).toHaveTextContent('Não deu para entrar com o Google');
  });

  it('sem URL do gateway mostra o aviso e libera o botão', async () => {
    vi.stubEnv('VITE_GOOGLE_AUTH_ENABLED', 'true');
    vi.mocked(googleSignInUrl).mockResolvedValue(null);
    render(<GoogleSignInButton />);
    fireEvent.click(screen.getByRole('button', { name: 'Continuar com Google' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Não deu para entrar com o Google');
    await waitFor(() => expect(screen.getByRole('button')).not.toBeDisabled());
  });
});
