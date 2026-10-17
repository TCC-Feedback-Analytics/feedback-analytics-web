import type { ReactNode } from 'react';
import type { QuestionsGenerationResult } from 'src/services/serviceFeedbacks';
import type { RouteCrumb } from 'src/lib/constants/routes/routeMeta';
import type { Interval } from 'lib/interfaces/domain/feedback.domain';
import type { Precision, PrecisionKind } from 'src/lib/utils/precision';
import type { MetricTermKey } from 'src/lib/constants/metricExplanations';
import type { HelpTopicKey } from 'src/lib/constants/helpTopics';
import type { ComparedValue } from 'src/lib/utils/periodComparison';

/**
 * Props do cabeçalho padrão das telas logadas (PageHeader).
 * `title`/`description`/`breadcrumb` sobrescrevem os valores derivados do routeMeta
 * (útil em rotas dinâmicas, como a configuração de um item do catálogo);
 * `actions` exibe controles à direita do título.
 */
export type PageHeaderProps = {
  title?: string;
  description?: string;
  breadcrumb?: RouteCrumb[];
  actions?: ReactNode;
};

/**
 * Props da navegação horizontal de submenus da seção (SectionTabs).
 * Usado em: components/user/shared/SectionTabs.tsx.
 */
export type SectionTabsProps = {
  className?: string;
};

/**
 * Props do indicador de escopo ativo (ScopeBadge).
 * Usado em: components/user/shared/ScopeBadge.tsx.
 */
export type ScopeBadgeProps = {
  className?: string;
};

/**
 * Props da etiqueta de escopo das seções e páginas de detalhe (ScopeTag).
 * Usado em: components/user/shared/ScopeTag.tsx.
 */
export type ScopeTagProps = {
  className?: string;
};

/**
 * Props do indicador de Precisão (PrecisionBadge) e do seu painel.
 * Usado em: components/user/shared/PrecisionBadge.tsx.
 */
export type PrecisionBadgeProps = {
  /** Nome da métrica no painel (ex.: "Média de satisfação"). */
  metricName: string;
  /** Quantidade de respostas que formam o número. */
  n: number;
  /** O que o `n` conta, no plural (ex.: "avaliações", "respostas", "comentários analisados"). */
  unit: string;
  interval: Interval | null | undefined;
  kind: PrecisionKind;
  /** Complemento de escopo ("da empresa (avaliação geral)"); vem de scopeText().ofScope. */
  ofScope?: string;
  className?: string;
};

export type PrecisionInfoModalProps = Omit<PrecisionBadgeProps, 'className'> & {
  precision: Precision;
  onClose: () => void;
};

/**
 * Props do ícone "?" que abre um modal explicando uma métrica (MetricHelp).
 * Usado em: components/user/shared/MetricHelp.tsx.
 */
export type MetricHelpProps = {
  /** Chave da explicação no dicionário de métricas. */
  term: MetricTermKey;
  className?: string;
};

/**
 * Props do ícone "?" que abre um modal explicando um conceito de configuração
 * da coleta (HelpHint). Usado em: components/user/shared/HelpHint.tsx.
 */
export type HelpHintProps = {
  /** Chave da explicação no dicionário de tópicos de ajuda. */
  topic: HelpTopicKey;
  className?: string;
};

/**
 * Props da apresentação compartilhada do "?" + modal (HelpPopover), reutilizada
 * por MetricHelp e HelpHint. Recebe o conteúdo já resolvido (sem dicionário).
 * Usado em: components/user/shared/HelpPopover.tsx.
 */
export type HelpPopoverProps = {
  title: string;
  paragraphs: string[];
  example?: string;
  /** id usado no aria-labelledby e no h2 do modal (deve ser único na página). */
  idBase: string;
  className?: string;
};

/**
 * Props da troca rápida de modelo de IA, sem sair da tela.
 * Usado em: components/user/shared/IaModelQuickSwitch.tsx.
 */
export type IaModelQuickSwitchProps = {
  /**
   * Chamado com o novo modelo depois que a troca foi salva, e com o que aconteceu
   * com a geração das perguntas da configuração inicial (quando o gateway informa).
   */
  onChanged?: (model: string, questionsGeneration?: QuestionsGenerationResult) => void;
  className?: string;
};

/**
 * Props da diferença para o período anterior (PeriodDelta, etapa 02 parte C).
 * Usado em: components/user/shared/PeriodDelta.tsx.
 */
export type PeriodDeltaProps = {
  /** Nome da métrica para leitores de tela: "Média". */
  metricName: string;
  current: ComparedValue;
  /** `null` = sem dados no período anterior. */
  previous: ComparedValue | null;
  /** 'rating' = nota (+0,3); 'points' = pontos percentuais (+5 p.p.); 'nss' = tom (+8). */
  kind: 'rating' | 'points' | 'nss';
  /** Críticas: cair é melhorar. */
  higherIsBetter?: boolean;
  /** "30 dias anteriores". */
  reference: string;
  loading?: boolean;
  failed?: boolean;
};
