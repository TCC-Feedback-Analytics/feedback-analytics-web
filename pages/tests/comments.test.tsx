import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, useLocation } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
  useLoaderData: vi.fn(),
  useInsightsControls: vi.fn(),
  useScopedFeedbackAnalysis: vi.fn(),
}));

// O setup global troca o react-router-dom por um mock mínimo; aqui usamos o real.
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useLoaderData: mocks.useLoaderData };
});

vi.mock('src/lib/context/insightsControls', () => ({
  useInsightsControls: mocks.useInsightsControls,
}));

vi.mock('src/lib/hooks/useScopedFeedbackAnalysis', () => ({
  useScopedFeedbackAnalysis: mocks.useScopedFeedbackAnalysis,
}));

import CommentsPage from '../user/feedbacks/insights/comments';

const items = [
  { id: 'a', message: 'Atendimento excelente', rating: 5, created_at: '2026-10-16T12:00:00.000Z', sentiment: 'positive', categories: ['Atendimento'], keywords: [], discrepancy: null },
  { id: 'b', message: 'Demorou demais', rating: 5, created_at: '2026-10-16T12:00:00.000Z', sentiment: 'negative', categories: [], keywords: [], discrepancy: 'silent_detractor' },
  { id: 'c', message: 'Normal', rating: 3, created_at: '2026-10-16T12:00:00.000Z', sentiment: 'neutral', categories: [], keywords: [], discrepancy: null },
];

function LocationProbe() {
  const { search } = useLocation();
  return <span data-testid="search">{search}</span>;
}

function renderPage(entry = '/user/insights/comments') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <CommentsPage />
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe('[Unidade] Página de comentários analisados', () => {
  beforeEach(() => {
    mocks.useLoaderData.mockReturnValue({ items, summary: null });
    mocks.useInsightsControls.mockReturnValue({
      scope: 'PRODUCT',
      catalogItemId: 'p1',
      catalogItemOptions: [{ id: 'p1', name: 'Pizza', kind: 'PRODUCT' }],
    });
    mocks.useScopedFeedbackAnalysis.mockReturnValue({ items, summary: null, loading: false, error: null });
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('lista todos os comentários do escopo, com a etiqueta de escopo', () => {
    renderPage();
    expect(screen.getByText('Atendimento excelente')).toBeInTheDocument();
    expect(screen.getByText('Demorou demais')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Produto · Pizza/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Todos (3)' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('abre já filtrado pelo ?filtro= da URL (links antigos de Analisados)', () => {
    renderPage('/user/insights/comments?filtro=negativos');
    expect(screen.getByRole('button', { name: 'Negativos (1)' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Demorou demais')).toBeInTheDocument();
    expect(screen.queryByText('Atendimento excelente')).not.toBeInTheDocument();
  });

  it('o filtro "Nota e texto não combinam" mostra só as divergências e fica na URL', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Nota e texto não combinam (1)' }));
    expect(screen.getByTestId('search')).toHaveTextContent('?filtro=divergentes');
    expect(screen.getByText('Demorou demais')).toBeInTheDocument();
    expect(screen.queryByText('Normal')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Todos (3)' }));
    expect(screen.getByTestId('search')).toHaveTextContent('');
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });

  it('sem comentários analisados diz isso citando o escopo', () => {
    mocks.useScopedFeedbackAnalysis.mockReturnValue({ items: [], summary: null, loading: false, error: null });
    renderPage();
    expect(screen.getByText('Ainda sem comentários analisados pela IA no produto Pizza.')).toBeInTheDocument();
  });
});
