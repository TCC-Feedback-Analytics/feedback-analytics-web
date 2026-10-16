import type { ElementType } from "react";
import {
  FaChartPie,
  FaChartSimple,
  FaList,
  FaStar,
  FaCircleQuestion,
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
  /** Na edição do perfil, o fechamento só acontece após salvar o contexto. */
  closeOnlyAfterSave?: boolean;
  /** Chamado quando o contexto é salvo pelo usuário; diz se a LLM ficou configurada. */
  onSetupSaved?: (info: { llmConfigured: boolean }) => void;
}

export type InitialSetupItemStatus = "done" | "running" | "failed";

export interface SetupOrbProps {
  status: InitialSetupItemStatus;
}

export interface InitialSetupProgressItemProps {
  status: InitialSetupItemStatus;
  label: string;
  detail?: string;
}

export interface InitialSetupProgressDialogProps {
  open: boolean;
  /** Fecha a tela; o usuário segue para o dashboard ou para a Configuração de IA. */
  onFinish: (destination: "dashboard" | "ia-settings") => void;
  model: string | null;
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
  // As seções do Dashboard e as abas da Análise dos comentários aparecem também
  // no celular: o mesmo alvo vale nos dois tamanhos.
  {
    selector: '[data-tour="tour-star-ratings"]',
    route: "/user/dashboard",
    title: "Avaliação por estrelas",
    icon: FaStar,
    description: "A nota de 1 a 5 que os clientes marcaram: a média, as avaliações positivas (4–5★) e as críticas (1–2★). A etiqueta no canto diz de qual escopo são os números; clique nela para trocar. Em \"Ver todas as métricas de estrelas\" ficam a distribuição completa e as neutras.",
  },
  {
    selector: '[data-tour="tour-form-questions"]',
    route: "/user/dashboard",
    title: "Perguntas do formulário",
    icon: FaCircleQuestion,
    description: "Cada pergunta do seu formulário aparece aqui, na ordem, com a nota, as respostas e o % de satisfeitos. Clique em \"Ver todas as métricas desta pergunta\" para ver as subperguntas. Usa as respostas dos clientes, mesmo sem a IA configurada.",
  },
  {
    selector: '[data-tour="tour-comments-overview"]',
    route: "/user/insights/overview",
    title: "Análise dos comentários",
    icon: FaChartSimple,
    description: "A IA lê o que os clientes escreveram e mostra o tom dos comentários, os assuntos que mais impactam e um resumo com recomendações para a empresa, um produto, um serviço ou um setor. Para atualizar, use Analisar comentários com IA. É preciso ter a IA configurada, o contexto da empresa preenchido e pelo menos 10 feedbacks no escopo escolhido.",
  },
  {
    selector: '[data-tour="tour-comments-list"]',
    route: "/user/insights/comments",
    title: "Comentários",
    icon: FaList,
    description: "Todos os comentários já analisados pela IA, com filtros por tom (positivos, neutros e negativos) e para quando a nota e o texto não combinam.",
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
    description: "Informe se sua empresa tem produtos, oferece serviços ou possui áreas e departamentos. Essas escolhas definem o que seus clientes poderão avaliar.",
  },
];
