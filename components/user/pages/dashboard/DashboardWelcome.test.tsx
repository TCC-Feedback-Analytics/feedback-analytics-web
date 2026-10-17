import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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

import DashboardWelcome from './DashboardWelcome';
import { INTENT_QR_ENABLE } from 'src/lib/constants/routes/intents';

const enterprise = { id: 'ent-1', full_name: 'Padaria da Vovó' };

// Router de dados: o "Ativar QR Code" usa a action da tela Feedback geral.
function renderWelcome(qrActive: boolean | null = true, totalFeedbacks = 0) {
  const router = createMemoryRouter([
    {
      path: '/user/dashboard',
      element: <DashboardWelcome enterprise={enterprise} qrActive={qrActive} totalFeedbacks={totalFeedbacks} />,
    },
    { path: '/user/edit/feedback-general', action: qrAction, element: <p>Feedback geral</p> },
  ], { initialEntries: ['/user/dashboard'] });
  return render(<RouterProvider router={router} />);
}

describe('[Unidade] Boas-vindas do Dashboard', () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText } });
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('mostra a animação, o título e o progresso até a IA', () => {
    renderWelcome();
    const section = screen.getByRole('region', { name: 'Seu painel está pronto. Falta o primeiro feedback.' });
    expect(within(section).getByTestId('collect-beacon')).toBeInTheDocument();
    expect(within(section).getByText('Aguardando os primeiros feedbacks')).toBeInTheDocument();
    expect(within(section).getByText('0 de 10 feedbacks para a IA analisar os comentários')).toBeInTheDocument();
    expect(within(section).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('com o QR ativo, começa por baixar o QR Code', () => {
    renderWelcome(true);
    expect(screen.queryByText('Ativar o QR Code geral')).not.toBeInTheDocument();
    const steps = screen.getAllByRole('listitem');
    expect(steps).toHaveLength(3);
    expect(within(steps[0]).getByText('Baixar o QR Code')).toBeInTheDocument();
  });

  it('com o QR desativado, o primeiro passo é ativá-lo e os outros avisam', () => {
    renderWelcome(false);
    const steps = screen.getAllByRole('listitem');
    expect(steps).toHaveLength(4);
    expect(within(steps[0]).getByText('Ativar o QR Code geral')).toBeInTheDocument();
    expect(screen.getAllByText('Ative o QR Code para os clientes conseguirem responder.')).toHaveLength(3);
  });

  it('ativa o QR ali mesmo, sem sair do Dashboard, e mantém o passo como concluído', async () => {
    qrAction.mockResolvedValue({ ok: true, active: true });
    renderWelcome(false);
    fireEvent.click(screen.getByRole('button', { name: /Ativar QR Code/ }));
    expect(await screen.findByText('QR Code ativado')).toBeInTheDocument();
    expect(qrAction).toHaveBeenCalledOnce();
    const form = await qrAction.mock.calls[0][0].request.formData();
    expect(form.get('intent')).toBe(INTENT_QR_ENABLE);
    expect(screen.queryByText('Feedback geral')).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.queryByText('Ative o QR Code para os clientes conseguirem responder.')).not.toBeInTheDocument();
  });

  it('mostra o erro no passo quando não consegue ativar', async () => {
    qrAction.mockResolvedValue({ error: 'Não foi possível ativar o QR.' });
    renderWelcome(false);
    fireEvent.click(screen.getByRole('button', { name: /Ativar QR Code/ }));
    expect(await screen.findByText('Não foi possível ativar o QR.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ativar QR Code/ })).toBeEnabled();
  });

  it('sem conseguir consultar o QR, não sugere ativá-lo', () => {
    renderWelcome(null);
    expect(screen.queryByText('Ativar o QR Code geral')).not.toBeInTheDocument();
  });

  it('copia o link do formulário e avisa', async () => {
    renderWelcome();
    fireEvent.click(screen.getByRole('button', { name: /Copiar link/ }));
    expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/feedback/qrcode?enterprise=ent-1`);
    expect(await screen.findByRole('button', { name: /Link copiado!/ })).toBeInTheDocument();
  });

  it('abre o formulário do cliente em outra aba, avisando que a resposta conta', () => {
    renderWelcome();
    const link = screen.getByRole('link', { name: /Abrir formulário/ });
    expect(link).toHaveAttribute('href', `${window.location.origin}/feedback/qrcode?enterprise=ent-1`);
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByText('Se você enviar uma resposta, ela conta como um feedback real.')).toBeInTheDocument();
  });

  it('o progresso para em 10', async () => {
    renderWelcome(true, 14);
    await waitFor(() => expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '10'));
  });
});
