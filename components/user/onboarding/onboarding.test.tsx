import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { OnboardingProvider, useOnboarding } from "src/lib/context/onboardingContext";
import AIContextDialog from "./AIContextDialog";
import UserInteractiveTour from "./UserInteractiveTour";
import { INTERACTIVE_STEPS } from "./ui.types";
import type { CollectingDataEnterprise } from "lib/interfaces/entities/enterprise.entity";

const systemGuide = vi.hoisted(() => ({ get: vi.fn(), update: vi.fn() }));

vi.mock("src/services/serviceSystemGuide", () => ({
  ServiceGetSystemGuide: systemGuide.get,
  ServiceUpdateSystemGuide: systemGuide.update,
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useRouteLoaderData: () => ({
      collecting: null,
    }),
    useFetcher: () => ({
      state: "idle",
      data: undefined,
      Form: (props: React.FormHTMLAttributes<HTMLFormElement>) => <form {...props} />,
      submit: vi.fn(),
    }),
  };
});

vi.mock("src/hooks/useIaModels", () => ({
  useIaModels: () => ({
    catalog: { models: [], source: "public", fetchedAt: "", stale: false, currentModel: null, currentModelAvailable: null },
    loading: false,
    error: undefined,
    reload: vi.fn(),
  }),
}));

function TestConsumer() {
  const { isTourActive, currentTourStep, hasCompletedAIContext, hasCompletedAISetup, startTour, skipTour } =
    useOnboarding();
  return (
    <div>
      <span data-testid="context-completed">{String(hasCompletedAIContext)}</span>
      <span data-testid="ai-setup-completed">{String(hasCompletedAISetup)}</span>
      <span data-testid="tour-active">{String(isTourActive)}</span>
      <span data-testid="tour-step">{currentTourStep}</span>
      <button onClick={startTour}>Start Tour</button>
      <button onClick={skipTour}>Skip Tour</button>
    </div>
  );
}

describe("[Unidade] Componentes e Contexto de Onboarding", () => {
  beforeEach(() => {
    // Os testes que não exercitam o tour não precisam avançar a leitura assíncrona.
    systemGuide.get.mockReset().mockImplementation(() => new Promise(() => {}));
    systemGuide.update.mockReset().mockImplementation(async ({ version, status }) => ({
      tourKey: "system-guide", version, status, finishedAt: "2026-01-01T00:00:00.000Z",
    }));
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

  it("mantém a configuração inicial aberta até uma LLM estar configurada", () => {
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

  it("permite navegar pelos passos do AIContextDialog (1 -> 2 -> 3 -> 4)", () => {
    render(
      <MemoryRouter>
        <OnboardingProvider collecting={null} sessionKey="user-1">
          <AIContextDialog open={true} onOpenChange={() => {}} isMandatory={false} />
        </OnboardingProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("1. Resumo do Negócio")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Próximo Passo"));
    expect(screen.getByText("2. Objetivo da Empresa")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Próximo Passo"));
    expect(screen.getByText("3. Objetivo Analítico")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Próximo Passo"));
    expect(screen.getByText("Configure a LLM da empresa")).toBeInTheDocument();
  });

  it("mapeia o guia móvel para a barra inferior e o menu central", () => {
    expect(INTERACTIVE_STEPS.slice(0, 4).map((step) => step.mobileSelector)).toEqual([
      '[data-tour="mobile-nav-dashboard"]',
      '[data-tour="mobile-nav-insights"]',
      '[data-tour="mobile-nav-feedback"]',
      '[data-tour="mobile-nav-catalog"]',
    ]);
    expect(INTERACTIVE_STEPS[4]).toMatchObject({
      mobileSelector: '[data-tour="mobile-nav-ia-settings"]',
      openMobileDrawer: true,
    });
    expect(INTERACTIVE_STEPS[5]).toMatchObject({
      mobileSelector: '[data-tour="mobile-nav-profile"]',
      openMobileDrawer: true,
    });
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
        <OnboardingProvider
          collecting={completeCollecting}
          iaConfig={{ hasKey: true, provider: "openrouter", model: "openrouter/auto", keyHint: "1234" }}
          sessionKey="user-1"
        >
          <UserInteractiveTour />
        </OnboardingProvider>
      </MemoryRouter>
    );

    // Tour começa apenas após a confirmação de pending pelo servidor.
    expect(await screen.findByText("Dashboard de Resultados")).toBeInTheDocument();

    // Avançar para o passo 2
    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Insights com IA")).toBeInTheDocument();

    // Avançar para o passo 3
    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Feedback Geral")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Catálogo da Empresa")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Configuração de IA")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Acesse seu Perfil")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Dados e configurações da empresa")).toBeInTheDocument();

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
});
