import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, within, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mocks = vi.hoisted(() => ({
  useLoaderData: vi.fn(),
  useRouteLoaderData: vi.fn(),
  getFeedbackStats: vi.fn(),
  getFeedbackQuestions: vi.fn(),
  getFeedbackTimeline: vi.fn(() => Promise.resolve({ bucket: 'week', tz: 'America/Sao_Paulo', total: 0, points: [] })),
  useInsightsControls: vi.fn(),
  useScopedInsightsReport: vi.fn(),
  revalidator: { revalidate: vi.fn(), state: 'idle' },
  onboarding: { isGuidePending: false, isTourActive: false, startTour: vi.fn() },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
  return {
    ...actual,
    useLoaderData: mocks.useLoaderData,
    useRouteLoaderData: mocks.useRouteLoaderData,
    useRevalidator: () => mocks.revalidator,
    useFetcher: () => ({ state: 'idle', data: undefined, submit: vi.fn() }),
  };
});

vi.mock('src/services/serviceFeedbacks', () => ({
  ServiceGetFeedbackStats: mocks.getFeedbackStats,
  ServiceGetFeedbackQuestions: mocks.getFeedbackQuestions,
  ServiceGetFeedbackTimeline: mocks.getFeedbackTimeline,
}));

vi.mock('src/lib/context/insightsControls', () => ({
  useInsightsControls: mocks.useInsightsControls,
}));

vi.mock('src/lib/context/onboardingContext', () => ({
  useOnboarding: () => mocks.onboarding,
}));

vi.mock('src/lib/hooks/useScopedInsightsReport', () => ({
  useScopedInsightsReport: mocks.useScopedInsightsReport,
}));

vi.mock('components/user/pages/feedbacksInsightsReport/InsightsControlsBar', () => ({
  default: () => <div data-testid="scope-controls" />,
}));

import { useLoaderData, useRouteLoaderData } from 'react-router-dom';
import Dashboard from '../user/dashboard';

const loaderData = {
  user: {
    id: 'user-1',
    email: 'user@example.com',
    phone: '+5511999999999',
    user_metadata: { full_name: 'Usuário Teste' },
  },
  enterprise: {
    id: 'enterprise-1',
    document: '12345678900',
    created_at: new Date().toISOString(),
    account_type: 'CPF',
    email: 'enterprise@example.com',
    phone: '+5511988887777',
    full_name: 'Empresa XPTO',
  },
  collecting: {
    id: 'collecting-1',
    enterprise_id: 'enterprise-1',
    company_objective: 'Expandir operações',
    analytics_goal: 'Entender NPS',
    business_summary: 'Empresa de tecnologia focada em feedbacks',
    main_products_or_services: ['Produto A', 'Serviço B'],
    uses_company_products: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

const feedbackStats = {
  totalFeedbacks: 12,
  averageRating: 4.2,
  ratingDistribution: {
    1: 1,
    2: 1,
    3: 2,
    4: 3,
    5: 5,
  },
  sentimentBreakdown: {
    positive: 8,
    neutral: 2,
    negative: 2,
  },
};

const dashboardLoaderData = {
  stats: feedbackStats,
  dashboardError: null,
};

describe('[Unidade] Dashboard Page', () => {
  beforeEach(() => {
    vi.mocked(useLoaderData).mockReturnValue(
      dashboardLoaderData as ReturnType<typeof useLoaderData>,
    );
    vi.mocked(useRouteLoaderData).mockReturnValue(
      loaderData as ReturnType<typeof useRouteLoaderData>,
    );
    mocks.getFeedbackStats.mockResolvedValue(feedbackStats);
    mocks.getFeedbackQuestions.mockResolvedValue({ questions: [] });
    mocks.useInsightsControls.mockReturnValue({
      scope: 'COMPANY',
      catalogItemId: '',
      catalogItemOptions: [],
      period: { preset: 'ALL' },
    });
    mocks.useScopedInsightsReport.mockReturnValue({
      report: null,
      summary: null,
      loading: false,
      error: null,
      reload: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
    mocks.onboarding.isGuidePending = false;
    mocks.onboarding.isTourActive = false;
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it('renderiza título e saudação com dados do loader', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Olá, Usuário Teste')).toBeInTheDocument();
    });

    // Sem feedbacks pendentes (pendingCount ausente) → linha de status "em dia".
    expect(
      screen.getByText('Tudo em dia — nenhum feedback aguardando análise neste escopo.'),
    ).toBeInTheDocument();
  });

  it('exibe a Avaliação por estrelas com média, positivas e críticas', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    const section = await screen.findByRole('region', { name: 'Avaliação por estrelas' });
    // Escopo explícito: "Geral" é só o Avaliação geral da empresa.
    expect(within(section).getByRole('button', { name: /Avaliação geral da empresa/ })).toBeInTheDocument();

    // Média com parâmetro: escala, rótulo e quantidade de avaliações.
    expect(within(section).getByText('4,2')).toBeInTheDocument();
    expect(within(section).getByText('Boa')).toBeInTheDocument();
    expect(within(section).getByText('12 avaliações')).toBeInTheDocument();

    // Positivas (4–5★) = 3 + 5 = 8 de 12 → 67%; críticas (1–2★) = 2 → 17%.
    expect(within(section).getByText('Positivas (4–5★)')).toBeInTheDocument();
    expect(within(section).getByText('8')).toBeInTheDocument();
    expect(within(section).getByText('· 67%')).toBeInTheDocument();
    expect(within(section).getByText('Críticas (1–2★)')).toBeInTheDocument();
    expect(within(section).getByText('· 17%')).toBeInTheDocument();

    // Saem do Dashboard: card de recebidos, distribuição e "Satisfação e sentimento".
    expect(screen.queryByText('Feedbacks recebidos')).not.toBeInTheDocument();
    expect(screen.queryByText('Distribuição das avaliações')).not.toBeInTheDocument();
    expect(screen.queryByText('Satisfação e sentimento')).not.toBeInTheDocument();

    expect(within(section).getByRole('link', { name: /Ver todas as métricas de estrelas/ }))
      .toHaveAttribute('href', '/user/ratings');
  });

  it('oferece comparar dois itens só quando há 2 do mesmo tipo', async () => {
    const { unmount } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );
    await screen.findByRole('region', { name: 'Avaliação por estrelas' });
    expect(screen.queryByRole('link', { name: /Comparar dois itens/ })).not.toBeInTheDocument();
    unmount();

    mocks.useInsightsControls.mockReturnValue({
      scope: 'COMPANY',
      catalogItemId: '',
      catalogItemOptions: [
        { id: 'p1', name: 'Pizza', kind: 'PRODUCT' },
        { id: 'p2', name: 'Refrigerante', kind: 'PRODUCT' },
      ],
      period: { preset: 'ALL' },
    });
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('link', { name: /Comparar dois itens/ })).toHaveAttribute('href', '/user/compare');
  });

  it('sem avaliações diz isso no lugar de mostrar "0,0"', async () => {
    const empty = { ...feedbackStats, totalFeedbacks: 0, averageRating: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    vi.mocked(useLoaderData).mockReturnValue({ stats: empty, dashboardError: null } as ReturnType<typeof useLoaderData>);
    mocks.getFeedbackStats.mockResolvedValue(empty);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(await screen.findByText('Ainda sem avaliações na empresa (avaliação geral).')).toBeInTheDocument();
    expect(screen.queryByText('0,0')).not.toBeInTheDocument();
  });

  it('exibe a Análise dos comentários vazia, com o escopo e o link da visão geral', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    const section = await screen.findByRole('region', { name: /Análise dos comentários/ });
    expect(section).toHaveAttribute('data-tour', 'tour-dashboard-comments');
    expect(mocks.useScopedInsightsReport).toHaveBeenCalledWith({ withAnalysis: true });
    expect(within(section).getByRole('button', { name: /Avaliação geral da empresa/ })).toBeInTheDocument();
    expect(within(section).getByText('Ainda sem comentários analisados pela IA na empresa (avaliação geral).')).toBeInTheDocument();
    expect(within(section).getByText('Resumo dos comentários e recomendações')).toBeInTheDocument();
    // Diz de onde vêm os dados: só os comentários, com a nota e as respostas de cada um.
    expect(within(section).getByText(/A IA lê os comentários analisados, junto com a nota e as respostas de cada um/)).toBeInTheDocument();
    expect(within(section).getByText('Ainda não há resumo dos comentários para este escopo')).toBeInTheDocument();
    expect(within(section).getByRole('link', { name: /Ver a análise completa dos comentários/ }))
      .toHaveAttribute('href', '/user/insights/overview');
    expect(screen.queryByText('Relatório de Insights')).not.toBeInTheDocument();
  });

  it('conta sem nenhum feedback mostra as boas-vindas e a prévia, com as âncoras do guia', async () => {
    const empty = { ...feedbackStats, totalFeedbacks: 0, averageRating: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    vi.mocked(useLoaderData).mockReturnValue({
      stats: empty,
      accountTotalFeedbacks: 0,
      qrActive: true,
      dashboardError: null,
    } as ReturnType<typeof useLoaderData>);
    vi.mocked(useRouteLoaderData).mockReturnValue({
      ...loaderData,
      collecting: {
        ...loaderData.collecting,
        company_feedback_questions: [
          { id: 'q2', question_order: 2, question_text: 'O atendimento foi rápido?', is_active: true },
          { id: 'q1', question_order: 1, question_text: 'Como foi sua experiência?', is_active: true },
          { id: 'q3', question_order: 3, question_text: 'Pergunta desligada', is_active: false },
        ],
      },
    } as ReturnType<typeof useRouteLoaderData>);
    mocks.getFeedbackStats.mockResolvedValue(empty);

    const { container } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('region', { name: 'Seu painel está pronto. Falta o primeiro feedback.' })).toBeInTheDocument();
    expect(screen.getByText('Vamos coletar os primeiros feedbacks.')).toBeInTheDocument();

    const preview = screen.getByRole('region', { name: 'O que vai aparecer aqui' });
    // As perguntas são as reais do formulário, só as ativas e na ordem.
    const questions = within(preview).getAllByText(/^\d\. /).map((node) => node.textContent);
    expect(questions).toEqual(['1. Como foi sua experiência?', '2. O atendimento foi rápido?']);
    expect(within(preview).getAllByText('Exemplo')).toHaveLength(4);

    // O guia passa pelas seções do Dashboard logo após o cadastro.
    expect(container.querySelector('[data-tour="tour-dashboard-diagnosis"]')).toBeInTheDocument();
    expect(container.querySelector('[data-tour="tour-star-ratings"]')).toBeInTheDocument();
    expect(container.querySelector('[data-tour="tour-movement"]')).toBeInTheDocument();
    expect(container.querySelector('[data-tour="tour-form-questions"]')).toBeInTheDocument();
    expect(container.querySelector('[data-tour="tour-dashboard-comments"]')).toBeInTheDocument();

    // As seções vazias saem enquanto a conta não tem feedbacks.
    expect(screen.queryByText('Ainda sem avaliações na empresa (avaliação geral).')).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /Tom dos comentários/ })).not.toBeInTheDocument();
  });

  it('com poucos feedbacks no escopo, diz quantos faltam para a IA analisar', async () => {
    const few = { ...feedbackStats, totalFeedbacks: 7 };
    vi.mocked(useLoaderData).mockReturnValue({ stats: few, accountTotalFeedbacks: 7, qrActive: true, dashboardError: null } as ReturnType<typeof useLoaderData>);
    mocks.getFeedbackStats.mockResolvedValue(few);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    const tone = await screen.findByRole('region', { name: /Tom dos comentários/ });
    expect(within(tone).getByText(/Faltam 3 feedbacks para a IA analisar\./)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'O que vai aparecer aqui' })).not.toBeInTheDocument();
  });

  it('com período, as seções seguem o período e o aviso de pendentes e o mínimo da IA, o histórico inteiro', async () => {
    mocks.useInsightsControls.mockReturnValue({
      scope: 'COMPANY',
      catalogItemId: '',
      catalogItemOptions: [],
      period: { preset: 'LAST_7_DAYS' },
    });
    const inPeriod = { ...feedbackStats, totalFeedbacks: 2, pendingCount: 0 };
    const allTime = { ...feedbackStats, totalFeedbacks: 12, pendingCount: 4 };
    mocks.getFeedbackStats.mockImplementation((params: { start_date?: string }) =>
      Promise.resolve(params.start_date ? inPeriod : allTime),
    );

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    // O seed do loader é do histórico inteiro: não aparece com o período escolhido.
    expect(screen.getByLabelText('Carregando métricas do escopo')).toBeInTheDocument();
    expect(await screen.findByText('4 feedbacks aguardando análise neste escopo.')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByLabelText('Carregando métricas do escopo')).not.toBeInTheDocument());
    const periodCall = mocks.getFeedbackStats.mock.calls.find(([params]) => params.start_date);
    expect(periodCall?.[0]).toEqual(expect.objectContaining({ scope_type: 'COMPANY', end_date: expect.any(String) }));
    expect(mocks.getFeedbackStats).toHaveBeenCalledWith({ scope_type: 'COMPANY', catalog_item_id: undefined });
    expect(mocks.getFeedbackQuestions).toHaveBeenCalledWith(expect.objectContaining({ start_date: expect.any(String) }));

    expect(screen.getAllByRole('button', { name: /Avaliação geral da empresa · Últimos 7 dias/ }).length).toBeGreaterThan(0);
    expect(screen.getByText('O resumo considera todos os comentários analisados.')).toBeInTheDocument();
    // 12 no histórico: já passou do mínimo, então não pede mais feedbacks para a IA.
    expect(screen.queryByText(/para a IA analisar\./)).not.toBeInTheDocument();
  });

  it('outro escopo ao voltar ao Dashboard: esqueleto em vez dos números do seed', async () => {
    mocks.useInsightsControls.mockReturnValue({
      scope: 'PRODUCT',
      catalogItemId: 'p1',
      catalogItemOptions: [{ id: 'p1', name: 'Pizza', kind: 'PRODUCT' }],
      period: { preset: 'ALL' },
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('Carregando métricas do escopo')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByLabelText('Carregando métricas do escopo')).not.toBeInTheDocument());
    expect(mocks.getFeedbackStats).toHaveBeenCalledWith({ scope_type: 'PRODUCT', catalog_item_id: 'p1' });
  });

  it('sem período, não mostra o aviso do resumo nem busca as stats duas vezes', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(screen.queryByLabelText('Carregando métricas do escopo')).not.toBeInTheDocument();
    await waitFor(() => expect(mocks.getFeedbackStats).toHaveBeenCalledTimes(1));
    expect(screen.queryByText('O resumo considera todos os comentários analisados.')).not.toBeInTheDocument();
  });

  it('mostra o tom dos comentários num bloco só, com o resumo em palavras', async () => {
    mocks.useScopedInsightsReport.mockReturnValue({
      report: null,
      summary: {
        totalAnalyzed: 20,
        sentiments: { positive: 12, neutral: 5, negative: 3 },
        topCategories: [],
        topKeywords: [],
        netSentimentScore: 45,
      },
      loading: false,
      error: null,
      reload: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    const tone = await screen.findByRole('region', { name: /Tom dos comentários/ });
    expect(within(tone).getByText('+45')).toBeInTheDocument();
    expect(within(tone).getByText('Positivo')).toBeInTheDocument();
    expect(within(tone).getByText('20 comentários analisados')).toBeInTheDocument();
    expect(within(tone).getByText('60%')).toBeInTheDocument();
  });

  describe('convite do guia', () => {
    const renderDashboard = () => render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );
    const withAccount = (accountTotalFeedbacks: number) => {
      vi.mocked(useLoaderData).mockReturnValue({
        stats: feedbackStats, accountTotalFeedbacks, qrActive: true, dashboardError: null,
      } as ReturnType<typeof useLoaderData>);
    };

    it('o guia não abre sozinho; com o primeiro feedback, convida e começa ao aceitar', async () => {
      mocks.onboarding.isGuidePending = true;
      withAccount(1);
      renderDashboard();
      expect(await screen.findByText('Seu primeiro feedback chegou! 🎉')).toBeInTheDocument();
      expect(mocks.onboarding.startTour).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'Começar o guia' }));
      expect(mocks.onboarding.startTour).toHaveBeenCalledOnce();
      expect(screen.queryByText('Seu primeiro feedback chegou! 🎉')).not.toBeInTheDocument();
    });

    it('sem feedback, não convida na primeira sessão, só na próxima', async () => {
      mocks.onboarding.isGuidePending = true;
      withAccount(0);
      const first = renderDashboard();
      await screen.findByRole('region', { name: 'Seu painel está pronto. Falta o primeiro feedback.' });
      expect(screen.queryByText('Quer conhecer o sistema?')).not.toBeInTheDocument();
      first.unmount();

      // Outra sessão do navegador (o app foi aberto de novo).
      window.sessionStorage.clear();
      renderDashboard();
      expect(await screen.findByText('Quer conhecer o sistema?')).toBeInTheDocument();
    });

    it('"Depois" adia: volta na próxima sessão e para depois de 2 vezes', async () => {
      mocks.onboarding.isGuidePending = true;
      withAccount(1);
      for (let round = 0; round < 2; round += 1) {
        window.sessionStorage.clear();
        const view = renderDashboard();
        fireEvent.click(await screen.findByRole('button', { name: 'Depois' }));
        expect(screen.queryByText('Seu primeiro feedback chegou! 🎉')).not.toBeInTheDocument();
        view.unmount();
      }
      window.sessionStorage.clear();
      renderDashboard();
      await screen.findByText('Olá, Usuário Teste');
      expect(screen.queryByText('Seu primeiro feedback chegou! 🎉')).not.toBeInTheDocument();
      expect(mocks.onboarding.startTour).not.toHaveBeenCalled();
    });

    it('guia já concluído ou pulado: nada de convite', async () => {
      withAccount(5);
      renderDashboard();
      await screen.findByText('Olá, Usuário Teste');
      expect(screen.queryByRole('button', { name: 'Começar o guia' })).not.toBeInTheDocument();
    });

    it('na conta zerada, "Conhecer o sistema" abre o guia', async () => {
      withAccount(0);
      renderDashboard();
      fireEvent.click(await screen.findByRole('button', { name: /Conhecer o sistema/ }));
      expect(mocks.onboarding.startTour).toHaveBeenCalledOnce();
    });
  });
});
