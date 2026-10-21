import type { ElementType } from "react";
import type { GuideInviteVariant } from "src/lib/utils/guideInvite";
import {
  FaChartPie,
  FaChartSimple,
  FaList,
  FaStar,
  FaWandMagicSparkles,
  FaCircleQuestion,
  FaCommentDots,
  FaBoxesStacked,
  FaBrain,
  FaUser,
  FaSliders,
  FaCalendarDays,
  FaScaleBalanced,
  FaChartColumn,
  FaRankingStar,
  FaClipboardCheck,
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

export interface GuideInviteDialogProps {
  /** null: fechado. first-feedback: no primeiro feedback; later: numa próxima sessão. */
  variant: GuideInviteVariant | null;
  onStart: () => void;
  onLater: () => void;
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
  /** Texto curto do balão compacto no celular; o completo fica no "Ver mais". */
  mobileSummary?: string;
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
    mobileSummary: "Na barra de baixo, toque em Visão geral para ver os principais números.",
    icon: FaChartPie,
    description: "Acompanhe os principais indicadores e métricas da sua empresa em tempo real.",
    mobileDescription: "Na barra inferior, toque em Visão geral para acompanhar os indicadores principais da sua empresa.",
  },
  // As seções do Dashboard e as abas da Análise dos comentários aparecem também
  // no celular: o mesmo alvo vale nos dois tamanhos.
  {
    selector: '[data-tour="tour-period"]',
    route: "/user/dashboard",
    title: "Escopo e período",
    mobileSummary: "Escolha de quem são os números e o período. Ligue a comparação para ver se melhorou ou piorou.",
    icon: FaCalendarDays,
    description: "Aqui você escolhe de quem são os números (a empresa ou um item do catálogo) e de quando: todo o período, os últimos 7 ou 30 dias, 3 ou 6 meses, ou as datas que quiser. Com um período escolhido, ligue \"Comparar com o período anterior\" para ver em cada métrica se melhorou (▲ verde) ou piorou (▼ vermelho). \"Diferença incerta\" quer dizer que ainda há poucas avaliações para ter certeza.",
  },
  {
    selector: '[data-tour="tour-dashboard-diagnosis"]',
    route: "/user/dashboard",
    title: "Diagnóstico do escopo ✨ IA",
    mobileSummary: "A IA junta todos os números do período e diz o que fazer primeiro, com a prova de cada ponto.",
    icon: FaClipboardCheck,
    description: "A IA lê de uma vez os números do escopo no período escolhido: estrelas, perguntas, comentários, movimento, horários de pico e clientes que voltam. Depois diz o que vai bem, o que preocupa, o que mudou em relação ao período anterior e o que fazer primeiro, sempre com o número que sustenta cada ponto. Precisa da IA configurada e de 10 avaliações no período. Os diagnósticos anteriores ficam no histórico.",
  },
  {
    selector: '[data-tour="tour-star-ratings"]',
    route: "/user/dashboard",
    title: "Avaliação por estrelas",
    mobileSummary: "Média, positivas e críticas das estrelas. Toque na etiqueta para trocar o escopo.",
    icon: FaStar,
    description: "A nota de 1 a 5 que os clientes marcaram: a média, as avaliações positivas (4–5★) e as críticas (1–2★). A etiqueta no canto diz de qual escopo são os números; clique nela para trocar. Em \"Ver todas as métricas de estrelas\" ficam a distribuição completa e as neutras.",
  },
  {
    selector: '[data-tour="tour-movement"]',
    route: "/user/dashboard",
    title: "Movimento das avaliações",
    mobileSummary: "Quantas avaliações chegam e se a nota sobe ou cai com o tempo.",
    icon: FaChartColumn,
    description: "As barras mostram quantas avaliações chegaram em cada dia, semana ou mês; a linha embaixo, a média das estrelas no mesmo intervalo. Dá para ver se as avaliações estão aumentando e se a nota vem subindo ou caindo.",
  },
  {
    selector: '[data-tour="tour-form-questions"]',
    route: "/user/dashboard",
    title: "Perguntas do formulário",
    mobileSummary: "A nota de cada pergunta. O selo mostra as que mais pesam e o que melhorar primeiro.",
    icon: FaCircleQuestion,
    description: "Cada pergunta do seu formulário aparece aqui, na ordem, com a nota, as respostas e o % de satisfeitos. O selo \"Pesa muito na nota\" mostra as perguntas que mais mexem nas estrelas, e \"Melhore primeiro\" aponta, entre elas, a de nota mais baixa. Clique em \"Ver todas as métricas desta pergunta\" para ver as subperguntas. Usa as respostas dos clientes, mesmo sem a IA configurada.",
  },
  {
    selector: '[data-tour="tour-dashboard-comments"]',
    route: "/user/dashboard",
    title: "Análise dos comentários ✨ IA",
    mobileSummary: "O tom dos comentários e o resumo da IA. A análise completa vem a seguir.",
    icon: FaWandMagicSparkles,
    description: "Um resumo do que os clientes escreveram: o tom dos comentários e as recomendações da IA. A análise completa fica na página Análise dos comentários, que vem a seguir.",
  },
  {
    selector: '[data-tour="tour-comments-overview"]',
    route: "/user/insights/overview",
    title: "Visão geral da análise",
    mobileSummary: "Tom, assuntos e recomendações da IA. Precisa da IA configurada e de 10 feedbacks.",
    icon: FaChartSimple,
    description: "A IA lê o que os clientes escreveram e mostra o tom dos comentários, os assuntos que mais impactam e um resumo com recomendações para a empresa, um produto, um serviço ou um setor. Para atualizar, use Analisar comentários com IA. É preciso ter a IA configurada, o contexto da empresa preenchido e pelo menos 10 feedbacks no escopo escolhido.",
  },
  {
    selector: '[data-tour="tour-comments-list"]',
    route: "/user/insights/comments",
    title: "Comentários",
    mobileSummary: "Os comentários lidos pela IA, com filtro por tom.",
    icon: FaList,
    description: "Todos os comentários já analisados pela IA, com filtros por tom (positivos, neutros e negativos) e para quando a nota e o texto não combinam.",
  },
  {
    selector: '[data-tour="tour-compare-items"]',
    route: "/user/compare",
    title: "Comparar itens",
    mobileSummary: "Dois produtos, serviços ou setores lado a lado, no mesmo período.",
    icon: FaScaleBalanced,
    description: "Coloque dois produtos, serviços ou departamentos lado a lado, no mesmo período, e veja quem está melhor na média, nas positivas, nas críticas e no tom dos comentários. Funciona a partir de 2 itens do mesmo tipo no Catálogo.",
  },
  {
    selector: '[data-tour="tour-ratings-page"]',
    route: "/user/ratings",
    title: "Todas as métricas de estrelas",
    mobileSummary: "Distribuição, movimento, horários de pico e clientes que voltam.",
    icon: FaRankingStar,
    description: "O detalhe da nota: a distribuição de 1 a 5 estrelas, o movimento no tempo, os dias e horários em que os clientes mais avaliam (e onde a nota cai) e os clientes que voltam, com a nota de quem volta comparada à de quem avalia pela primeira vez.",
  },
  {
    selector: '[data-tour="tour-feedback-general"]',
    mobileSelector: '[data-tour="mobile-nav-feedback"]',
    route: "/user/edit/feedback-general",
    title: "Avaliação da empresa",
    mobileSummary: "Na barra de baixo, toque em Avaliação para as perguntas e o QR Code geral.",
    icon: FaCommentDots,
    description: "Configure as perguntas da avaliação da empresa como um todo e ative o QR Code geral, o canal por onde seus clientes respondem.",
    mobileDescription: "Na barra inferior, toque em Avaliação para configurar as perguntas e o QR Code geral.",
  },
  {
    selector: '[data-tour="tour-catalog"]',
    mobileSelector: '[data-tour="mobile-nav-catalog"]',
    route: "/user/edit/types-feedback",
    title: "Catálogo da Empresa",
    mobileSummary: "Na barra de baixo, toque em Catálogo para produtos, serviços e setores.",
    icon: FaBoxesStacked,
    description: "Ative os tipos de feedback e gerencie o catálogo de produtos, serviços e setores.",
    mobileDescription: "Na barra inferior, toque em Catálogo para gerenciar produtos, serviços e setores.",
  },
  {
    selector: '[data-tour="ia-settings-form"]',
    mobileSelector: '[data-tour="mobile-nav-ia-settings"]',
    route: "/user/edit/ia-settings",
    title: "Configuração de IA",
    mobileSummary: "No botão central, toque em Configuração de IA para a chave e o modelo.",
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
    mobileSummary: "No botão central, toque em Meu Perfil para ver seus dados.",
    icon: FaUser,
    description: "Use este botão, no canto superior direito, para abrir o menu da conta e entrar no seu Perfil.",
    mobileDescription: "No botão central da barra inferior, abra o menu e toque em Meu Perfil para acessar seus dados.",
    openMobileDrawer: true,
  },
  {
    selector: '[data-tour="profile-company-heading"]',
    route: "/user/profile",
    title: "Dados e configurações da empresa",
    mobileSummary: "Os dados de cadastro e o status da conta.",
    icon: FaSliders,
    description: "Aqui ficam os dados de cadastro da empresa: documento, tipo de cadastro e status da conta. Os produtos, serviços e departamentos que seus clientes avaliam se ativam no Catálogo.",
  },
];
