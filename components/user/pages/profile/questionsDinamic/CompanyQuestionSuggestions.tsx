import { useEffect, useMemo, useRef, useState } from 'react';
import { useFetcher } from 'react-router-dom';
import { FaCircleCheck, FaCircleInfo, FaRotate, FaWandMagicSparkles, FaXmark } from 'react-icons/fa6';
import type { CompanyFeedbackQuestionInput, CollectingDataEnterprise } from 'lib/interfaces/entities/enterprise.entity';
import {
  useCompanyQuestionSuggestions,
} from 'src/lib/hooks/useCompanyQuestionSuggestions';
import { INTENT_FEEDBACK_SETTINGS_SAVE_COMPANY_QUESTIONS } from 'src/lib/constants/routes/intents';
import { useToast } from 'components/public/forms/messages/useToast';
import type { CompanyQuestionSuggestionDraft, CompanyQuestionSuggestionsProps } from './ui.types';

const MIN_LENGTH = 20;
const MAX_LENGTH = 150;

function errorMessage(code: string | null, retryAfterSeconds: number | null) {
  if (code === 'company_context_required') return 'Complete e salve os três campos do contexto da empresa antes de gerar.';
  if (code === 'ia_config_required') return 'Configure a chave e o modelo de IA no perfil para gerar sugestões.';
  if (code === 'question_generation_context_changed') return 'O contexto mudou enquanto havia uma geração anterior. Gere sugestões atualizadas explicitamente.';
  if (code === 'rate_limited') {
    return `Aguarde ${retryAfterSeconds ?? 60} segundos antes de solicitar outra geração.`;
  }
  if (code === 'ia_provider_auth_error') return 'Revise a chave configurada para o provedor de IA.';
  if (code === 'ia_provider_credits_exhausted') return 'Os créditos ou a cota do provedor de IA estão indisponíveis.';
  if (code === 'invalid_ai_response_schema' || code === 'invalid_ai_response') return 'A IA não retornou três sugestões válidas.';
  if (code === 'ia_job_not_found') return 'A geração anterior não está mais disponível. Solicite uma nova geração.';
  if (code === 'unauthorized') return 'Sua sessão expirou. Entre novamente para continuar.';
  if (code === 'service_unavailable' || code === 'question_generation_service_unavailable') return 'A geração está temporariamente indisponível. Tente novamente mais tarde.';
  return 'Não foi possível carregar sugestões agora. Suas perguntas atuais foram preservadas.';
}

function isValidDraft(draft: CompanyQuestionSuggestionDraft[]) {
  if (draft.length !== 3) return false;

  const normalizedTexts = draft.map((item) => item.question_text.trim().toLocaleLowerCase('pt-BR'));
  return (
    new Set(draft.map((item) => item.question_order)).size === 3 &&
    new Set(normalizedTexts).size === 3 &&
    draft.every((item) => {
      const text = item.question_text.trim();
      return text.length >= MIN_LENGTH && text.length <= MAX_LENGTH && text.endsWith('?');
    })
  );
}

function buildContextFingerprint(collecting: CollectingDataEnterprise | null) {
  return JSON.stringify({
    business_summary: collecting?.business_summary ?? null,
    company_objective: collecting?.company_objective ?? null,
    analytics_goal: collecting?.analytics_goal ?? null,
    main_products_or_services: collecting?.main_products_or_services ?? null,
    catalog_products: collecting?.catalog_products?.map((item) => item.name) ?? [],
    catalog_services: collecting?.catalog_services?.map((item) => item.name) ?? [],
    catalog_departments: collecting?.catalog_departments?.map((item) => item.name) ?? [],
  });
}

export default function CompanyQuestionSuggestions({
  currentQuestions,
  collecting,
  iaConfig,
  userId,
  enterpriseId,
  compact = false,
}: CompanyQuestionSuggestionsProps) {
  const toast = useToast();
  const saveFetcher = useFetcher<{ ok?: boolean; message?: string; error?: string }>();
  const [draft, setDraft] = useState<CompanyQuestionSuggestionDraft[] | null>(null);
  const [pendingSuggestions, setPendingSuggestions] = useState<CompanyQuestionSuggestionDraft[] | null>(null);
  const [draftDirty, setDraftDirty] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const lastSuggestionReference = useRef<unknown>(null);

  const hasCompleteContext = Boolean(
    collecting?.business_summary?.trim() &&
      collecting?.company_objective?.trim() &&
      collecting?.analytics_goal?.trim(),
  );
  const hasConfiguredIa = Boolean(iaConfig?.hasKey && iaConfig.model);
  const contextFingerprint = useMemo(() => buildContextFingerprint(collecting), [collecting]);
  const controller = useCompanyQuestionSuggestions({
    userId,
    enterpriseId,
    contextFingerprint,
    enabled: hasCompleteContext && hasConfiguredIa,
  });
  const { clearJob, resume } = controller;

  const isSaving = saveFetcher.state !== 'idle';
  const isProcessing = controller.status === 'submitting' || controller.hasActiveJob;
  const cooldownActive = cooldownUntil > Date.now();

  useEffect(() => {
    if (!controller.retryAfterSeconds) return;

    const until = Date.now() + controller.retryAfterSeconds * 1000;
    setCooldownUntil(until);
    const timer = window.setTimeout(() => setCooldownUntil(0), controller.retryAfterSeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [controller.retryAfterSeconds]);

  useEffect(() => {
    if (!controller.suggestions || controller.suggestions === lastSuggestionReference.current) return;
    lastSuggestionReference.current = controller.suggestions;

    const nextDraft = controller.suggestions.map((suggestion) => ({
      question_order: suggestion.question_order as 1 | 2 | 3,
      question_text: suggestion.question_text,
    }));

    if (draftDirty && draft) {
      setPendingSuggestions(nextDraft);
      return;
    }

    setDraft(nextDraft);
    setPendingSuggestions(null);
    setDraftDirty(false);
    setReviewOpen(true);
  }, [controller.suggestions, draft, draftDirty]);

  useEffect(() => {
    const result = saveFetcher.data;
    if (!result) return;

    if (result.ok) {
      toast.success('Perguntas salvas!', 'As sugestões escolhidas agora estão publicadas no feedback geral.');
      setDraft(null);
      setPendingSuggestions(null);
      setDraftDirty(false);
      setReviewOpen(false);
      clearJob();
      return;
    }

    toast.error('Não foi possível salvar', result.message || result.error || 'Tente novamente em instantes.');
  }, [clearJob, saveFetcher.data, toast]);

  const updateDraft = (index: number, value: string) => {
    setDraft((current) =>
      current?.map((item, itemIndex) =>
        itemIndex === index ? { ...item, question_text: value } : item,
      ) ?? null,
    );
    setDraftDirty(true);
  };

  const requestSuggestions = () => {
    if (!hasCompleteContext) {
      toast.warning('Contexto incompleto', 'Preencha e salve resumo, objetivo da empresa e objetivo analítico.');
      return;
    }
    if (!hasConfiguredIa) {
      toast.warning('IA não configurada', 'Configure a IA no perfil para liberar esta opção.');
      return;
    }
    if (cooldownActive) return;
    void controller.request();
  };

  const saveSuggestions = () => {
    if (!draft || !isValidDraft(draft)) return;

    const payload: CompanyFeedbackQuestionInput[] = draft.map((suggestion) => {
      const current = currentQuestions.find((question) => question.question_order === suggestion.question_order);
      return {
        question_order: suggestion.question_order,
        question_text: suggestion.question_text.trim(),
        is_active: true,
        subquestions: (current?.subquestions ?? []).map((subquestion, index) => ({
          subquestion_order: (index + 1) as 1 | 2 | 3,
          subquestion_text: subquestion.subquestion_text.trim(),
          is_active: subquestion.is_active === true,
        })),
      };
    });

    saveFetcher.submit(
      {
        intent: INTENT_FEEDBACK_SETTINGS_SAVE_COMPANY_QUESTIONS,
        company_feedback_questions: JSON.stringify(payload),
      },
      { method: 'post', action: '/user/edit/feedback-general' },
    );
  };

  const statusLabel = controller.status === 'queued'
    ? 'Aguardando processamento'
    : controller.status === 'running'
      ? 'Gerando sugestões'
      : controller.status === 'waiting_budget'
        ? 'Aguardando disponibilidade da IA'
        : controller.status === 'connection_error'
          ? 'Não foi possível consultar agora'
          : '';

  const validationMessage = draft && !isValidDraft(draft)
    ? 'Cada pergunta precisa ter entre 20 e 150 caracteres, ser diferente e terminar com ponto de interrogação.'
    : null;

  return (
    <section className={`rounded-2xl border border-(--primary-color)/20 bg-(--primary-color)/5 ${compact ? 'p-4' : 'p-5'}`} aria-labelledby="company-question-suggestions-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-(--primary-color)/15 text-(--primary-color)" aria-hidden>
            <FaWandMagicSparkles />
          </span>
          <div>
            <h3 id="company-question-suggestions-title" className="font-montserrat text-sm font-bold text-(--text-primary)">
              Sugestões de perguntas por IA
            </h3>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-(--text-secondary)">
              Gere três perguntas gerais com o contexto salvo da empresa. A IA não altera suas perguntas sem sua confirmação.
            </p>
          </div>
        </div>

        {!reviewOpen && !isProcessing && (
          <button
            type="button"
            onClick={requestSuggestions}
            disabled={!hasCompleteContext || !hasConfiguredIa || cooldownActive || controller.contextChanged}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-(--primary-color) px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-(--secondary-color) disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FaWandMagicSparkles aria-hidden />
            {cooldownActive ? 'Aguarde o limite' : 'Gerar sugestões'}
          </button>
        )}
      </div>

      {!hasCompleteContext && (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200">
          <FaCircleInfo className="mt-0.5 shrink-0" aria-hidden /> Complete e salve os três campos do contexto para habilitar a geração.
        </p>
      )}

      {hasCompleteContext && !hasConfiguredIa && (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200">
          <FaCircleInfo className="mt-0.5 shrink-0" aria-hidden /> A geração é opcional. Configure a chave e o modelo de IA no perfil para usá-la.
        </p>
      )}

      {controller.contextChanged && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200">
          <span>O contexto salvo mudou desde esta geração. O resultado anterior não será aplicado; solicite uma nova geração explícita.</span>
          <button type="button" onClick={clearJob} className="font-semibold text-amber-100 hover:text-white">Descartar geração antiga</button>
        </div>
      )}

      {statusLabel && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--quaternary-color)/12 bg-(--bg-secondary)/70 p-3 text-xs text-(--text-secondary)" role="status" aria-live="polite">
          <span>{statusLabel}{controller.job && controller.job.total > 0 ? ` (${controller.job.done}/${controller.job.total})` : ''}</span>
          {controller.connectionError && (
              <button type="button" onClick={resume} className="font-semibold text-(--primary-color) hover:text-(--secondary-color)">
              Retomar consulta
            </button>
          )}
        </div>
      )}

      {controller.status === 'failed' && controller.errorCode && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs leading-relaxed text-rose-200" role="alert">
          <span>{errorMessage(controller.errorCode, controller.retryAfterSeconds)}</span>
          {!cooldownActive && controller.errorCode !== 'unauthorized' && controller.errorCode !== 'ia_job_not_found' && (
            <button type="button" onClick={requestSuggestions} className="inline-flex items-center gap-1.5 font-semibold text-rose-100 hover:text-white">
              <FaRotate aria-hidden /> Tentar novamente
            </button>
          )}
        </div>
      )}

      {reviewOpen && draft && (
        <div className="mt-5 space-y-4 border-t border-(--primary-color)/15 pt-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-(--text-primary)">Revise as sugestões</p>
              <p className="mt-1 text-xs text-(--text-secondary)">Edite livremente. Só serão publicadas após salvar.</p>
            </div>
            <button type="button" onClick={() => { setReviewOpen(false); clearJob(); }} className="rounded-lg p-2 text-(--text-tertiary) hover:bg-(--seventh-color) hover:text-(--text-primary)" aria-label="Manter perguntas atuais">
              <FaXmark aria-hidden />
            </button>
          </div>

          <div className="space-y-3">
            {draft.map((item, index) => (
              <div key={item.question_order}>
                <label htmlFor={`company-ai-suggestion-${item.question_order}`} className="mb-1.5 block text-xs font-semibold text-(--text-primary)">
                  Pergunta {item.question_order}
                </label>
                <textarea
                  id={`company-ai-suggestion-${item.question_order}`}
                  value={item.question_text}
                  onChange={(event) => updateDraft(index, event.target.value)}
                  maxLength={MAX_LENGTH}
                  rows={3}
                  className="w-full resize-y rounded-xl border border-(--quaternary-color)/18 bg-(--seventh-color) px-3 py-2.5 text-sm leading-relaxed text-(--text-primary) outline-none focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20"
                />
                <div className="mt-1 text-right text-[11px] text-(--text-tertiary)">{item.question_text.trim().length}/{MAX_LENGTH} caracteres</div>
              </div>
            ))}
          </div>

          {validationMessage && <p className="text-xs leading-relaxed text-amber-300">{validationMessage}</p>}

          {pendingSuggestions && (
            <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">
              Novas sugestões chegaram enquanto você editava este rascunho. Continue com o rascunho atual ou feche e gere uma nova revisão.
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            <button type="button" onClick={() => { setReviewOpen(false); clearJob(); }} className="rounded-xl border border-(--quaternary-color)/18 px-4 py-2.5 text-xs font-semibold text-(--text-secondary) hover:bg-(--seventh-color)">
              Manter perguntas atuais
            </button>
            <button type="button" onClick={requestSuggestions} disabled={isProcessing || cooldownActive} className="inline-flex items-center justify-center gap-2 rounded-xl border border-(--primary-color)/30 px-4 py-2.5 text-xs font-semibold text-(--primary-color) hover:bg-(--primary-color)/10 disabled:cursor-not-allowed disabled:opacity-50">
              <FaRotate aria-hidden /> Gerar novas sugestões
            </button>
            <button type="button" onClick={saveSuggestions} disabled={isSaving || !isValidDraft(draft)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--primary-color) px-4 py-2.5 text-xs font-semibold text-white hover:bg-(--secondary-color) disabled:cursor-not-allowed disabled:opacity-50">
              <FaCircleCheck aria-hidden /> {isSaving ? 'Salvando…' : 'Salvar perguntas'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
