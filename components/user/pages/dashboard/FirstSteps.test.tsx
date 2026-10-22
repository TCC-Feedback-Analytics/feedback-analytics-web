import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
import { saveFirstStepMarks } from 'src/lib/utils/firstSteps';

const enterprise = { id: 'ent-1', full_name: 'Padaria da Vovó' };
const formUrl = `${window.location.origin}/feedback/qrcode?enterprise=ent-1`;

function Harness({ qrActive, accountTotal, onFeedbackSent }: { qrActive: boolean | null; accountTotal: number; onFeedbackSent?: () => void }) {
  const steps = useFirstSteps({ enterpriseId: enterprise.id, qrActive, accountTotal });
  if (!steps.visible) return <p>Sem primeiros passos</p>;
  return <FirstSteps enterprise={enterprise} steps={steps} onFeedbackSent={onFeedbackSent} />;
}

// Router de dados: o "Ativar QR Code" usa a action da tela Feedback geral.
function renderSteps(qrActive: boolean | null = true, accountTotal = 0, onFeedbackSent?: () => void) {
  const router = createMemoryRouter([
    {
      path: '/user/dashboard',
      element: <Harness qrActive={qrActive} accountTotal={accountTotal} onFeedbackSent={onFeedbackSent} />,
    },
    { path: '/user/edit/feedback-general', action: qrAction, element: <p>Feedback geral</p> },
  ], { initialEntries: ['/user/dashboard'] });
  return render(<RouterProvider router={router} />);
}

const stepNamed = (title: string) => screen.getByRole('heading', { level: 3, name: new RegExp(title) }).closest('li') as HTMLElement;

describe('[Unidade] Primeiros passos do Dashboard', () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    localStorage.clear();
    Object.assign(navigator, { clipboard: { writeText } });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    cleanup();
  });

  it('vem destacado, com os quatro passos e o progresso', () => {
    renderSteps(true);
    const section = screen.getByRole('region', { name: 'Primeiros passos' });
    expect(within(section).getByText('Comece por aqui')).toBeInTheDocument();
    expect(within(section).getByText('1 de 4 concluídos')).toBeInTheDocument();
    const titles = within(section).getAllByRole('heading', { level: 3 }).map((node) => node.textContent);
    expect(titles).toEqual(['QR Code ativado (concluído)', 'Testar o formulário', 'Baixar o QR Code', 'Compartilhar o link']);
    expect(stepNamed('QR Code ativado')).toHaveAttribute('data-done', 'true');
  });

  it('com o QR desativado, o primeiro passo é ativá-lo e os outros avisam', () => {
    renderSteps(false);
    expect(screen.getByText('0 de 4 concluídos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ativar QR Code/ })).toBeInTheDocument();
    expect(screen.getAllByText('Ative o QR Code para os clientes conseguirem responder.')).toHaveLength(3);
    expect(screen.getByRole('button', { name: /Testar o formulário/ })).toBeDisabled();
  });

  it('ativa o QR ali mesmo, sem sair do Dashboard, e marca o passo', async () => {
    qrAction.mockResolvedValue({ ok: true, active: true });
    renderSteps(false);
    fireEvent.click(screen.getByRole('button', { name: /Ativar QR Code/ }));
    expect(await screen.findByText('QR Code ativado')).toBeInTheDocument();
    const form = await qrAction.mock.calls[0][0].request.formData();
    expect(form.get('intent')).toBe(INTENT_QR_ENABLE);
    expect(screen.queryByText('Feedback geral')).not.toBeInTheDocument();
    expect(screen.getByText('1 de 4 concluídos')).toBeInTheDocument();
    expect(screen.queryByText('Ative o QR Code para os clientes conseguirem responder.')).not.toBeInTheDocument();
  });

  it('mostra o erro no passo quando não consegue ativar', async () => {
    qrAction.mockResolvedValue({ error: 'Não foi possível ativar o QR.' });
    renderSteps(false);
    fireEvent.click(screen.getByRole('button', { name: /Ativar QR Code/ }));
    expect(await screen.findByText('Não foi possível ativar o QR.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ativar QR Code/ })).toBeEnabled();
  });

  it('sem conseguir consultar o QR, não sugere ativá-lo', () => {
    renderSteps(null);
    expect(screen.queryByText(/Ativar o QR Code|QR Code ativado/)).not.toBeInTheDocument();
    expect(screen.getByText('0 de 3 concluídos')).toBeInTheDocument();
  });

  it('copiar o link marca o compartilhar e fica lembrado', async () => {
    const view = renderSteps(true);
    fireEvent.click(screen.getByRole('button', { name: /Copiar link/ }));
    expect(writeText).toHaveBeenCalledWith(formUrl);
    expect(await screen.findByRole('button', { name: /Link copiado!/ })).toBeInTheDocument();
    expect(stepNamed('Compartilhar o link')).toHaveAttribute('data-done', 'true');
    expect(screen.getByText('2 de 4 concluídos')).toBeInTheDocument();

    view.unmount();
    renderSteps(true);
    expect(stepNamed('Compartilhar o link')).toHaveAttribute('data-done', 'true');
  });

  it('baixar o QR marca o passo', () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    renderSteps(true);
    fireEvent.click(screen.getByRole('button', { name: /Baixar QR Code/ }));
    expect(stepNamed('Baixar o QR Code')).toHaveAttribute('data-done', 'true');
  });

  it('testa o formulário numa janela, sem sair do Dashboard, e atualiza ao enviar', async () => {
    const onFeedbackSent = vi.fn();
    renderSteps(true, 0, onFeedbackSent);
    fireEvent.click(screen.getByRole('button', { name: /Testar o formulário/ }));

    const dialog = screen.getByRole('dialog');
    const frame = within(dialog).getByTitle('Formulário do cliente') as HTMLIFrameElement;
    expect(frame.src).toBe(`${formUrl}&embed=1`);
    expect(within(dialog).getByText(/Sua resposta conta como um feedback de verdade/)).toBeInTheDocument();

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
    expect(await screen.findByText('Pronto! Esse é o seu primeiro feedback.')).toBeInTheDocument();
    expect(onFeedbackSent).toHaveBeenCalledOnce();
    expect(stepNamed('Testar o formulário')).toHaveAttribute('data-done', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Voltar ao painel' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('com o primeiro feedback já recebido, o teste conta como feito', () => {
    renderSteps(true, 1);
    expect(stepNamed('Testar o formulário')).toHaveAttribute('data-done', 'true');
    expect(screen.getByRole('button', { name: /Testar de novo/ })).toBeInTheDocument();
  });

  it('concluir o último passo mostra "Tudo pronto" e o cartão sai sozinho, sem recarregar', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      saveFirstStepMarks(enterprise.id, { tested: true, downloaded: true, shared: false });
      renderSteps(true, 1);
      fireEvent.click(screen.getByRole('button', { name: /Copiar link/ }));
      expect(screen.getByRole('region', { name: 'Tudo pronto ✓' })).toBeInTheDocument();
      expect(screen.getByText('4 de 4 concluídos')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(4000);
      });
      expect(screen.queryByRole('region', { name: 'Tudo pronto ✓' })).not.toBeInTheDocument();
      expect(screen.getByText('Sem primeiros passos')).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('"Ver o painel" tira o cartão na hora', () => {
    saveFirstStepMarks(enterprise.id, { tested: true, downloaded: true, shared: false });
    renderSteps(true, 1);
    fireEvent.click(screen.getByRole('button', { name: /Copiar link/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Ver o painel' }));
    expect(screen.getByText('Sem primeiros passos')).toBeInTheDocument();
  });

  it('some quando tudo já estava pronto ou a conta já tem 10 feedbacks', () => {
    saveFirstStepMarks(enterprise.id, { tested: true, downloaded: true, shared: true });
    const view = renderSteps(true, 1);
    expect(screen.getByText('Sem primeiros passos')).toBeInTheDocument();
    view.unmount();

    localStorage.clear();
    renderSteps(true, 10);
    expect(screen.getByText('Sem primeiros passos')).toBeInTheDocument();
  });
});
