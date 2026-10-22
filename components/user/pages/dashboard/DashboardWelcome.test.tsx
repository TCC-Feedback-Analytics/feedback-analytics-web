import { describe, it, expect, afterEach, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import DashboardWelcome from './DashboardWelcome';

describe('[Unidade] Boas-vindas do Dashboard', () => {
  afterEach(() => {
    cleanup();
  });

  it('mostra a animação, o título e o progresso até a IA', () => {
    render(<DashboardWelcome totalFeedbacks={0} />);
    const section = screen.getByRole('region', { name: 'Seu painel está pronto. Falta o primeiro feedback.' });
    expect(within(section).getByTestId('collect-beacon')).toBeInTheDocument();
    expect(within(section).getByText('Aguardando os primeiros feedbacks')).toBeInTheDocument();
    expect(within(section).getByText('0 de 10 feedbacks para a IA analisar os comentários')).toBeInTheDocument();
    expect(within(section).getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('os passos para começar ficam nos Primeiros passos, não aqui', () => {
    render(<DashboardWelcome totalFeedbacks={0} />);
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    expect(screen.queryByText('Primeiros passos')).not.toBeInTheDocument();
  });

  it('oferece o guia do sistema', () => {
    const onStartGuide = vi.fn();
    render(<DashboardWelcome totalFeedbacks={0} onStartGuide={onStartGuide} />);
    fireEvent.click(screen.getByRole('button', { name: /Conhecer o sistema/ }));
    expect(onStartGuide).toHaveBeenCalledOnce();
  });

  it('o progresso para em 10', () => {
    render(<DashboardWelcome totalFeedbacks={14} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '10');
  });
});
