import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';

const { toast, qrAction } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
  qrAction: vi.fn(),
}));

// O setup global troca o react-router-dom por um mock mínimo; aqui usamos o real.
vi.mock('react-router-dom', async () => vi.importActual<typeof import('react-router-dom')>('react-router-dom'));

vi.mock('components/public/forms/messages/useToast', () => ({
  useToast: () => toast,
}));

import FirstSteps from './FirstSteps';
import { useFirstSteps } from 'src/lib/hooks/useFirstSteps';
import { INTENT_QR_ENABLE } from 'src/lib/constants/routes/intents';
import { EMBEDDED_FORM_MESSAGE } from 'src/lib/utils/embeddedForm';

const enterprise = { id: 'ent-1', full_name: 'Padaria da Vovó' };
// O "Testar o formulário" vai marcado como teste, fora das métricas.
const testUrl = `${window.location.origin}/feedback/qrcode?enterprise=ent-1&canal=teste`;

function Harness({ qrActive, onFeedbackSent }: { qrActive: boolean | null; onFeedbackSent?: () => void }) {
  const steps = useFirstSteps({ enterpriseId: enterprise.id, qrActive });
  if (!steps.visible) return <p>Sem primeiros passos</p>;
  return <FirstSteps enterprise={enterprise} steps={steps} onFeedbackSent={onFeedbackSent} />;
}

// Router de dados: o "Ativar QR Code" usa a action da tela Avaliação da empresa.
function renderSteps(qrActive: boolean | null = false, onFeedbackSent?: () => void) {
  const router = createMemoryRouter([
    { path: '/user/dashboard', element: <Harness qrActive={qrActive} onFeedbackSent={onFeedbackSent} /> },
    { path: '/user/edit/feedback-general', action: qrAction, element: <p>Avaliação da empresa</p> },
  ], { initialEntries: ['/user/dashboard'] });
  return render(<RouterProvider router={router} />);
}

const stepNamed = (title: string) => screen.getByRole('heading', { level: 3, name: new RegExp(title) }).closest('li') as HTMLElement;

async function activateQr() {
  qrAction.mockResolvedValue({ ok: true, active: true });
  fireEvent.click(screen.getByRole('button', { name: /Ativar QR Code/ }));
  expect(await screen.findByText('QR Code ativado')).toBeInTheDocument();
}

describe('[Unidade] Primeiros passos do Dashboard', () => {
  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('com o QR geral desativado, pede só para ativá-lo e oferece o teste como opcional', () => {
    renderSteps(false);
    const section = screen.getByRole('region', { name: 'Primeiros passos' });
    expect(within(section).getByText('Comece por aqui')).toBeInTheDocument();
    const titles = within(section).getAllByRole('heading', { level: 3 }).map((node) => node.textContent);
    expect(titles).toEqual(['Ativar o QR Code da empresa', 'Testar o formulário (opcional)']);
    // Baixar o QR e compartilhar o link não são mais passos.
    expect(screen.queryByRole('button', { name: /Baixar QR Code|Copiar link/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Testar o formulário/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Pular' })).toBeDisabled();
  });

  it('com o QR já ativo, não aparece, em qualquer aparelho', () => {
    renderSteps(true);
    expect(screen.getByText('Sem primeiros passos')).toBeInTheDocument();
  });

  it('sem conseguir consultar o QR, não aparece', () => {
    renderSteps(null);
    expect(screen.getByText('Sem primeiros passos')).toBeInTheDocument();
  });

  it('ativa o QR ali mesmo, sem sair do Dashboard, e libera o teste', async () => {
    renderSteps(false);
    await activateQr();
    const form = await qrAction.mock.calls[0][0].request.formData();
    expect(form.get('intent')).toBe(INTENT_QR_ENABLE);
    expect(screen.queryByText('Avaliação da empresa')).not.toBeInTheDocument();
    expect(stepNamed('QR Code ativado')).toHaveAttribute('data-done', 'true');
    expect(screen.getByRole('button', { name: /Testar o formulário/ })).toBeEnabled();
    // O teste ainda está em aberto: o cartão fica.
    expect(screen.getByRole('region', { name: 'Primeiros passos' })).toBeInTheDocument();
  });

  it('mostra o erro no passo quando não consegue ativar', async () => {
    qrAction.mockResolvedValue({ error: 'Não foi possível ativar o QR.' });
    renderSteps(false);
    fireEvent.click(screen.getByRole('button', { name: /Ativar QR Code/ }));
    expect(await screen.findByText('Não foi possível ativar o QR.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ativar QR Code/ })).toBeEnabled();
  });

  it('pular o teste conclui o passo, mostra "Tudo pronto" e o cartão sai sozinho', async () => {
    renderSteps(false);
    await activateQr();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      fireEvent.click(screen.getByRole('button', { name: 'Pular' }));
      expect(stepNamed('Teste pulado')).toHaveAttribute('data-done', 'true');
      expect(screen.getByRole('region', { name: 'Tudo pronto ✓' })).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(4000);
      });
      expect(screen.getByText('Sem primeiros passos')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('testa o formulário numa janela, marcado como teste, e conclui o passo', async () => {
    const onFeedbackSent = vi.fn();
    renderSteps(false, onFeedbackSent);
    await activateQr();
    fireEvent.click(screen.getByRole('button', { name: /Testar o formulário/ }));

    const dialog = screen.getByRole('dialog');
    const frame = within(dialog).getByTitle('Formulário do cliente') as HTMLIFrameElement;
    expect(frame.src).toBe(`${testUrl}&embed=1`);
    expect(within(dialog).getByText(/fica marcada como teste e não entra nas métricas/)).toBeInTheDocument();

    // Mensagem de outra origem é ignorada.
    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: { type: EMBEDDED_FORM_MESSAGE, result: 'sent' },
        origin: 'https://outro-site.com',
        source: frame.contentWindow,
      }));
    });
    expect(onFeedbackSent).not.toHaveBeenCalled();

    act(() => {
      window.dispatchEvent(new MessageEvent('message', {
        data: { type: EMBEDDED_FORM_MESSAGE, result: 'sent' },
        origin: window.location.origin,
        source: frame.contentWindow,
      }));
    });
    expect(await screen.findByText('Pronto! Seu teste chegou.')).toBeInTheDocument();
    expect(onFeedbackSent).toHaveBeenCalledOnce();
    expect(stepNamed('Formulário testado')).toHaveAttribute('data-done', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Voltar ao painel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Tudo pronto ✓' })).toBeInTheDocument();
  });

  it('"Ver o painel" tira o cartão na hora', async () => {
    renderSteps(false);
    await activateQr();
    fireEvent.click(screen.getByRole('button', { name: 'Pular' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ver o painel' }));
    expect(screen.getByText('Sem primeiros passos')).toBeInTheDocument();
  });
});
