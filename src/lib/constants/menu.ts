import type { MenuItem } from 'components/user/layout/ui.types';
import {
  FaChartPie,
  FaComments,
  FaInbox,
  FaList,
  FaWandMagicSparkles,
  FaChartSimple,
  FaSliders,
  FaCommentDots,
  FaBoxesStacked,
  FaBrain,
  FaScaleBalanced,
  FaClipboardCheck,
  FaRankingStar,
  FaUsers,
} from 'react-icons/fa6';

export const menuData: MenuItem[] = [
  {
    label: "Visão geral",
    to: "/user/dashboard",
    icon: FaChartPie,
    tourAttr: "nav-dashboard",
  },
  // O detalhe de cada grupo do Dashboard (organização das métricas, 12/11/2026).
  {
    label: "Nota",
    to: "/user/ratings",
    icon: FaRankingStar,
  },
  {
    label: "Clientes e canais",
    to: "/user/customers",
    icon: FaUsers,
  },
  {
    // Dois itens do mesmo tipo lado a lado, no mesmo período (etapa 02).
    label: "Comparar itens",
    to: "/user/compare",
    icon: FaScaleBalanced,
  },
  {
    // Os diagnósticos da IA já gerados para o escopo, cada um com o seu período.
    label: "Diagnósticos ✨",
    to: "/user/diagnosis",
    icon: FaClipboardCheck,
  },
  {
    label: "Feedbacks",
    icon: FaComments,
    children: [
      { label: "Recebidos", to: "/user/feedbacks/all", icon: FaInbox },
    ],
  },
  {
    // O que os clientes escreveram, lido pela IA (antiga "Insights").
    label: "Análise dos comentários ✨",
    icon: FaWandMagicSparkles,
    tourAttr: "nav-insights",
    children: [
      { label: "Resumo", to: "/user/insights/overview", icon: FaChartSimple },
      { label: "Comentários", to: "/user/insights/comments", icon: FaList },
    ],
  },
  {
    label: "Configuração da coleta",
    icon: FaSliders,
    tourAttr: "nav-collecting",
    children: [
      {
        label: "Avaliação da empresa",
        to: "/user/edit/feedback-general",
        icon: FaCommentDots,
        tourAttr: "tour-feedback-general",
      },
      {
        label: "Catálogo",
        to: "/user/edit/types-feedback",
        icon: FaBoxesStacked,
        tourAttr: "tour-catalog",
      },
      {
        label: "Configuração de IA",
        to: "/user/edit/ia-settings",
        icon: FaBrain,
      },
    ],
  },
];
