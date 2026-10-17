/**
 * Fonte única de "wayfinding" da área logada.
 *
 * Mapeia cada rota /user/* para o título da TELA (não o nome da empresa) e a
 * trilha de breadcrumb. Usado pelo PageHeader e pela navegação para responder
 * "onde estou?" e "como cheguei aqui?".
 */

export type RouteCrumb = {
  label: string;
  /** Quando presente, o item da trilha vira link navegável. */
  to?: string;
};

export type RouteMeta = {
  title: string;
  description?: string;
  breadcrumb: RouteCrumb[];
};

const SECTION_CONFIG = 'Configuração da coleta';
const SECTION_FEEDBACKS = 'Feedbacks';
const SECTION_COMMENTS = 'Análise dos comentários';

const CATALOG_CRUMB: RouteCrumb = {
  label: 'Catálogo',
  to: '/user/edit/types-feedback',
};

const ROUTE_META: Record<string, RouteMeta> = {
  '/user/dashboard': {
    title: 'Visão geral',
    description: 'Acompanhe a situação dos feedbacks da sua empresa.',
    breadcrumb: [{ label: 'Visão geral' }],
  },
  '/user/ratings': {
    title: 'Todas as métricas de estrelas',
    description: 'Média, positivas, neutras, críticas e a distribuição das avaliações de 1 a 5 estrelas.',
    breadcrumb: [{ label: 'Visão geral', to: '/user/dashboard' }, { label: 'Avaliação por estrelas' }],
  },
  '/user/profile': {
    title: 'Perfil',
    breadcrumb: [{ label: 'Perfil' }],
  },

  // Feedbacks
  '/user/feedbacks/all': {
    title: 'Feedbacks recebidos',
    description: 'Todos os feedbacks coletados, com filtros e detalhes.',
    breadcrumb: [{ label: SECTION_FEEDBACKS }, { label: 'Recebidos' }],
  },

  // Análise dos comentários (IA): o que os clientes escreveram, lido pela IA.
  '/user/insights/overview': {
    title: 'Análise dos comentários',
    description: 'O que os clientes escreveram, lido pela IA: tom, assuntos que mais impactam e recomendações.',
    breadcrumb: [{ label: SECTION_COMMENTS }, { label: 'Visão geral' }],
  },
  '/user/insights/comments': {
    title: 'Comentários',
    description: 'Os comentários lidos pela IA, com filtros por tom e pela divergência entre nota e texto.',
    breadcrumb: [{ label: SECTION_COMMENTS, to: '/user/insights/overview' }, { label: 'Comentários' }],
  },
  '/user/questions/removed': {
    title: 'Perguntas que saíram do formulário',
    description: 'Perguntas desativadas ou excluídas que ainda têm respostas no escopo selecionado.',
    breadcrumb: [{ label: 'Visão geral', to: '/user/dashboard' }, { label: 'Perguntas do formulário' }, { label: 'Saíram do formulário' }],
  },

  // Configuração da coleta
  '/user/edit/types-feedback': {
    title: 'Catálogo',
    description: 'Ative produtos, serviços e/ou departamentos e configure o catálogo de cada um.',
    breadcrumb: [{ label: SECTION_CONFIG }, { label: 'Catálogo' }],
  },
  '/user/edit/collecting-data-enterprise': {
    title: 'Dados da empresa',
    description: 'Contexto do seu negócio usado pela IA para analisar os feedbacks.',
    breadcrumb: [{ label: SECTION_CONFIG }, { label: 'Dados da empresa' }],
  },
  '/user/edit/ia-settings': {
    title: 'Configuração de IA',
    description: 'Gerencie a chave OpenRouter e o modelo de Inteligência Artificial da sua empresa.',
    breadcrumb: [{ label: SECTION_CONFIG }, { label: 'Configuração de IA' }],
  },
  '/user/edit/feedback-products': {
    title: 'Catálogo de Produtos',
    description: 'Liste os produtos e abra cada um para configurar perguntas e QR Code.',
    breadcrumb: [{ label: SECTION_CONFIG }, CATALOG_CRUMB, { label: 'Produtos' }],
  },
  '/user/edit/feedback-services': {
    title: 'Catálogo de Serviços',
    description: 'Liste os serviços e abra cada um para configurar perguntas e QR Code.',
    breadcrumb: [{ label: SECTION_CONFIG }, CATALOG_CRUMB, { label: 'Serviços' }],
  },
  '/user/edit/feedback-departments': {
    title: 'Catálogo de Departamentos',
    description: 'Liste os departamentos e abra cada um para configurar perguntas e QR Code.',
    breadcrumb: [{ label: SECTION_CONFIG }, CATALOG_CRUMB, { label: 'Departamentos' }],
  },
  '/user/edit/feedback-general': {
    title: 'Avaliação da empresa',
    description: 'As perguntas e os canais de coleta (QR Code e link) que seus clientes usam para avaliar a empresa como um todo.',
    breadcrumb: [{ label: SECTION_CONFIG }, { label: 'Avaliação da empresa' }],
  },

  // Clientes
  '/user/edit/customers': {
    title: 'Clientes',
    description: 'Os clientes que enviaram feedback à sua empresa.',
    breadcrumb: [{ label: 'Clientes' }],
  },
};

const DEFAULT_META: RouteMeta = {
  title: 'Painel',
  breadcrumb: [],
};

function normalizePath(pathname: string): string {
  if (!pathname) return '';
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

/**
 * Retorna o título e a trilha de uma rota /user/*.
 * Trata a rota dinâmica de detalhe de feedback (/user/feedbacks/:id) e
 * cai em um fallback seguro para rotas não mapeadas.
 */
export function getRouteMeta(pathname: string): RouteMeta {
  const path = normalizePath(pathname);

  const exact = ROUTE_META[path];
  if (exact) return exact;

  const isFeedbackDetail =
    /^\/user\/feedbacks\/[^/]+$/.test(path) &&
    !path.startsWith('/user/feedbacks/analytics');

  if (isFeedbackDetail) {
    return {
      title: 'Detalhe do feedback',
      breadcrumb: [
        { label: SECTION_FEEDBACKS, to: '/user/feedbacks/all' },
        { label: 'Detalhe' },
      ],
    };
  }

  return DEFAULT_META;
}
