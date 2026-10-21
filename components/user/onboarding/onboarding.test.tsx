import { useEffect, useRef } from "react";
import { act, render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { MemoryRouter, useLocation } from "react-router-dom";
import { OnboardingProvider, useOnboarding } from "src/lib/context/onboardingContext";
import AIContextDialog from "./AIContextDialog";
import { saveOnboardingDraft } from "src/lib/utils/onboardingDraft";
import UserInteractiveTour from "./UserInteractiveTour";
import { INTERACTIVE_STEPS } from "./ui.types";
import { TOUR_STEPS_COUNT } from "src/lib/context/onboardingContext.types";
import type { CollectingDataEnterprise } from "lib/interfaces/entities/enterprise.entity";
import type { IaConfigResponse } from "src/services/serviceIaConfig";

const systemGuide = vi.hoisted(() => ({ get: vi.fn(), update: vi.fn() }));
const routeData = vi.hoisted(() => ({
  collecting: null as CollectingDataEnterprise | null,
  iaConfig: null as IaConfigResponse | null,
  user: { id: "user-1" },
}));

vi.mock("src/services/serviceSystemGuide", () => ({
  ServiceGetSystemGuide: systemGuide.get,
  ServiceUpdateSystemGuide: systemGuide.update,
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useRouteLoaderData: () => routeData,
    useFetcher: () => ({
      state: "idle",
      data: undefined,
      Form: (props: React.FormHTMLAttributes<HTMLFormElement>) => <form {...props} />,
      submit: vi.fn(),
    }),
  };
});

const iaModels = vi.hoisted(() => ({
  models: [] as Array<{ id: string; name: string; isAutomatic: boolean; contextLength: number | null; maxCompletionTokens: number | null }>,
}));

vi.mock("src/hooks/useIaModels", () => ({
  useIaModels: () => ({
    catalog: { models: iaModels.models, source: "public", fetchedAt: "", stale: false, currentModel: null, currentModelAvailable: null },
    loading: false,
    error: undefined,
    reload: vi.fn(),
  }),
}));

function TestConsumer() {
  const { isTourActive, isGuidePending, currentTourStep, hasCompletedAIContext, hasCompletedAISetup, startTour, skipTour } =
    useOnboarding();
  return (
    <div>
      <span data-testid="context-completed">{String(hasCompletedAIContext)}</span>
      <span data-testid="ai-setup-completed">{String(hasCompletedAISetup)}</span>
      <span data-testid="tour-active">{String(isTourActive)}</span>
      <span data-testid="guide-pending">{String(isGuidePending)}</span>
      <span data-testid="tour-step">{currentTourStep}</span>
      <button onClick={startTour}>Start Tour</button>
      <button onClick={skipTour}>Skip Tour</button>
    </div>
  );
}

/** Faz o papel do convite do Dashboard: começa o guia quando ele fica pendente. */
function StartWhenPending() {
  const { isGuidePending, isTourActive, startTour } = useOnboarding();
  const started = useRef(false);
  useEffect(() => {
    if (isGuidePending && !isTourActive && !started.current) {
      started.current = true;
      startTour();
    }
  }, [isGuidePending, isTourActive, startTour]);
  return null;
}

describe("[Unidade] Componentes e Contexto de Onboarding", () => {
  beforeEach(() => {
    // Os testes que não exercitam o tour não precisam avançar a leitura assíncrona.
    systemGuide.get.mockReset().mockImplementation(() => new Promise(() => {}));
    systemGuide.update.mockReset().mockImplementation(async ({ version, status }) => ({
      tourKey: "system-guide", version, status, finishedAt: "2026-01-01T00:00:00.000Z",
    }));
    routeData.collecting = null;
    routeData.iaConfig = null;
    routeData.user = { id: "user-1" };
    iaModels.models = [];
  });

  afterEach(() => {
    cleanup();
  });

  it("calcula corretamente hasCompletedAIContext como falso se algum dos 3 campos faltar", () => {
    const collecting = {
      business_summary: "Resumo",
      company_objective: "",
      analytics_goal: "Objetivo",
    } as CollectingDataEnterprise;

    render(
      <MemoryRouter>
        <OnboardingProvider collecting={collecting} sessionKey="user-1">
          <TestConsumer />
        </OnboardingProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId("context-completed")).toHaveTextContent("false");
  });

  it("calcula corretamente hasCompletedAIContext como verdadeiro se os 3 campos estiverem preenchidos", () => {
    const collecting = {
      business_summary: "Resumo da empresa",
      company_objective: "Foco no atendimento",
      analytics_goal: "Descobrir causa de reclamações",
    } as CollectingDataEnterprise;

    render(
      <MemoryRouter>
        <OnboardingProvider collecting={collecting} sessionKey="user-1">
          <TestConsumer />
        </OnboardingProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId("context-completed")).toHaveTextContent("true");
  });

  it("mantém hasCompletedAISetup falso quando a IA ainda não foi configurada", () => {
    const collecting = {
      business_summary: "Resumo da empresa",
      company_objective: "Foco no atendimento",
      analytics_goal: "Descobrir causa de reclamações",
    } as CollectingDataEnterprise;

    render(
      <MemoryRouter>
        <OnboardingProvider collecting={collecting} sessionKey="user-1">
          <TestConsumer />
        </OnboardingProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId("context-completed")).toHaveTextContent("true");
    expect(screen.getByTestId("ai-setup-completed")).toHaveTextContent("false");
  });

  it("renderiza o AIContextDialog em modo obrigatório quando ativado", () => {
    render(
      <MemoryRouter>
        <OnboardingProvider collecting={null} sessionKey="user-1">
          <AIContextDialog open={true} onOpenChange={() => {}} isMandatory={true} />
        </OnboardingProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Contexto e configuração de IA")).toBeInTheDocument();
    expect(screen.getByText("Obrigatório")).toBeInTheDocument();
    expect(screen.queryByLabelText("Fechar")).not.toBeInTheDocument();
  });

  it("apresenta o contexto primeiro e permite avançar até a etapa da LLM", () => {
    render(
      <MemoryRouter>
        <OnboardingProvider collecting={null} sessionKey="user-1">
          <AIContextDialog open={true} onOpenChange={() => {}} isMandatory={false} />
        </OnboardingProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: "1. Resumo do Negócio" })).toBeInTheDocument();
    expect(screen.getByRole("dialog").querySelector("form")).toHaveAttribute("novalidate");

    expect(screen.getByRole("heading", { name: /Resumo do Negócio/ })).toBeInTheDocument();
    const nextButton = screen.getByRole("button", { name: "Próximo Passo" });
    expect(nextButton).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText(/Rede de clínicas odontológicas/), { target: { value: "Resumo da empresa" } });
    expect(nextButton).toBeEnabled();
    fireEvent.click(nextButton);
    expect(screen.getByRole("heading", { name: /Objetivo da Empresa/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Próximo Passo" })).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText(/Oferecer a melhor experiência/), { target: { value: "Objetivo da empresa" } });
    fireEvent.click(screen.getByRole("button", { name: "Próximo Passo" }));
    expect(screen.getByRole("heading", { name: /Objetivo Analítico/ })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Identificar os principais motivos/), { target: { value: "Analisar os principais motivos das reclamações" } });
    fireEvent.click(screen.getByRole("button", { name: "Próximo Passo" }));
    expect(screen.getByRole("button", { name: "4. Modelo LLM" })).toBeInTheDocument();
    expect(screen.getByText(/Passo 4 de 4/)).toBeInTheDocument();
  });

  describe("escolha do modelo na etapa da LLM", () => {
    const completeContext = {
      business_summary: "Resumo",
      company_objective: "Objetivo",
      analytics_goal: "Analítico",
    } as CollectingDataEnterprise;
    const model = (id: string, name: string) => ({ id, name, isAutomatic: id === "openrouter/auto", contextLength: 128000, maxCompletionTokens: 8000 });

    function openLlmStep(iaConfig: IaConfigResponse, { typeKey = true } = {}) {
      routeData.collecting = completeContext;
      routeData.iaConfig = iaConfig;
      iaModels.models = [
        model("openrouter/auto", "Auto Router"),
        model("vendor/paid", "Modelo Pago"),
        model("vendor/free:free", "Modelo Grátis"),
      ];
      render(
        <MemoryRouter>
          <OnboardingProvider collecting={completeContext} sessionKey="user-1">
            <AIContextDialog open={true} onOpenChange={() => {}} isMandatory={false} />
          </OnboardingProvider>
        </MemoryRouter>
      );
      fireEvent.click(screen.getByRole("button", { name: "4. Modelo LLM" }));
      // Sem chave salva, o modelo só pode ser escolhido depois de digitar a chave.
      if (!iaConfig.hasKey && typeKey) {
        fireEvent.change(screen.getByLabelText("Chave da API OpenRouter"), { target: { value: "sk-or-v1-teste" } });
      }
      if (iaConfig.hasKey || typeKey) openModels();
    }

    function openModels() {
      const combobox = screen.getByRole("combobox", { name: "Modelo LLM" });
      if (combobox.getAttribute("aria-expanded") !== "true") fireEvent.click(combobox);
    }

    it("mostra só os modelos gratuitos por padrão e permite ver também os pagos", () => {
      openLlmStep({ hasKey: false, provider: null, model: null, keyHint: null });
      const paid = screen.getByRole("checkbox", { name: "Mostrar também modelos pagos" });
      expect(paid).not.toBeChecked();
      expect(screen.getByRole("option", { name: "Modelo Grátis (vendor/free:free) — Gratuito" })).toBeEnabled();
      expect(screen.queryByRole("option", { name: /Modelo Pago/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("option", { name: /Roteamento automático/ })).not.toBeInTheDocument();

      fireEvent.click(paid);
      openModels();
      expect(screen.getByRole("option", { name: "Modelo Pago (vendor/paid)" })).toBeEnabled();
      expect(screen.getByRole("option", { name: /Roteamento automático/ })).toBeInTheDocument();
    });

    it("sem chave, o seletor de modelo fica bloqueado até a chave ser digitada", () => {
      openLlmStep({ hasKey: false, provider: null, model: null, keyHint: null }, { typeKey: false });
      expect(screen.getByRole("combobox", { name: "Modelo LLM" })).toBeDisabled();
      expect(screen.getByRole("checkbox", { name: "Mostrar também modelos pagos" })).toBeDisabled();
      expect(screen.getByText("Informe a chave da API para escolher o modelo.")).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText("Chave da API OpenRouter"), { target: { value: "sk-or-v1-teste" } });
      expect(screen.getByRole("combobox", { name: "Modelo LLM" })).toBeEnabled();
      expect(screen.queryByText("Informe a chave da API para escolher o modelo.")).not.toBeInTheDocument();
    });

    it("quem já usa um modelo pago abre com os pagos visíveis", () => {
      openLlmStep({ hasKey: true, provider: "openrouter", model: "vendor/paid", keyHint: "xyz9" });
      expect(screen.getByRole("checkbox", { name: "Mostrar também modelos pagos" })).toBeChecked();
      expect(screen.getByRole("option", { name: "Modelo Pago (vendor/paid)" })).toBeEnabled();
    });
  });

  it("preserva edições locais quando uma revalidação traz o contexto antigo do servidor", () => {
    routeData.collecting = {
      business_summary: "Resumo antigo",
      company_objective: "Objetivo antigo",
      analytics_goal: "Análise antiga",
    } as CollectingDataEnterprise;
    routeData.iaConfig = {
      hasKey: true,
      provider: "openrouter",
      model: "openrouter/auto",
      keyHint: "1234",
    };

    const { rerender } = render(
      <MemoryRouter>
        <AIContextDialog open={true} onOpenChange={() => {}} />
      </MemoryRouter>,
    );

    const summary = screen.getByPlaceholderText(/Rede de clínicas odontológicas/);
    fireEvent.change(summary, { target: { value: "Resumo editado e ainda não salvo" } });
    fireEvent.click(screen.getByRole("button", { name: "Próximo Passo" }));
    fireEvent.click(screen.getByRole("button", { name: "Anterior" }));

    routeData.collecting = {
      business_summary: "Resumo antigo",
      company_objective: "Objetivo antigo",
      analytics_goal: "Análise antiga",
    } as CollectingDataEnterprise;
    rerender(
      <MemoryRouter>
        <AIContextDialog open={true} onOpenChange={() => {}} />
      </MemoryRouter>,
    );

    expect(screen.getByPlaceholderText(/Rede de clínicas odontológicas/)).toHaveValue(
      "Resumo editado e ainda não salvo",
    );
  });

  it("sem chave, oferece Conectar com OpenRouter e volta do OpenRouter com o contexto digitado, já na etapa da IA", () => {
    routeData.collecting = null;
    routeData.iaConfig = { hasKey: true, provider: "openrouter", model: "openrouter/free", keyHint: "5678" };
    saveOnboardingDraft("user-1", {
      business_summary: "Padaria de bairro digitada antes de sair",
      company_objective: "Crescer",
      analytics_goal: "Entender os clientes",
    });

    render(
      <MemoryRouter>
        <AIContextDialog open={true} onOpenChange={() => {}} />
      </MemoryRouter>,
    );

    // Voltou na etapa da IA, já conectado, e o contexto de antes continua lá.
    expect(screen.getByText(/Chave OpenRouter configurada/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "1. Resumo do Negócio" }));
    expect(screen.getByPlaceholderText(/Rede de clínicas odontológicas/)).toHaveValue("Padaria de bairro digitada antes de sair");
  });

  it("sem chave, o botão Conectar com OpenRouter vem antes de colar a chave", () => {
    routeData.collecting = null;
    routeData.iaConfig = { hasKey: false, provider: null, model: null, keyHint: null };
    render(
      <MemoryRouter>
        <AIContextDialog open={true} onOpenChange={() => {}} />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "4. Modelo LLM" }));
    expect(screen.getByRole("button", { name: /Conectar com OpenRouter/ })).toBeInTheDocument();
    expect(screen.getByText("Já tenho uma chave")).toBeInTheDocument();
  });

  it("reinicia etapa, contexto e chave quando a sessão do usuário muda", () => {
    routeData.collecting = {
      business_summary: "Empresa A",
      company_objective: "Objetivo A",
      analytics_goal: "Análise A",
    } as CollectingDataEnterprise;
    routeData.iaConfig = {
      hasKey: false,
      provider: "openrouter",
      model: null,
      keyHint: null,
    };

    const { rerender } = render(
      <MemoryRouter>
        <AIContextDialog open={true} onOpenChange={() => {}} />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "4. Modelo LLM" }));
    fireEvent.change(screen.getByLabelText("Chave da API OpenRouter"), {
      target: { value: "sk-chave-da-empresa-a" },
    });
    fireEvent.click(screen.getByRole("button", { name: "1. Resumo do Negócio" }));
    fireEvent.change(screen.getByPlaceholderText(/Rede de clínicas odontológicas/), {
      target: { value: "Edição da empresa A" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Próximo Passo" }));
    expect(screen.getByText(/Passo 2 de 4/)).toBeInTheDocument();

    routeData.user = { id: "user-2" };
    routeData.collecting = {
      business_summary: "Empresa B",
      company_objective: "Objetivo B",
      analytics_goal: "Análise B",
    } as CollectingDataEnterprise;
    routeData.iaConfig = {
      hasKey: false,
      provider: "openrouter",
      model: null,
      keyHint: null,
    };
    rerender(
      <MemoryRouter>
        <AIContextDialog open={true} onOpenChange={() => {}} />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Passo 1 de 4/)).toBeInTheDocument();
    expect(screen.getByText(/Passo 1 de 4/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "4. Modelo LLM" }));
    expect(screen.getByLabelText("Chave da API OpenRouter")).toHaveValue("");
    fireEvent.click(screen.getByRole("button", { name: "1. Resumo do Negócio" }));
    expect(screen.getByPlaceholderText(/Rede de clínicas odontológicas/)).toHaveValue("Empresa B");
  });

  it("mapeia o guia móvel para a barra inferior e o menu central", () => {
    expect(INTERACTIVE_STEPS.map((step) => step.mobileSelector ?? step.selector).slice(0, 13)).toEqual([
      '[data-tour="mobile-nav-dashboard"]',
      // As seções do Dashboard e as abas da Análise dos comentários aparecem também no celular.
      '[data-tour="tour-period"]',
      '[data-tour="tour-dashboard-diagnosis"]',
      '[data-tour="tour-star-ratings"]',
      '[data-tour="tour-movement"]',
      '[data-tour="tour-form-questions"]',
      '[data-tour="tour-dashboard-comments"]',
      '[data-tour="tour-comments-overview"]',
      '[data-tour="tour-comments-list"]',
      '[data-tour="tour-compare-items"]',
      '[data-tour="tour-ratings-page"]',
      '[data-tour="mobile-nav-feedback"]',
      '[data-tour="mobile-nav-catalog"]',
    ]);
    expect(INTERACTIVE_STEPS[13]).toMatchObject({
      mobileSelector: '[data-tour="mobile-nav-ia-settings"]',
      openMobileDrawer: true,
    });
    expect(INTERACTIVE_STEPS[14]).toMatchObject({
      mobileSelector: '[data-tour="mobile-nav-profile"]',
      openMobileDrawer: true,
    });
  });

  it("no celular, o balão compacto fica preso embaixo da tela, com texto curto e os botões à vista", async () => {
    systemGuide.get.mockResolvedValue({
      tourKey: "system-guide", version: 1, status: "pending", finishedAt: null,
    });
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: true,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })) as unknown as typeof window.matchMedia;

    try {
      render(
        <MemoryRouter initialEntries={["/user/dashboard"]}>
          <OnboardingProvider
            collecting={{ business_summary: "Resumo", company_objective: "Objetivo", analytics_goal: "Analítico" } as CollectingDataEnterprise}
            sessionKey="user-1"
          >
            <UserInteractiveTour />
            <StartWhenPending />
          </OnboardingProvider>
        </MemoryRouter>,
      );

      const card = (await screen.findByText("Dashboard de Resultados")).closest("[style]") as HTMLElement;
      expect(card.style.bottom).toContain("16px");
      expect(card.className).toContain("max-h-[45dvh]");
      expect(screen.getByText("Próximo")).toBeInTheDocument();

      // Balão compacto: texto curto, contador e barra de progresso no lugar dos 16 pontos.
      expect(screen.getByText("Na barra de baixo, toque em Visão geral para ver os principais números.")).toBeInTheDocument();
      expect(screen.getByText("1/16")).toBeInTheDocument();
      expect(screen.getByRole("progressbar", { name: "Progresso do guia" })).toHaveAttribute("aria-valuenow", "1");
      expect(screen.queryByRole("button", { name: "Ir para passo 2" })).not.toBeInTheDocument();

      // "Ver mais" mostra o texto completo do passo.
      fireEvent.click(screen.getByRole("button", { name: "Ver mais" }));
      expect(screen.getByText(/acompanhar os indicadores principais da sua empresa/)).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Ver menos" }));
      expect(screen.getByText("Na barra de baixo, toque em Visão geral para ver os principais números.")).toBeInTheDocument();
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });

  it("o total de passos do tour acompanha a lista de passos", () => {
    expect(INTERACTIVE_STEPS).toHaveLength(TOUR_STEPS_COUNT);
    // No celular, cada passo tem um texto curto (até ~2 linhas) para o balão compacto.
    for (const step of INTERACTIVE_STEPS) {
      expect(step.mobileSummary?.length ?? 0).toBeGreaterThan(0);
      expect(step.mobileSummary!.length).toBeLessThanOrEqual(110);
    }
  });

  it("o guia só fica pendente depois da configuração inicial e não abre sozinho", async () => {
    systemGuide.get.mockResolvedValue({
      tourKey: "system-guide", version: 1, status: "pending", finishedAt: null,
    });
    const completeCollecting = {
      business_summary: "Resumo",
      company_objective: "Objetivo",
      analytics_goal: "Analítico",
    } as CollectingDataEnterprise;

    // Como o UserOnboardingManager: marca no próprio efeito, que roda antes do provider.
    function SetupProbe() {
      const { setInitialSetupRunning } = useOnboarding();
      useEffect(() => { setInitialSetupRunning(true); }, [setInitialSetupRunning]);
      return <button onClick={() => setInitialSetupRunning(false)}>Concluir configuração</button>;
    }

    render(
      <MemoryRouter initialEntries={["/user/dashboard"]}>
        <OnboardingProvider collecting={completeCollecting} sessionKey="user-1">
          <SetupProbe />
          <TestConsumer />
        </OnboardingProvider>
      </MemoryRouter>
    );

    await waitFor(() => expect(systemGuide.get).toHaveBeenCalled());
    await act(async () => {});
    expect(screen.getByTestId("guide-pending")).toHaveTextContent("false");

    fireEvent.click(screen.getByText("Concluir configuração"));
    // Depois da configuração o guia fica pendente para o convite, mas não abre sozinho.
    await waitFor(() => expect(screen.getByTestId("guide-pending")).toHaveTextContent("true"));
    expect(screen.getByTestId("tour-active")).toHaveTextContent("false");
  });

  it("permite navegar pelos passos do Tour Interativo Spotlight e pular a introdução", async () => {
    systemGuide.get.mockResolvedValue({
      tourKey: "system-guide", version: 1, status: "pending", finishedAt: null,
    });
    const completeCollecting = {
      business_summary: "Resumo",
      company_objective: "Objetivo",
      analytics_goal: "Analítico",
    } as CollectingDataEnterprise;

    render(
      <MemoryRouter initialEntries={["/user/dashboard"]}>
        <OnboardingProvider collecting={completeCollecting} sessionKey="user-1">
          <UserInteractiveTour />
          <StartWhenPending />
        </OnboardingProvider>
      </MemoryRouter>
    );

    // Tour começa apenas após a confirmação de pending pelo servidor.
    expect(await screen.findByText("Dashboard de Resultados")).toBeInTheDocument();
    // Com 16 passos, o contador fica numa linha própria, ao lado dos pontos.
    expect(screen.getByText("1 de 16")).toBeInTheDocument();

    // Escopo e período, as seções do Dashboard e depois cada página da Análise dos comentários.
    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Escopo e período")).toBeInTheDocument();
    expect(screen.getByText(/Comparar com o período anterior/)).toBeInTheDocument();

    // A visão do conjunto vem logo depois: o diagnóstico fica no topo do Dashboard.
    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Diagnóstico do escopo ✨ IA")).toBeInTheDocument();
    expect(screen.getByText(/o que fazer primeiro, sempre com o número/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Avaliação por estrelas")).toBeInTheDocument();
    expect(screen.getByText(/A etiqueta no canto diz de qual escopo/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Movimento das avaliações")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Perguntas do formulário")).toBeInTheDocument();
    expect(screen.getByText(/mesmo sem a IA configurada/)).toBeInTheDocument();

    // O card do Dashboard vem antes de ir para as páginas da análise.
    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Análise dos comentários ✨ IA")).toBeInTheDocument();
    expect(screen.getByText(/A análise completa fica na página Análise dos comentários/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Visão geral da análise")).toBeInTheDocument();
    expect(screen.getByText(/pelo menos 10 feedbacks/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Comentários")).toBeInTheDocument();
    expect(screen.getByText(/a nota e o texto não combinam/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Comparar itens")).toBeInTheDocument();
    expect(screen.getByText(/a partir de 2 itens do mesmo tipo/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Todas as métricas de estrelas")).toBeInTheDocument();
    expect(screen.getByText(/os clientes que voltam/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Avaliação da empresa")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Catálogo da Empresa")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Configuração de IA")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Acesse seu Perfil")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Dados e configurações da empresa")).toBeInTheDocument();
    expect(screen.getByText(/Os produtos, serviços e departamentos que seus clientes avaliam se ativam no Catálogo/)).toBeInTheDocument();

    // Pular tour
    fireEvent.click(screen.getByText("Pular"));
    await waitFor(() => expect(screen.queryByText("Dados e configurações da empresa")).not.toBeInTheDocument());
    expect(systemGuide.update).toHaveBeenCalledWith({ version: 1, status: "skipped" });
  });

  it("mantém o guia aberto e permite nova tentativa quando o salvamento falha", async () => {
    systemGuide.get.mockResolvedValue({
      tourKey: "system-guide", version: 1, status: "pending", finishedAt: null,
    });
    systemGuide.update.mockRejectedValueOnce(new Error("offline"));
    const completeCollecting = {
      business_summary: "Resumo", company_objective: "Objetivo", analytics_goal: "Analítico",
    } as CollectingDataEnterprise;

    render(
      <MemoryRouter initialEntries={["/user/dashboard"]}>
        <OnboardingProvider
          collecting={completeCollecting}
          iaConfig={{ hasKey: true, provider: "openrouter", model: "openrouter/auto", keyHint: "1234" }}
          sessionKey="user-1"
        >
          <UserInteractiveTour />
          <StartWhenPending />
        </OnboardingProvider>
      </MemoryRouter>,
    );

    await screen.findByText("Dashboard de Resultados");
    fireEvent.click(screen.getByText("Pular"));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível salvar o guia");
    expect(screen.getByText("Dashboard de Resultados")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Pular"));
    await waitFor(() => expect(screen.queryByText("Dashboard de Resultados")).not.toBeInTheDocument());
    expect(systemGuide.update).toHaveBeenLastCalledWith({ version: 1, status: "skipped" });
  });

  describe("conclusão do guia", () => {
    function LocationProbe() {
      return <span data-testid="pathname">{useLocation().pathname}</span>;
    }

    async function goToLastStep() {
      systemGuide.get.mockResolvedValue({
        tourKey: "system-guide", version: 1, status: "pending", finishedAt: null,
      });
      const completeCollecting = {
        business_summary: "Resumo", company_objective: "Objetivo", analytics_goal: "Analítico",
      } as CollectingDataEnterprise;
      render(
        <MemoryRouter initialEntries={["/user/dashboard"]}>
          <OnboardingProvider collecting={completeCollecting} sessionKey="user-1">
            <UserInteractiveTour />
            <StartWhenPending />
          <StartWhenPending />
            <LocationProbe />
          </OnboardingProvider>
        </MemoryRouter>,
      );
      await screen.findByText("Dashboard de Resultados");
      for (let step = 1; step < INTERACTIVE_STEPS.length; step += 1) {
        fireEvent.click(screen.getByText("Próximo"));
      }
      expect(screen.getByText("Dados e configurações da empresa")).toBeInTheDocument();
      expect(screen.getByTestId("pathname")).toHaveTextContent("/user/profile");
    }

    it("ao concluir, grava o status e leva o usuário ao dashboard", async () => {
      await goToLastStep();
      fireEvent.click(screen.getByText("Entendi"));
      await waitFor(() => expect(screen.getByTestId("pathname")).toHaveTextContent("/user/dashboard"));
      expect(systemGuide.update).toHaveBeenCalledWith({ version: 1, status: "completed" });
      expect(screen.queryByText("Dados e configurações da empresa")).not.toBeInTheDocument();
    });

    it("ao pular no meio do guia, grava o status e leva o usuário ao dashboard", async () => {
      await goToLastStep();
      fireEvent.click(screen.getByText("Pular"));
      await waitFor(() => expect(screen.getByTestId("pathname")).toHaveTextContent("/user/dashboard"));
      expect(systemGuide.update).toHaveBeenCalledWith({ version: 1, status: "skipped" });
    });

    it("se pular não for gravado, continua no guia e na página atual", async () => {
      systemGuide.update.mockRejectedValueOnce(new Error("offline"));
      await goToLastStep();
      fireEvent.click(screen.getByText("Pular"));
      expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível salvar o guia");
      expect(screen.getByTestId("pathname")).toHaveTextContent("/user/profile");
    });

    it("se a conclusão não for gravada, continua no guia e na página atual", async () => {
      systemGuide.update.mockRejectedValueOnce(new Error("offline"));
      await goToLastStep();
      fireEvent.click(screen.getByText("Entendi"));
      expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível salvar o guia");
      expect(screen.getByTestId("pathname")).toHaveTextContent("/user/profile");
      expect(screen.getByText("Dados e configurações da empresa")).toBeInTheDocument();
    });
  });
});
