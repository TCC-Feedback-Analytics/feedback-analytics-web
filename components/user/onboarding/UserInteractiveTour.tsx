import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useOnboarding, TOUR_STEPS_COUNT } from "src/lib/context/onboardingContext";
import {
  FaChartPie,
  FaWandMagicSparkles,
  FaSliders,
  FaChevronLeft,
  FaChevronRight,
  FaXmark,
} from "react-icons/fa6";

export interface TourStepData {
  selector: string;
  route: string;
  title: string;
  icon: React.ElementType;
  description: string;
}

export const INTERACTIVE_STEPS: TourStepData[] = [
  {
    selector: '[data-tour="nav-dashboard"]',
    route: "/user/dashboard",
    title: "Dashboard de Resultados",
    icon: FaChartPie,
    description: "Acompanhe os principais indicadores e métricas da sua empresa em tempo real.",
  },
  {
    selector: '[data-tour="nav-insights"]',
    route: "/user/insights/reports",
    title: "Insights com IA",
    icon: FaWandMagicSparkles,
    description: "Veja diagnósticos automáticos e análises de sentimento das avaliações dos clientes.",
  },
  {
    selector: '[data-tour="ai-context-steps"]',
    route: "/user/edit/collecting-data-enterprise",
    title: "Contexto de IA",
    icon: FaSliders,
    description: "Configure os dados da sua empresa no perfil para personalizar os relatórios da IA.",
  },
];

interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function UserInteractiveTour() {
  const { isTourActive, currentTourStep, nextTourStep, prevTourStep, skipTour, goToStep } =
    useOnboarding();
  const navigate = useNavigate();
  const location = useLocation();

  const [rect, setRect] = useState<ElementRect | null>(null);
  const stepData = INTERACTIVE_STEPS[currentTourStep] || INTERACTIVE_STEPS[0];
  const IconComponent = stepData.icon;
  const isLast = currentTourStep === TOUR_STEPS_COUNT - 1;

  // Garante troca automática de rota se o passo atual pertencer a outra tela
  useEffect(() => {
    if (!isTourActive) return;
    if (location.pathname !== stepData.route) {
      navigate(stepData.route);
    }
  }, [isTourActive, currentTourStep, stepData.route, location.pathname, navigate]);

  // Função para recalcular as dimensões e posição do elemento destacado (spotlight)
  const updateSpotlight = useCallback(() => {
    if (!isTourActive) return;

    const el = document.querySelector(stepData.selector);
    if (el) {
      const bounds = el.getBoundingClientRect();
      setRect({
        top: bounds.top + window.scrollY,
        left: bounds.left + window.scrollX,
        width: bounds.width,
        height: bounds.height,
      });
    } else {
      setRect(null); // Fallback centralizado se elemento não for encontrado no DOM
    }
  }, [isTourActive, stepData.selector]);

  useEffect(() => {
    updateSpotlight();
    const timer = setTimeout(updateSpotlight, 200);
    const interval = setInterval(updateSpotlight, 800);
    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight);
    };
  }, [updateSpotlight, currentTourStep, location.pathname]);

  if (!isTourActive) return null;

  // Cálculo de posição inteligente do balão flutuante (mais compacto e sem cobrir a tela)
  const popoverStyle: React.CSSProperties = (() => {
    if (!rect) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const popoverWidth = 360;
    const padding = 16;
    const isBelowScreenMid = rect.top > window.innerHeight / 2;

    let top = isBelowScreenMid ? rect.top - 200 : rect.top + rect.height + 12;
    let left = Math.max(padding, rect.left + rect.width / 2 - popoverWidth / 2);

    if (left + popoverWidth > window.innerWidth - padding) {
      left = window.innerWidth - popoverWidth - padding;
    }

    if (top < padding) top = padding;

    return {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
    };
  })();

  const handleActionClick = () => {
    if (location.pathname !== stepData.route) {
      navigate(stepData.route);
    }
    nextTourStep();
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Máscara de Fundo Ultra-Translúcida (0.12) sem blur para nitidez e visibilidade total da página do site */}
      <svg className="absolute inset-0 h-full w-full pointer-events-auto">
        <defs>
          <mask id="tour-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - 6}
                y={rect.top - 6}
                width={rect.width + 12}
                height={rect.height + 12}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>

        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.12)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Anel de Destaque Pulsante em volta do elemento alvo */}
      {rect && (
        <div
          style={{
            top: `${rect.top - 6}px`,
            left: `${rect.left - 6}px`,
            width: `${rect.width + 12}px`,
            height: `${rect.height + 12}px`,
          }}
          className="fixed z-50 pointer-events-none rounded-2xl border-2 border-(--primary-color) shadow-[0_0_24px_rgba(62,217,227,0.7)] animate-pulse"
        />
      )}

      {/* Balão Simplificado, Direto e Intuitivo */}
      <div
        style={popoverStyle}
        className="pointer-events-auto z-50 w-[calc(100vw-32px)] max-w-[360px] rounded-2xl border border-(--primary-color)/30 bg-(--bg-secondary) p-4 shadow-xl backdrop-blur-md transition-all duration-200"
      >
        {/* Topo do Balão */}
        <div className="flex items-center justify-between border-b border-(--quaternary-color)/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-(--primary-color)/15 text-(--primary-color) ring-1 ring-(--primary-color)/30 text-xs font-bold">
              <IconComponent className="text-xs" />
            </span>
            <h3 className="font-montserrat text-sm font-bold text-(--text-primary)">
              {stepData.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={skipTour}
            className="flex items-center gap-1 rounded-lg p-1 text-xs text-(--text-tertiary) hover:bg-(--seventh-color) hover:text-(--text-primary) transition-colors"
            title="Pular introdução"
          >
            <span className="text-[11px] font-medium">Pular</span>
            <FaXmark className="text-xs" />
          </button>
        </div>

        {/* Descrição Concisa (1 linha de orientação direta) */}
        <div className="py-3">
          <p className="font-inter text-xs leading-relaxed text-(--text-secondary)">
            {stepData.description}
          </p>
        </div>

        {/* Rodapé Compacto */}
        <div className="flex items-center justify-between border-t border-(--quaternary-color)/10 pt-2.5">
          {/* Contador por pontos */}
          <div className="flex items-center gap-1">
            {INTERACTIVE_STEPS.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToStep(index)}
                aria-label={`Ir para passo ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentTourStep
                    ? "w-4 bg-(--primary-color)"
                    : "w-1.5 bg-(--quaternary-color)/25 hover:bg-(--quaternary-color)/50"
                }`}
              />
            ))}
          </div>

          {/* Botões de Ação Diretos */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prevTourStep}
              disabled={currentTourStep === 0}
              className="btn-ghost font-poppins flex items-center gap-1 px-2.5 py-1 text-xs font-medium disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <FaChevronLeft className="text-[9px]" />
              Anterior
            </button>

            <button
              type="button"
              onClick={handleActionClick}
              className="btn-primary font-poppins flex items-center gap-1 px-3.5 py-1 text-xs font-semibold shadow-xs"
            >
              <span>{isLast ? "Entendi" : "Próximo"}</span>
              {!isLast && <FaChevronRight className="text-[9px]" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
