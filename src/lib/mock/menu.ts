import type { MenuItem } from 'components/user/layout/ui.types';
import {
  FaChartPie,
  FaComments,
  FaInbox,
  FaChartLine,
  FaList,
  FaFaceSmile,
  FaFaceFrown,
  FaWandMagicSparkles,
  FaFileLines,
  FaHeartPulse,
  FaChartSimple,
  FaCircleQuestion,
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
      {
        label: "Analisados",
        icon: FaChartLine,
        children: [
          { label: "Todos", to: "/user/feedbacks/analytics/all", icon: FaList },
          { label: "Positivos", to: "/user/feedbacks/analytics/positive", icon: FaFaceSmile },
          { label: "Negativos", to: "/user/feedbacks/analytics/negative", icon: FaFaceFrown },
        ],
      },
    ],
  },
  {
    label: "Insights",
    icon: FaWandMagicSparkles,
    tourAttr: "nav-insights",
    children: [
      { label: "Relatórios", to: "/user/insights/reports", icon: FaFileLines },
      { label: "Emocional", to: "/user/insights/emotional", icon: FaHeartPulse },
      { label: "Estatísticas", to: "/user/insights/statistics", icon: FaChartSimple },
      { label: "Perguntas", to: "/user/insights/questions", icon: FaCircleQuestion },
    ],
  },
  {
    label: "Configuração da coleta",
    icon: FaSliders,
    tourAttr: "nav-collecting",
    children: [
      {
        label: "Feedback geral",
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
