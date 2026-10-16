import type { ReactNode } from 'react';
import type { RouteCrumb } from 'src/lib/constants/routes/routeMeta';
import type { ConfidenceTier, Interval } from 'lib/interfaces/domain/feedback.domain';
import type { Precision, PrecisionKind } from 'src/lib/utils/precision';
import type { MetricTermKey } from 'src/lib/constants/metricExplanations';
import type { HelpTopicKey } from 'src/lib/constants/helpTopics';
import type { ConfidenceSampleUnit } from 'src/lib/utils/statistics';

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
  /** Complemento de escopo ("do QR geral da empresa"); vem de scopeText().ofScope. */
  ofScope?: string;
  className?: string;
};

export type PrecisionInfoModalProps = Omit<PrecisionBadgeProps, 'className'> & {
  precision: Precision;
  onClose: () => void;
};

/**
 * Props do selo de confiança da amostra (ConfidenceBadge).
 * Usado em: components/user/shared/ConfidenceBadge.tsx.
 */
export type ConfidenceBadgeProps = {
  tier?: ConfidenceTier;
  /** Tamanho da amostra (n) exibido ao lado do rótulo, quando informado. */
  n?: number;
  /**
   * O QUE o `n` conta: 'feedbacks' (geral, padrão), 'respostas' (granular, de UMA
   * pergunta) ou 'analyzed' (feedbacks analisados pela IA). Deixa o número claro.
   */
  unit?: ConfidenceSampleUnit;
  className?: string;
};

/**
 * Props do modal explicativo da confiança (ConfidenceInfoModal).
 * Usado em: components/user/shared/ConfidenceInfoModal.tsx.
 */
export type ConfidenceInfoModalProps = {
  /** Faixa atual a destacar no modal (opcional). */
  tier?: ConfidenceTier;
  /** Quantidade de respostas do resultado clicado (opcional, mostrado no topo). */
  n?: number;
  /** O que o `n` conta — define a frase de origem da amostra no modal. */
  unit?: ConfidenceSampleUnit;
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
