import type { ElementType } from "react";
import { FaChartPie, FaWandMagicSparkles, FaSliders } from "react-icons/fa6";

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
    selector: '[data-tour="ai-context-steps"]',
    route: "/user/edit/collecting-data-enterprise",
    title: "Contexto de IA",
    icon: FaSliders,
    description: "Configure os dados da sua empresa no perfil para personalizar os relatórios da IA.",
  },
];
