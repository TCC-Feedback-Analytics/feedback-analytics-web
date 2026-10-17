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
} from 'react-icons/fa6';

export const menuData: MenuItem[] = [
  {
    label: "Visão geral",
    to: "/user/dashboard",
    icon: FaChartPie,
    tourAttr: "nav-dashboard",
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
      { label: "Visão geral", to: "/user/insights/overview", icon: FaChartSimple },
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
