import type { CompanyFeedbackQuestionInput } from 'lib/interfaces/entities/enterprise.entity';
import type { QrcodeScopeType } from 'lib/interfaces/contracts/qrcode/scope.contract';
import type { ActionData } from 'lib/interfaces/contracts/action-data.contract';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFetcher } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaCircleInfo, FaExpand, FaFloppyDisk, FaPlus, FaTrashCan } from 'react-icons/fa6';
import { useToast } from 'components/public/forms/messages/useToast';
import { useDirtyTracker } from 'src/lib/hooks/useDirtyTracker';
import FeedbackFormPreview from 'components/user/pages/profile/preview/feedbackFormPreview';
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from 'components/ui/dialog';
import type { QuestionsEditorHiddenField } from './ui.types';

const MAX_LENGTH = 150;
const MIN_LENGTH = 20;

function hasValidLength(value: string) {
  return value.trim().length >= MIN_LENGTH && value.trim().length <= MAX_LENGTH;
}

function createEmptyQuestion(order: number): CompanyFeedbackQuestionInput {
  return {
    question_order: order as 1 | 2 | 3,
    question_text: '',
    is_active: true,
    subquestions: [],
  };
}

function normalizeQuestions(
  initialQuestions: CompanyFeedbackQuestionInput[],
  hasSavedQuestions: boolean,
) {
  const source = hasSavedQuestions
    ? initialQuestions.filter((question) => question.question_text.trim().length > 0)
    : initialQuestions;

  return source.map((question, index) => ({
    ...question,
    question_order: (index + 1) as 1 | 2 | 3,
    subquestions: (question.subquestions ?? [])
      .filter((subquestion) => subquestion.subquestion_text.trim().length > 0)
      .map((subquestion, subIndex) => ({ ...subquestion, subquestion_order: (subIndex + 1) as 1 | 2 | 3 })),
  }));
}

export default function GuidedQuestionsEditor({
  initialQuestions,
  hasSavedQuestions,
  action,
  intent,
  payloadFieldName,
  scopeType,
  catalogItemId = null,
  extraHiddenFields = [],
  minQuestions = 1,
  idPrefix,
}: {
  initialQuestions: CompanyFeedbackQuestionInput[];
  hasSavedQuestions: boolean;
  action: string;
  intent: string;
  payloadFieldName: string;
  scopeType: QrcodeScopeType;
  catalogItemId?: string | null;
  extraHiddenFields?: QuestionsEditorHiddenField[];
  minQuestions?: 0 | 1;
  idPrefix: string;
}) {
  const [open, setOpen] = useState(false);
  const normalizedInitialQuestions = useMemo(
    () => normalizeQuestions(initialQuestions, hasSavedQuestions),
    [initialQuestions, hasSavedQuestions],
  );
  const savedQuestionCount = Math.max(1, Math.min(3, initialQuestions.filter((question) => question.question_text.trim().length > 0).length || 1));
  const [step, setStep] = useState(hasSavedQuestions ? 1 : 0);
  const [questionCount, setQuestionCount] = useState(() => hasSavedQuestions ? savedQuestionCount : minQuestions === 0 ? 0 : 3);
  const [questions, setQuestions] = useState(normalizedInitialQuestions);
  const [error, setError] = useState<string | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const fetcher = useFetcher();
  const toast = useToast();
  const payloadRef = useRef<HTMLInputElement>(null);
  const { isDirty, markPristine } = useDirtyTracker(questions);
  const isSaving = fetcher.state !== 'idle';

  useEffect(() => {
    const data = fetcher.data as (ActionData & { error?: string }) | undefined;
    if (!data) return;
    if (data.ok) {
      markPristine();
      toast.success('Perguntas atualizadas!', data.message || 'As perguntas do feedback geral foram salvas.');
      setOpen(false);
      setStep(0);
    } else {
      toast.error('Não foi possível salvar', data.message || data.error || 'Tente novamente em instantes.');
    }
  }, [fetcher.data, markPristine, toast]);

  const reviewStep = questionCount + 1;
  const availableCounts = minQuestions === 0 ? [0, 1, 2, 3] : [1, 2, 3];
  const currentQuestion = questions[step - 1];
  const completedCount = questions.slice(0, questionCount).filter((question) => hasValidLength(question.question_text)).length;
  const progress = step === 0 ? 0 : step === reviewStep ? 100 : Math.round((step / reviewStep) * 100);

  const updateQuestion = (index: number, value: string) => {
    setQuestions((current) => current.map((question, questionIndex) => questionIndex === index ? { ...question, question_text: value } : question));
    setError(null);
  };

  const updateSubquestion = (questionIndex: number, subIndex: number, value: string) => {
    setQuestions((current) => current.map((question, index) => {
      if (index !== questionIndex) return question;
      const subquestions = [...(question.subquestions ?? [])];
      subquestions[subIndex] = { ...subquestions[subIndex], subquestion_text: value, is_active: value.trim().length > 0 };
      return { ...question, subquestions };
    }));
    setError(null);
  };

  const addSubquestion = (questionIndex: number) => {
    setQuestions((current) => current.map((question, index) => {
      if (index !== questionIndex || (question.subquestions ?? []).length >= 3) return question;
      return { ...question, subquestions: [...(question.subquestions ?? []), { subquestion_order: (question.subquestions?.length ?? 0) + 1 as 1 | 2 | 3, subquestion_text: '', is_active: false }] };
    }));
  };

  const setSelectedQuestionCount = (count: number) => {
    setQuestionCount(count);
    setQuestions((current) => {
      const next = current.slice(0, count);
      while (next.length < count) next.push(createEmptyQuestion(next.length + 1));
      return next.map((question, index) => ({ ...question, question_order: (index + 1) as 1 | 2 | 3 }));
    });
  };

  const addQuestion = () => {
    if (questionCount >= 3) return;
    const nextCount = questionCount + 1;
    setQuestions((current) => [...current, createEmptyQuestion(nextCount)]);
    setQuestionCount(nextCount);
    setStep(nextCount);
    setError(null);
  };

  const removeQuestionFromReview = (questionIndex: number) => {
    if (questionCount <= minQuestions) return;

    const nextCount = questionCount - 1;
    setQuestions((current) => current
      .filter((_, index) => index !== questionIndex)
      .map((question, index) => ({ ...question, question_order: (index + 1) as 1 | 2 | 3 })));
    setQuestionCount(nextCount);
    setStep(nextCount + 1);
    setError(null);
  };

  const nextStep = () => {
    if (step >= 1 && step <= questionCount && !hasValidLength(currentQuestion?.question_text ?? '')) {
      setError('Escreva uma pergunta com pelo menos 20 caracteres para continuar.');
      return;
    }
    setError(null);
    setStep((current) => Math.min(current + 1, reviewStep));
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!questions.slice(0, questionCount).every((question) => hasValidLength(question.question_text))) {
      event.preventDefault();
      setError(`Complete as ${questionCount} perguntas principais antes de salvar.`);
      return;
    }
    if (payloadRef.current) {
      payloadRef.current.value = JSON.stringify(questions.slice(0, questionCount).map((question, index) => ({
        question_order: index + 1,
        question_text: question.question_text.trim(),
        is_active: true,
        subquestions: (question.subquestions ?? []).map((subquestion, subIndex) => ({
          subquestion_order: subIndex + 1,
          subquestion_text: subquestion.subquestion_text.trim(),
          is_active: subquestion.subquestion_text.trim().length > 0,
        })),
      })));
    }
  };

  const resetDialog = () => {
    setStep(hasSavedQuestions ? 1 : 0);
    setQuestionCount(hasSavedQuestions ? savedQuestionCount : minQuestions === 0 ? 0 : 3);
    setQuestions(normalizedInitialQuestions);
    setError(null);
    setPreviewDialogOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(value) => { setOpen(value); if (value) resetDialog(); }}>
      <DialogTrigger>
        <button type="button" className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-(--primary-color) px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-(--secondary-color) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color) focus-visible:ring-offset-2">
          Configurar perguntas <FaArrowRight className="text-xs" aria-hidden />
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-(--primary-color)">
            <FaCircleInfo aria-hidden /> Configuração guiada
          </div>
          <DialogTitle>{step === 0 ? 'Como você quer ouvir seus clientes?' : step === reviewStep ? 'Revise antes de publicar' : `Pergunta ${step} de ${questionCount}`}</DialogTitle>
          <DialogDescription>
            {step === 0 ? 'Escolha quantas perguntas farão parte do seu feedback geral. Você poderá revisar tudo antes de salvar.' : step === reviewStep ? 'Confira o resumo e salve quando estiver satisfeito com o formulário.' : 'Use uma pergunta clara e específica. As subperguntas são opcionais e ajudam a aprofundar a resposta.'}
          </DialogDescription>
          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-(--seventh-color)" aria-label={`${progress}% concluído`}>
            <div className="h-full rounded-full bg-(--primary-color) transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </DialogHeader>

        <DialogBody>
          {step === 0 && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                {availableCounts.map((count) => <button key={count} type="button" onClick={() => setSelectedQuestionCount(count)} className={`cursor-pointer rounded-2xl border p-4 text-left transition ${questionCount === count ? 'border-(--primary-color) bg-(--primary-color)/10 ring-2 ring-(--primary-color)/20' : 'border-(--quaternary-color)/12 bg-(--bg-secondary) hover:border-(--primary-color)/40'}`}><span className="text-2xl font-bold text-(--primary-color)">{count}</span><span className="mt-1 block text-sm font-semibold text-(--text-primary)">{count === 0 ? 'Somente nota' : count === 1 ? 'Essencial' : count === 2 ? 'Equilibrado' : 'Completo'}</span><span className="mt-1 block text-xs leading-relaxed text-(--text-secondary)">{count === 0 ? 'Use apenas a avaliação por estrelas.' : count === 1 ? 'Uma pergunta direta para respostas rápidas.' : count === 2 ? 'Duas perspectivas sem alongar o formulário.' : 'Uma visão mais completa da experiência.'}</span></button>)}
              </div>
              <div className="rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-secondary)/70 p-4 text-sm text-(--text-secondary)"><strong className="text-(--text-primary)">{questionCount === 0 ? 'Somente a nota será exibida' : `${questionCount} ${questionCount === 1 ? 'pergunta será exibida' : 'perguntas serão exibidas'}`}</strong> no formulário do QR Code. Você poderá alterar essa escolha depois.</div>
            </div>
          )}

          {step >= 1 && step <= questionCount && currentQuestion && (
            <div className="space-y-6">
              <div className="rounded-xl border border-(--quaternary-color)/12 bg-(--bg-secondary)/70 px-3 py-2.5 text-xs text-(--text-secondary)">Pergunta {step} de {questionCount}</div>
              <div>
                <label htmlFor={`guided-question-${step}`} className="mb-2 block text-sm font-semibold text-(--text-primary)">Pergunta principal</label>
                <textarea id={`guided-question-${step}`} value={currentQuestion.question_text} onChange={(event) => updateQuestion(step - 1, event.target.value)} maxLength={MAX_LENGTH} rows={4} autoFocus className="w-full resize-none rounded-2xl border border-(--quaternary-color)/18 bg-(--seventh-color) px-4 py-3 text-sm leading-relaxed text-(--text-primary) outline-none transition focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20" placeholder="Ex.: Como foi sua experiência com o atendimento?" />
                <div className="mt-2 flex justify-end text-xs text-(--text-tertiary)">{currentQuestion.question_text.trim().length}/{MAX_LENGTH} caracteres · mínimo {MIN_LENGTH}</div>
              </div>

              <div className="rounded-2xl border border-dashed border-(--quaternary-color)/18 bg-(--bg-secondary)/70 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div><h3 className="text-sm font-semibold text-(--text-primary)">Aprofunde (opcional)</h3><p className="mt-1 text-xs text-(--text-secondary)">Adicione até 3 subperguntas para investigar esse tema.</p></div>
                  {(currentQuestion.subquestions ?? []).length < 3 && <button type="button" onClick={() => addSubquestion(step - 1)} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-(--primary-color)/25 px-3 py-2 text-xs font-semibold text-(--primary-color) transition hover:bg-(--primary-color)/10"><FaPlus aria-hidden /> Adicionar</button>}
                </div>
                <div className="space-y-3">
                  {(currentQuestion.subquestions ?? []).map((subquestion, subIndex) => <div key={`${step}-${subIndex}`} className="flex items-start gap-2"><span className="mt-2.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-(--primary-color)/10 text-[11px] font-bold text-(--primary-color)">{subIndex + 1}</span><input value={subquestion.subquestion_text} onChange={(event) => updateSubquestion(step - 1, subIndex, event.target.value)} maxLength={MAX_LENGTH} placeholder="Ex.: O que poderíamos melhorar?" className="h-10 w-full rounded-xl border border-(--quaternary-color)/16 bg-(--seventh-color) px-3 text-sm text-(--text-primary) outline-none transition focus:border-(--primary-color)" /></div>)}
                </div>
              </div>
              {error && <p role="alert" className="rounded-xl border border-(--negative)/30 bg-(--negative)/10 px-3 py-2 text-sm text-(--negative)">{error}</p>}
            </div>
          )}

          {step === reviewStep && (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-(--text-primary)">Perguntas do formulário</p>
                  <p className="mt-1 text-xs text-(--text-secondary)">Ajuste a ordem, remova ou adicione uma pergunta antes de salvar.</p>
                </div>
                {questionCount < 3 && <button type="button" onClick={addQuestion} className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-(--primary-color)/25 px-3 py-2 text-xs font-semibold text-(--primary-color) transition hover:bg-(--primary-color)/10"><FaPlus aria-hidden /> Adicionar pergunta</button>}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {questions.map((question, index) => (
                  <div key={question.question_order} className="min-w-0 rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-secondary) p-4">
                    <div className="mb-3 flex items-center justify-between gap-2 text-xs font-semibold text-(--primary-color)">
                      <span className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-lg bg-(--primary-color)/12">{index + 1}</span> Pergunta</span>
                      <button type="button" onClick={() => setStep(index + 1)} className="cursor-pointer text-(--text-tertiary) transition hover:text-(--primary-color)">Editar</button>
                    </div>
                    <p className="break-all text-sm leading-relaxed text-(--text-primary)">{question.question_text}</p>
                    <div className="mt-3 flex items-center justify-between gap-2 text-xs text-(--text-tertiary)">
                      <span>{(question.subquestions ?? []).filter((subquestion) => subquestion.subquestion_text.trim()).length} subpergunta(s)</span>
                      {questionCount > minQuestions && <button type="button" onClick={() => removeQuestionFromReview(index)} aria-label={`Remover pergunta ${index + 1}`} className="cursor-pointer text-(--negative) transition hover:opacity-75"><FaTrashCan aria-hidden /></button>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="overflow-hidden rounded-2xl border border-(--quaternary-color)/12"><div className="flex items-center justify-between gap-3 border-b border-(--quaternary-color)/10 bg-(--bg-secondary) px-4 py-3"><div className="min-w-0"><p className="text-sm font-semibold text-(--text-primary)">Prévia do formulário</p><p className="mt-0.5 text-xs text-(--text-tertiary)">Veja como o cliente encontrará suas perguntas.</p></div><button type="button" onClick={() => setPreviewDialogOpen(true)} className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-(--quaternary-color)/15 px-2.5 py-1.5 text-xs font-semibold text-(--text-secondary) transition hover:border-(--primary-color)/40 hover:text-(--primary-color)"><FaExpand aria-hidden /> Expandir</button></div><div className="scrollbar-thin scrollbar-track-slate-950/50 scrollbar-thumb-slate-950 hover:scrollbar-thumb-slate-800 max-h-64 overflow-y-auto p-4"><FeedbackFormPreview questions={questions} scopeType={scopeType} catalogItemId={catalogItemId} activeFromText={false} idPrefix={idPrefix} /></div></div>
              {error && <p role="alert" className="rounded-xl border border-(--negative)/30 bg-(--negative)/10 px-3 py-2 text-sm text-(--negative)">{error}</p>}
            </div>
          )}
        </DialogBody>

        <DialogFooter>
            <span className="text-xs text-(--text-tertiary)">{step === 0 ? `${completedCount}/${questionCount} perguntas prontas` : step === reviewStep ? 'Tudo certo para salvar' : 'Você está no controle — avance quando estiver pronto.'}</span>
          <div className="flex items-center justify-end gap-2">
            {step > 0 && <button type="button" onClick={() => { setError(null); if (step === 1 && hasSavedQuestions) { setOpen(false); return; } setStep((current) => Math.max(0, current - 1)); }} className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-(--text-secondary) transition hover:bg-(--seventh-color) hover:text-(--text-primary)"><FaArrowLeft aria-hidden /> {step === 1 && hasSavedQuestions ? 'Cancelar' : 'Voltar'}</button>}
            {step < reviewStep ? <button type="button" onClick={nextStep} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-(--primary-color) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--secondary-color)">{step === 0 ? 'Começar' : 'Continuar'} <FaArrowRight aria-hidden /></button> : <fetcher.Form method="post" action={action} onSubmit={submit}><input type="hidden" name="intent" value={intent} /><input ref={payloadRef} type="hidden" name={payloadFieldName} defaultValue="[]" />{extraHiddenFields.map((field) => <input key={field.name} type="hidden" name={field.name} value={field.value} />)}<button type="submit" disabled={!isDirty || isSaving} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-(--primary-color) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--secondary-color) disabled:cursor-not-allowed disabled:opacity-50"><FaFloppyDisk aria-hidden /> {isSaving ? 'Salvando…' : 'Salvar perguntas'}</button></fetcher.Form>}
          </div>
        </DialogFooter>

        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle>Prévia do formulário</DialogTitle>
              <DialogDescription>Veja a experiência completa que será apresentada ao cliente.</DialogDescription>
            </DialogHeader>
            <DialogBody className="bg-(--bg-secondary)/40">
              <div className="mx-auto w-full max-w-4xl rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-primary) p-4 shadow-sm sm:p-8">
                <FeedbackFormPreview questions={questions.slice(0, questionCount)} scopeType={scopeType} catalogItemId={catalogItemId} activeFromText={false} idPrefix={`${idPrefix}-expanded`} />
              </div>
            </DialogBody>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
