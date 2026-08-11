import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { OnboardingProvider, useOnboarding } from "src/lib/context/onboardingContext";
import AIContextDialog from "./AIContextDialog";
import UserInteractiveTour from "./UserInteractiveTour";
import type { CollectingDataEnterprise } from "lib/interfaces/entities/enterprise.entity";

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

function TestConsumer() {
  const { isTourActive, currentTourStep, hasCompletedAIContext, startTour, skipTour } =
    useOnboarding();
  return (
    <div>
      <span data-testid="context-completed">{String(hasCompletedAIContext)}</span>
      <span data-testid="tour-active">{String(isTourActive)}</span>
      <span data-testid="tour-step">{currentTourStep}</span>
      <button onClick={startTour}>Start Tour</button>
      <button onClick={skipTour}>Skip Tour</button>
    </div>
  );
}

describe("[Unidade] Componentes e Contexto de Onboarding", () => {
  beforeEach(() => {
    localStorage.clear();
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
        <OnboardingProvider collecting={collecting}>
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
        <OnboardingProvider collecting={collecting}>
          <TestConsumer />
        </OnboardingProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId("context-completed")).toHaveTextContent("true");
  });

  it("renderiza o AIContextDialog em modo obrigatório quando ativado", () => {
    render(
      <MemoryRouter>
        <OnboardingProvider collecting={null}>
          <AIContextDialog open={true} onOpenChange={() => {}} isMandatory={true} />
        </OnboardingProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Contexto para Inteligência Artificial")).toBeInTheDocument();
    expect(screen.getByText("Obrigatório")).toBeInTheDocument();
    expect(screen.queryByLabelText("Fechar")).not.toBeInTheDocument();
  });

  it("permite navegar pelos passos do AIContextDialog (1 -> 2 -> 3)", () => {
    render(
      <MemoryRouter>
        <OnboardingProvider collecting={null}>
          <AIContextDialog open={true} onOpenChange={() => {}} isMandatory={false} />
        </OnboardingProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("1. Resumo do Negócio")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Próximo Passo"));
    expect(screen.getByText("2. Objetivo da Empresa")).toBeInTheDocument();
  });

  it("permite navegar pelos passos do Tour Interativo Spotlight e pular a introdução", () => {
    const completeCollecting = {
      business_summary: "Resumo",
      company_objective: "Objetivo",
      analytics_goal: "Analítico",
    } as CollectingDataEnterprise;

    render(
      <MemoryRouter initialEntries={["/user/dashboard"]}>
        <OnboardingProvider collecting={completeCollecting}>
          <UserInteractiveTour />
        </OnboardingProvider>
      </MemoryRouter>
    );

    // Tour começa ativo para novos acessos no passo 1
    expect(screen.getByText("Dashboard de Resultados")).toBeInTheDocument();

    // Avançar para o passo 2
    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Insights com IA")).toBeInTheDocument();

    // Avançar para o passo 3
    fireEvent.click(screen.getByText("Próximo"));
    expect(screen.getByText("Feedback Geral")).toBeInTheDocument();

    // Pular tour
    fireEvent.click(screen.getByText("Pular"));
    expect(screen.queryByText("Feedback Geral")).not.toBeInTheDocument();
    expect(localStorage.getItem("feedback_onboarding_tour_seen")).toBe("true");
  });
});
