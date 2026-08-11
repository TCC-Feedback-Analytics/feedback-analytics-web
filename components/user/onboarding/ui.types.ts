import type { ElementType } from "react";
import {
  FaChartPie,
  FaWandMagicSparkles,
  FaCommentDots,
  FaBoxesStacked,
  FaSliders,
} from "react-icons/fa6";

export interface AIContextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMandatory?: boolean;
}

export interface TourStepData {
  selector: string;
  route: string;
  title: string;
  icon: ElementType;
  description: string;
}

export interface ElementRect {
  top: number;
  left: number;
  width: number;
  height: number;
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
    selector: '[data-tour="tour-feedback-general"]',
    route: "/user/edit/feedback-general",
    title: "Feedback Geral",
    icon: FaCommentDots,
    description: "Configure as perguntas globais da empresa e ative o QR Code geral de avaliação.",
  },
  {
    selector: '[data-tour="tour-catalog"]',
    route: "/user/edit/types-feedback",
    title: "Catálogo da Empresa",
    icon: FaBoxesStacked,
    description: "Ative os tipos de feedback e gerencie o catálogo de produtos, serviços e setores.",
  },
  {
    selector: '[data-tour="ai-context-steps"]',
    route: "/user/edit/collecting-data-enterprise",
    title: "Dados da Empresa",
    icon: FaSliders,
    description: "Defina os escopos operacionais da empresa para ajustar as opções de coleta.",
  },
];
