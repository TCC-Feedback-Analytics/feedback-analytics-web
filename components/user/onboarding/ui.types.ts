import type { ElementType } from "react";
import {
  FaChartPie,
  FaWandMagicSparkles,
  FaCommentDots,
  FaBoxesStacked,
  FaBrain,
  FaUser,
  FaSliders,
} from "react-icons/fa6";

export interface AIContextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMandatory?: boolean;
}

export interface UserInteractiveTourProps {
  onOpenMobileDrawer?: () => void;
  onCloseMobileDrawer?: () => void;
}

export interface TourStepData {
  selector: string;
  mobileSelector?: string;
  route: string;
  title: string;
  icon: ElementType;
  description: string;
  mobileDescription?: string;
  openMobileDrawer?: boolean;
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
    mobileSelector: '[data-tour="mobile-nav-dashboard"]',
    route: "/user/dashboard",
    title: "Dashboard de Resultados",
    icon: FaChartPie,
    description: "Acompanhe os principais indicadores e métricas da sua empresa em tempo real.",
    mobileDescription: "Na barra inferior, toque em Visão geral para acompanhar os indicadores principais da sua empresa.",
  },
  {
    selector: '[data-tour="nav-insights"]',
    mobileSelector: '[data-tour="mobile-nav-insights"]',
    route: "/user/insights/reports",
    title: "Insights com IA",
    icon: FaWandMagicSparkles,
    description: "Veja diagnósticos automáticos e análises de sentimento das avaliações dos clientes.",
    mobileDescription: "Na barra inferior, toque em Insights para ver os diagnósticos e análises feitas pela IA.",
  },
  {
    selector: '[data-tour="tour-feedback-general"]',
    mobileSelector: '[data-tour="mobile-nav-feedback"]',
    route: "/user/edit/feedback-general",
    title: "Feedback Geral",
    icon: FaCommentDots,
    description: "Configure as perguntas globais da empresa e ative o QR Code geral de avaliação.",
    mobileDescription: "Na barra inferior, toque em Feedback para configurar as perguntas e o QR Code geral.",
  },
  {
    selector: '[data-tour="tour-catalog"]',
    mobileSelector: '[data-tour="mobile-nav-catalog"]',
    route: "/user/edit/types-feedback",
    title: "Catálogo da Empresa",
    icon: FaBoxesStacked,
    description: "Ative os tipos de feedback e gerencie o catálogo de produtos, serviços e setores.",
    mobileDescription: "Na barra inferior, toque em Catálogo para gerenciar produtos, serviços e setores.",
  },
  {
    selector: '[data-tour="ia-settings-form"]',
    mobileSelector: '[data-tour="mobile-nav-ia-settings"]',
    route: "/user/edit/ia-settings",
    title: "Configuração de IA",
    icon: FaBrain,
    description: "Cadastre sua chave OpenRouter e selecione o modelo LLM que fará as análises da empresa.",
    mobileDescription: "No botão central da barra inferior, abra o menu e toque em Configuração de IA para definir a chave e o modelo.",
    openMobileDrawer: true,
  },
  {
    selector: '[data-tour="account-menu-trigger"]',
    mobileSelector: '[data-tour="mobile-nav-profile"]',
    route: "/user/edit/ia-settings",
    title: "Acesse seu Perfil",
    icon: FaUser,
    description: "Use este botão, no canto superior direito, para abrir o menu da conta e entrar no seu Perfil.",
    mobileDescription: "No botão central da barra inferior, abra o menu e toque em Meu Perfil para acessar seus dados.",
    openMobileDrawer: true,
  },
  {
    selector: '[data-tour="profile-company-heading"]',
    route: "/user/profile",
    title: "Dados e configurações da empresa",
    icon: FaSliders,
    description: "No Perfil, acesse esta seção para visualizar o cadastro e editar os escopos operacionais e o contexto de IA.",
  },
];
