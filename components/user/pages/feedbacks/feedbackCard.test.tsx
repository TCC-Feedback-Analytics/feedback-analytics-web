import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom';
import type { Feedback } from 'lib/interfaces/domain/feedback.domain';
import FeedbackCard from './feedbackCard';

afterEach(cleanup);

function feedback(overrides: Partial<Feedback> = {}): Feedback {
  return {
    id: 'f1',
    message: 'Ótimo atendimento',
    rating: 5,
    created_at: '2026-10-31T12:00:00Z',
    updated_at: '2026-10-31T12:00:00Z',
    collection_points: { id: 'cp1', name: 'QR Code - Empresa', type: 'QR_CODE', identifier: null },
    tracked_devices: null,
    ...overrides,
  };
}

describe('card do feedback na lista', () => {
  it('o teste do dono aparece marcado e com o canal "Teste do formulário"', () => {
    render(<FeedbackCard feedback={feedback({ channel: 'TEST' })} />);
    expect(screen.getByText('Teste')).toHaveAttribute('title', expect.stringContaining('Não entra nas métricas'));
    expect(screen.getByText('Canal:').parentElement).toHaveTextContent('Teste do formulário');
  });

  it('mostra o canal real da resposta e, sem marca, o ponto de coleta', () => {
    render(<FeedbackCard feedback={feedback({ channel: 'NFC' })} />);
    expect(screen.getByText('Canal:').parentElement).toHaveTextContent('Etiqueta NFC');
    expect(screen.queryByText('Teste')).not.toBeInTheDocument();
    cleanup();

    render(<FeedbackCard feedback={feedback({ channel: null })} />);
    expect(screen.getByText('Canal:').parentElement).toHaveTextContent('QR Code');
  });
});
