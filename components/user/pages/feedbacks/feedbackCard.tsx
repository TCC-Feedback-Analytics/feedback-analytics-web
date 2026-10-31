import type { KeyboardEvent } from 'react';
import { TEST_FEEDBACK_HINT, feedbackChannelLabel } from 'src/lib/utils/feedbackChannelLabel';
import type { FeedbackCardProps } from './ui.types';

const ANSWER_LABEL: Record<string, string> = {
  PESSIMO: 'Péssimo',
  RUIM: 'Ruim',
  MEDIANA: 'Mediana',
  BOA: 'Boa',
  OTIMA: 'Ótima',
};

export default function FeedbackCard({ feedback, onClick }: FeedbackCardProps) {
  const catalogItem = Array.isArray(feedback.collection_points?.catalog_items)
    ? (feedback.collection_points?.catalog_items[0] ?? null)
    : (feedback.collection_points?.catalog_items ?? null);

  const resolvedItemKind =
    feedback.collection_points?.catalog_item_kind ?? catalogItem?.kind ?? null;

  const normalizedItemKind = String(resolvedItemKind ?? '').toUpperCase();

  const resolvedItemName =
    feedback.collection_points?.catalog_item_name ?? catalogItem?.name ?? null;

  // Função para renderizar estrelas
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={`feedback-star-${index}`}
        className={`text-lg ${index < rating ? 'text-amber-300' : 'text-(--text-tertiary)'
          }`}>
        ★
      </span>
    ));
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Função para obter cor do rating
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30';
    if (rating >= 3)
      return 'text-amber-300 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-300 bg-rose-500/10 border-rose-500/30';
  };

  // Função para obter texto do rating
  const getRatingText = (rating: number) => {
    const texts = {
      1: 'Muito Ruim',
      2: 'Ruim',
      3: 'Regular',
      4: 'Bom',
      5: 'Excelente',
    };
    return texts[rating as keyof typeof texts] || 'N/A';
  };

  const itemKindLabel =
    normalizedItemKind === 'PRODUCT'
      ? 'Produto'
      : normalizedItemKind === 'SERVICE'
        ? 'Serviço'
        : normalizedItemKind === 'DEPARTMENT'
          ? 'Departamento'
          : 'Empresa';

  const itemName = resolvedItemName;
  const channelDisplayName = feedbackChannelLabel(
    feedback.channel,
    feedback.collection_points?.type === 'QR_CODE'
      ? (feedback.collection_points?.name || '').replace(/^QR Code\s*-\s*.+$/, 'QR Code')
      : (feedback.collection_points?.name || 'N/A'),
  );

  const questionAnswers = feedback.feedback_question_answers ?? [];

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    onClick();
  };

  return (
    <div
      className={`font-work-sans relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-gradient-to-br from-(--bg-secondary) to-(--sixth-color) p-4 glass-card feedback-card sm:p-5 ${onClick
          ? 'cursor-pointer transition-colors hover:border-(--quaternary-color)/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color)/50'
          : ''
        }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}>
      {/* Header com rating e data */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div
            className={`font-poppins px-3 py-1 rounded-full text-sm font-medium border ${getRatingColor(
              feedback.rating,
            )}`}>
            {feedback.rating} - {getRatingText(feedback.rating)}
          </div>
          <div className="flex items-center gap-1">
            {renderStars(feedback.rating)}
          </div>
          {feedback.channel === 'TEST' && (
            <span
              title={TEST_FEEDBACK_HINT}
              className="rounded-full border border-(--quaternary-color)/20 bg-(--seventh-color) px-2.5 py-0.5 text-xs font-semibold text-(--text-secondary)"
            >
              Teste
            </span>
          )}
        </div>
        <div className="text-xs text-[var(--text-tertiary)] sm:text-sm">
          {formatDate(feedback.created_at)}
        </div>
      </div>

      {/* Mensagem do feedback */}
      <div className="mb-5">
        <p className="text-[15px] leading-relaxed text-[var(--text-primary)]">
          {feedback.message?.trim() ? feedback.message : <span className="italic text-(--text-tertiary)">Sem comentário</span>}
        </p>
      </div>

      {questionAnswers.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {questionAnswers.slice(0, 3).map((answer, index) => (
            <span
              key={`${feedback.id}-question-answer-${answer.question_id}`}
              title={answer.question_text_snapshot}
              className="rounded-full border border-(--quaternary-color)/15 bg-(--seventh-color) px-3 py-1 text-xs text-(--text-secondary)"
            >
              {index + 1}. {ANSWER_LABEL[answer.answer_value] ?? answer.answer_value}
            </span>
          ))}
        </div>
      )}

      {/* Informações adicionais */}
      <div className="flex flex-col gap-3 border-t border-(--quaternary-color)/10 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs sm:text-sm text-[var(--text-tertiary)]">
          <span>
            <strong className="text-[var(--text-secondary)]">Canal:</strong>{' '}
            {channelDisplayName}
          </span>
          <span>
            <strong className="text-[var(--text-secondary)]">Categoria:</strong>{' '}
            {itemKindLabel}
          </span>
          <span>
            <strong className="text-[var(--text-secondary)]">Item:</strong>{' '}
            {itemName || '—'}
          </span>
        </div>

        {feedback.tracked_devices?.customer && (
          <div className="text-left sm:text-right shrink-0">
            <div className="font-medium text-xs sm:text-sm text-[var(--text-primary)]">
              {feedback.tracked_devices.customer.name || 'Cliente anônimo'}
            </div>
            {feedback.tracked_devices.customer.email && (
              <div className="text-[var(--text-tertiary)] text-[11px] sm:text-xs">
                {feedback.tracked_devices.customer.email}
              </div>
            )}
          </div>
        )}
      </div>

      {onClick && (
        <span className="mt-4 flex min-h-11 w-full items-center justify-center rounded-lg border border-(--primary-color)/25 bg-(--primary-color)/8 px-3 text-xs font-semibold text-(--primary-color) sm:w-fit">
          Ver detalhes do feedback
        </span>
      )}
    </div>
  );
}
