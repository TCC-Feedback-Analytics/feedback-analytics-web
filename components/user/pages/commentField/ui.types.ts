import type { CommentFieldSettingsInput } from 'lib/schemas/public/commentField';

/**
 * Props do cartão "Campo de comentário" das telas de configuração do formulário.
 * Usado em: components/user/pages/commentField/CommentFieldSettings.tsx.
 */
export interface CommentFieldSettingsProps {
  scopeType: CommentFieldSettingsInput['scope_type'];
  /** `null` na empresa; o id do item nas telas do catálogo. */
  catalogItemId: string | null;
  /** "da empresa", "do produto Pizza"… */
  ofTarget: string;
}

/**
 * Props do aviso que sugere mudar o campo de comentário de um escopo.
 * Usado em: components/user/pages/comments/CommentParticipationSection.tsx.
 */
export interface CommentFieldAdviceNoticeProps {
  advice: 'low_participation' | 'low_content';
  pct: number;
  shortPct: number | null;
  configPath?: string;
}
