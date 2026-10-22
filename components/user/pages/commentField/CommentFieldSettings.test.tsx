import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import { ServiceGetCommentField, ServiceSaveCommentField } from 'src/services/serviceCommentField';
import CommentFieldSettings from './CommentFieldSettings';

const { toast } = vi.hoisted(() => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('src/services/serviceCommentField', () => ({
  ServiceGetCommentField: vi.fn(),
  ServiceSaveCommentField: vi.fn(),
}));
vi.mock('components/public/forms/messages/useToast', () => ({ useToast: () => toast }));

const target = { scopeType: 'PRODUCT' as const, catalogItemId: 'item-1' };

function renderCard() {
  return render(<CommentFieldSettings {...target} ofTarget="deste produto" />);
}

describe('Campo de comentário (configuração do formulário)', () => {
  beforeEach(() => {
    vi.mocked(ServiceGetCommentField).mockResolvedValue({ mode: 'DEFAULT', prompt: null });
    vi.mocked(ServiceSaveCommentField).mockImplementation(async (_target, settings) => settings);
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('carrega o campo do escopo e mostra como o cliente vê', async () => {
    renderCard();
    expect(await screen.findByRole('radio', { name: /Convite padrão/ })).toHaveAttribute('aria-checked', 'true');
    expect(ServiceGetCommentField).toHaveBeenCalledWith(target);
    expect(screen.getByText(/"Conte-nos mais sobre sua experiência" \(opcional\)/, { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Salvar campo de comentário/ })).toBeDisabled();
  });

  it('pergunta própria: valida o tamanho, aceita sugestão e salva', async () => {
    renderCard();
    fireEvent.click(await screen.findByRole('radio', { name: /Pergunta própria/ }));
    const input = screen.getByLabelText('Pergunta para o cliente');
    fireEvent.change(input, { target: { value: 'Oi?' } });
    expect(screen.getByText('De 10 a 150 caracteres')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Salvar campo de comentário/ })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'O que você mudaria aqui?' }));
    expect(input).toHaveValue('O que você mudaria aqui?');
    expect(screen.getByText(/"O que você mudaria aqui\?" \(opcional\)/, { selector: 'span' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Salvar campo de comentário/ }));
    await waitFor(() => expect(ServiceSaveCommentField).toHaveBeenCalledWith(target, { mode: 'CUSTOM', prompt: 'O que você mudaria aqui?' }));
    expect(toast.success).toHaveBeenCalledWith('Campo de comentário salvo!', 'Já vale para os próximos clientes.');
  });

  it('ocultar avisa o que muda para a IA', async () => {
    renderCard();
    fireEvent.click(await screen.findByRole('radio', { name: /Ocultar o campo/ }));
    expect(screen.getByRole('note')).toHaveTextContent('a "Análise dos comentários" fica vazia aqui');
    expect(screen.getByText('sem campo de comentário')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Salvar campo de comentário/ }));
    await waitFor(() => expect(ServiceSaveCommentField).toHaveBeenCalledWith(target, { mode: 'HIDDEN', prompt: null }));
  });

  it('falha ao salvar avisa e mantém a escolha', async () => {
    vi.mocked(ServiceSaveCommentField).mockRejectedValueOnce(new Error('boom'));
    renderCard();
    fireEvent.click(await screen.findByRole('radio', { name: /Ocultar o campo/ }));
    fireEvent.click(screen.getByRole('button', { name: /Salvar campo de comentário/ }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(screen.getByRole('radio', { name: /Ocultar o campo/ })).toHaveAttribute('aria-checked', 'true');
  });

  it('sem conseguir carregar, explica', async () => {
    vi.mocked(ServiceGetCommentField).mockRejectedValueOnce(new Error('boom'));
    renderCard();
    expect(await screen.findByRole('alert')).toHaveTextContent('Não deu para carregar o campo de comentário');
  });
});
