import { useEffect, useRef, useState } from 'react';
import { FaCommentDots, FaEyeSlash, FaFloppyDisk, FaPenToSquare, FaSpinner } from 'react-icons/fa6';
import {
  COMMENT_PROMPT_MAX_LENGTH,
  COMMENT_PROMPT_MIN_LENGTH,
  DEFAULT_COMMENT_FIELD,
  DEFAULT_COMMENT_PROMPT,
  commentFieldLabel,
  type CommentFieldMode,
  type CommentFieldSettings as CommentFieldValue,
} from 'lib/schemas/public/commentField';
import { useToast } from 'components/public/forms/messages/useToast';
import { ServiceGetCommentField, ServiceSaveCommentField } from 'src/services/serviceCommentField';
import { COMMENT_FIELD_ANCHOR } from 'src/lib/utils/formConfigPath';
import type { CommentFieldSettingsProps } from './ui.types';

const OPTIONS: Array<{ mode: CommentFieldMode; title: string; description: string; icon: typeof FaCommentDots }> = [
  {
    mode: 'DEFAULT',
    title: 'Convite padrão',
    description: `"${DEFAULT_COMMENT_PROMPT}", opcional para o cliente.`,
    icon: FaCommentDots,
  },
  {
    mode: 'CUSTOM',
    title: 'Pergunta própria',
    description: 'Uma pergunta deste escopo no lugar do convite. Costuma render comentários mais úteis.',
    icon: FaPenToSquare,
  },
  {
    mode: 'HIDDEN',
    title: 'Ocultar o campo',
    description: 'O formulário fica só com as estrelas e as perguntas.',
    icon: FaEyeSlash,
  },
];

const PROMPT_SUGGESTIONS = ['O que faltou para ser nota 5?', 'O que você mudaria aqui?', 'Do que você mais gostou?'];

function sameSettings(a: CommentFieldValue, b: CommentFieldValue) {
  return a.mode === b.mode && (a.mode !== 'CUSTOM' || (a.prompt ?? '').trim() === (b.prompt ?? '').trim());
}

/**
 * "Campo de comentário" do formulário de um escopo: o convite padrão, uma
 * pergunta própria ou o campo oculto. Lê e salva sozinho, sem sair da tela.
 */
export default function CommentFieldSettings({ scopeType, catalogItemId, ofTarget }: CommentFieldSettingsProps) {
  const toast = useToast();
  const sectionRef = useRef<HTMLElement>(null);
  const [saved, setSaved] = useState<CommentFieldValue>(DEFAULT_COMMENT_FIELD);
  const [draft, setDraft] = useState<CommentFieldValue>(DEFAULT_COMMENT_FIELD);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadFailed(false);
    ServiceGetCommentField({ scopeType, catalogItemId })
      .then((settings) => {
        if (!active) return;
        setSaved(settings);
        setDraft(settings);
      })
      .catch(() => active && setLoadFailed(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [scopeType, catalogItemId]);

  // Chegou pelo aviso "Configurar o comentário": rola até o cartão.
  useEffect(() => {
    if (loading || window.location.hash !== `#${COMMENT_FIELD_ANCHOR}`) return;
    sectionRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }, [loading]);

  const promptLength = (draft.prompt ?? '').trim().length;
  const promptInvalid =
    draft.mode === 'CUSTOM' && (promptLength < COMMENT_PROMPT_MIN_LENGTH || promptLength > COMMENT_PROMPT_MAX_LENGTH);
  const dirty = !sameSettings(draft, saved);
  const preview = commentFieldLabel(draft.mode === 'CUSTOM' && promptInvalid ? { mode: 'DEFAULT', prompt: null } : draft);

  const save = async () => {
    if (promptInvalid || !dirty) return;
    setSaving(true);
    try {
      const next = await ServiceSaveCommentField({ scopeType, catalogItemId }, { mode: draft.mode, prompt: draft.prompt?.trim() ?? null });
      setSaved(next);
      setDraft(next);
      toast.success('Campo de comentário salvo!', next.mode === 'HIDDEN' ? 'O formulário não pede mais comentário.' : 'Já vale para os próximos clientes.');
    } catch {
      toast.error('Não deu para salvar', 'Tente de novo em instantes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      id={COMMENT_FIELD_ANCHOR}
      aria-labelledby="comment-field-title"
      className="font-work-sans scroll-mt-24 space-y-5 rounded-3xl border border-(--quaternary-color)/12 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-5 sm:p-7"
    >
      <header className="space-y-1">
        <h2 id="comment-field-title" className="font-montserrat text-lg font-semibold text-(--text-primary)">
          Campo de comentário
        </h2>
        <p className="text-sm text-(--text-secondary)">
          O que o cliente lê no espaço para escrever, no formulário {ofTarget}. O comentário é o que a IA lê para entender o que os clientes acham.
        </p>
      </header>

      {loading ? (
        <p className="text-sm text-(--text-tertiary)">Carregando o campo de comentário…</p>
      ) : loadFailed ? (
        <p role="alert" className="text-sm text-(--negative)">Não deu para carregar o campo de comentário. Recarregue a página para tentar de novo.</p>
      ) : (
        <>
          <div role="radiogroup" aria-label="Como fica o campo de comentário" className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {OPTIONS.map(({ mode, title, description, icon: Icon }) => {
              const selected = draft.mode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setDraft((current) => ({ mode, prompt: mode === 'CUSTOM' ? current.prompt ?? saved.prompt ?? '' : null }))}
                  className={`flex min-w-0 flex-col gap-1.5 rounded-2xl border p-4 text-left transition-colors ${
                    selected
                      ? 'border-(--primary-color)/55 bg-(--primary-color)/12 ring-1 ring-(--primary-color)/30'
                      : 'border-(--quaternary-color)/14 bg-(--bg-primary)/45 hover:border-(--primary-color)/30'
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-(--text-primary)">
                    <Icon aria-hidden className={selected ? 'text-(--primary-color)' : 'text-(--text-tertiary)'} /> {title}
                  </span>
                  <span className="text-xs text-(--text-secondary)">{description}</span>
                </button>
              );
            })}
          </div>

          {draft.mode === 'CUSTOM' && (
            <div className="space-y-2">
              <label htmlFor="comment-field-prompt" className="text-sm font-medium text-(--text-secondary)">
                Pergunta para o cliente
              </label>
              <input
                id="comment-field-prompt"
                type="text"
                value={draft.prompt ?? ''}
                maxLength={COMMENT_PROMPT_MAX_LENGTH}
                onChange={(event) => setDraft({ mode: 'CUSTOM', prompt: event.target.value })}
                placeholder="Ex: O que faltou no atendimento?"
                aria-invalid={promptInvalid || undefined}
                className="w-full rounded-xl border border-(--quaternary-color)/18 bg-(--seventh-color) px-4 py-3 text-base text-(--text-primary) outline-none placeholder:text-(--text-tertiary) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 md:text-sm"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap gap-2">
                  {PROMPT_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setDraft({ mode: 'CUSTOM', prompt: suggestion })}
                      className="rounded-full border border-(--quaternary-color)/20 px-3 py-1 text-(--text-secondary) hover:border-(--primary-color)/35 hover:text-(--text-primary)"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
                <span className={promptInvalid ? 'text-amber-400' : 'text-(--text-tertiary)'}>
                  {promptInvalid ? `De ${COMMENT_PROMPT_MIN_LENGTH} a ${COMMENT_PROMPT_MAX_LENGTH} caracteres` : `${promptLength}/${COMMENT_PROMPT_MAX_LENGTH}`}
                </span>
              </div>
            </div>
          )}

          {draft.mode === 'HIDDEN' && (
            <p role="note" className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-(--text-secondary)">
              Sem comentários, a IA não terá o que ler deste escopo: a "Análise dos comentários" fica vazia aqui. O diagnóstico da IA, as estrelas e as perguntas continuam. Os comentários que já chegaram não somem.
            </p>
          )}

          <div className="flex flex-col gap-3 border-t border-(--quaternary-color)/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-(--text-tertiary)">
              Como o cliente vê:{' '}
              <span className="font-medium text-(--text-secondary)">
                {preview ? `"${preview}" (opcional)` : 'sem campo de comentário'}
              </span>
            </p>
            <button
              type="button"
              onClick={() => void save()}
              disabled={!dirty || promptInvalid || saving}
              className="btn-primary font-poppins inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <FaSpinner aria-hidden className="animate-spin" /> : <FaFloppyDisk aria-hidden />}
              {saving ? 'Salvando…' : 'Salvar campo de comentário'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
