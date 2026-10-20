import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  get: vi.fn(),
  controls: {
    scope: 'PRODUCT',
    catalogItemId: 'p1',
    catalogItemOptions: [{ id: 'p1', name: 'Pizza', kind: 'PRODUCT' }],
    period: { preset: 'LAST_30_DAYS' },
  } as Record<string, unknown>,
}));

vi.mock('react-router-dom', async () => vi.importActual<typeof import('react-router-dom')>('react-router-dom'));
vi.mock('src/services/serviceScopeDiagnosis', () => ({
  ServiceListScopeDiagnoses: mocks.list,
  ServiceGetScopeDiagnosis: mocks.get,
}));
vi.mock('src/lib/context/insightsControls', () => ({ useInsightsControls: () => mocks.controls }));

import DiagnosisHistory from 'pages/user/diagnosis';

const local = (year: number, month: number, day: number) => new Date(year, month - 1, day).toISOString();

const ITEMS = [
  { id: 'd2', period: { start: local(2026, 9, 1), end: local(2026, 10, 1) }, feedbackCount: 40, model: 'm', createdAt: local(2026, 10, 2), summary: 'Setembro: a espera preocupa.' },
  { id: 'd1', period: { start: null, end: null }, feedbackCount: 1, model: 'm', createdAt: local(2026, 8, 10), summary: 'Histórico inteiro: tudo bem.' },
];

function full(id: string, summary: string) {
  return {
    id, scopeType: 'PRODUCT', catalogItemId: 'p1', period: ITEMS[0].period,
    previousPeriod: { start: local(2026, 8, 2), end: local(2026, 9, 1) },
    feedbackCount: 40, newFeedbacksSince: 0, model: 'm', createdAt: ITEMS[0].createdAt,
    result: {
      summary, going_well: [], concerns: [{ text: 'A espera pesa.', evidence: 'Nota 3,1.' }], changes: [],
      recommendations: [{ priority: 1, kind: 'fix', action: 'Rever a espera.', evidence: 'Nota 3,1.' }], limitations: [],
    },
  };
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/user/diagnosis']}>
      <DiagnosisHistory />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});

describe('Histórico de diagnósticos', () => {
  it('lista os diagnósticos do escopo e abre o mais recente', async () => {
    mocks.list.mockResolvedValue({ items: ITEMS });
    mocks.get.mockResolvedValue(full('d2', 'Setembro completo: a espera preocupa.'));
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Histórico de diagnósticos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Diagnósticos no produto Pizza' })).toBeInTheDocument();
    expect(mocks.list).toHaveBeenCalledWith({ scope_type: 'PRODUCT', catalog_item_id: 'p1' });

    const [latest, older] = await screen.findAllByRole('listitem').then((items) => items.filter((li) => li.querySelector('button[aria-expanded]')));
    expect(within(latest).getByText('01/09/2026 a 30/09/2026')).toBeInTheDocument();
    expect(await within(latest).findByText('Setembro completo: a espera preocupa.')).toBeInTheDocument();
    expect(within(latest).getByText('Comparado com 02/08/2026 a 31/08/2026')).toBeInTheDocument();
    expect(mocks.get).toHaveBeenCalledWith('d2');

    // Os outros ficam fechados, com o começo do resumo e o singular certo.
    expect(within(older).getByText('Todo o período')).toBeInTheDocument();
    expect(within(older).getByText(/^1 avaliação · gerado em 10\/08\/2026$/)).toBeInTheDocument();
    expect(within(older).getByText('Histórico inteiro: tudo bem.')).toBeInTheDocument();
  });

  it('abre um antigo só ao clicar, e busca uma vez', async () => {
    mocks.list.mockResolvedValue({ items: ITEMS });
    mocks.get.mockImplementation(async (id: string) => full(id, id === 'd1' ? 'Antigo completo.' : 'Recente completo.'));
    renderPage();

    const button = await screen.findByRole('button', { name: /Todo o período/ });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    expect(await screen.findByText('Antigo completo.')).toBeInTheDocument();
    fireEvent.click(button);
    fireEvent.click(button);
    expect(mocks.get.mock.calls.filter(([id]) => id === 'd1')).toHaveLength(1);
  });

  it('sem diagnósticos, leva ao Dashboard para gerar o primeiro', async () => {
    mocks.list.mockResolvedValue({ items: [] });
    renderPage();
    expect(await screen.findByRole('link', { name: 'Gerar o primeiro no Dashboard' })).toHaveAttribute('href', '/user/dashboard');
  });

  it('falha ao carregar mostra o aviso', async () => {
    mocks.list.mockRejectedValue(new Error('offline'));
    renderPage();
    expect(await screen.findByText('Não foi possível carregar o histórico agora.')).toBeInTheDocument();
  });
});
