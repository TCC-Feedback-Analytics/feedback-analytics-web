import { useCallback, useEffect, useRef, useState } from "react";
import { useRevalidator } from "react-router-dom";
import {
  FaArrowRight,
  FaCheck,
  FaSpinner,
  FaTriangleExclamation,
} from "react-icons/fa6";
import SetupOrb from "./SetupOrb";
import IaModelQuickSwitch from "components/user/shared/IaModelQuickSwitch";
import { IA_SLOW_AFTER_MS } from "src/lib/utils/iaSlowNotice";
import { useCompanyQuestionsGenerationState } from "src/lib/context/companyQuestionsGenerationContext";
import { getCompanyQuestionsFailureNotice } from "src/lib/hooks/useCompanyQuestionsGeneration";
import type {
  InitialSetupItemStatus,
  InitialSetupProgressDialogProps,
  InitialSetupProgressItemProps,
} from "./ui.types";

/** Depois disso sem resposta, a tela recomenda trocar de modelo (com o seletor ali mesmo). */
export const INITIAL_SETUP_SLOW_AFTER_MS = IA_SLOW_AFTER_MS;
/** Só depois disso (ou de uma falha) a tela libera seguir com as perguntas padrão. */
export const INITIAL_SETUP_GIVE_UP_AFTER_MS = 180_000;
const REDIRECT_AFTER_DONE_MS = 1500;

function ProgressItem({ status, label, detail }: InitialSetupProgressItemProps) {
  const icon = status === "done"
    ? <FaCheck className="text-xs" aria-hidden />
    : status === "failed"
      ? <FaTriangleExclamation className="text-xs" aria-hidden />
      : <FaSpinner className="animate-spin text-xs" aria-hidden />;
  const tone = status === "done"
    ? "bg-(--positive)/15 text-(--positive) ring-(--positive)/30"
    : status === "failed"
      ? "bg-amber-500/10 text-amber-400 ring-amber-500/30"
      : "bg-(--primary-color)/15 text-(--primary-color) ring-(--primary-color)/30";

  return (
    <li className="flex min-w-0 items-start gap-3">
      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-1 ${tone}`}>{icon}</span>
      <div className="min-w-0">
        <p className="break-words text-sm font-semibold text-(--text-primary)">{label}</p>
        {detail && <p className="break-words text-xs text-(--text-tertiary)">{detail}</p>}
      </div>
    </li>
  );
}

/**
 * Tela entre o onboarding e o dashboard: espera a IA criar as 3 perguntas do
 * formulário para o usuário não encontrar as padrão no meio do caminho.
 */
export default function InitialSetupProgressDialog({ open, onFinish, model }: InitialSetupProgressDialogProps) {
  const { phase, errorCode, track } = useCompanyQuestionsGenerationState();
  const revalidator = useRevalidator();
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);
  const [givenUp, setGivenUp] = useState(false);
  // Cada troca de modelo recomeça a espera do aviso de demora.
  const [attempt, setAttempt] = useState(0);
  const [currentModel, setCurrentModel] = useState(model);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const revalidateRef = useRef(revalidator.revalidate);
  revalidateRef.current = revalidator.revalidate;

  // O estado só vale depois da consulta desta abertura (evita um resultado antigo).
  useEffect(() => {
    if (!open) {
      setReady(false);
      setSlow(false);
      return;
    }
    let cancelled = false;
    void track().finally(() => {
      if (!cancelled) setReady(true);
    });
    const slowTimer = window.setTimeout(() => setSlow(true), INITIAL_SETUP_SLOW_AFTER_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(slowTimer);
    };
  }, [open, track, attempt]);

  // A saída com as perguntas padrão conta desde a abertura, sem recomeçar na troca.
  useEffect(() => {
    if (!open) {
      setGivenUp(false);
      setAttempt(0);
      return;
    }
    const giveUpTimer = window.setTimeout(() => setGivenUp(true), INITIAL_SETUP_GIVE_UP_AFTER_MS);
    return () => window.clearTimeout(giveUpTimer);
  }, [open]);

  // O layout passa o modelo salvo; ele muda depois de uma troca feita aqui.
  useEffect(() => {
    if (open) setCurrentModel(model);
  }, [open, model]);

  const handleModelChanged = useCallback((nextModel: string) => {
    setCurrentModel(nextModel);
    setSlow(false);
    setAttempt((value) => value + 1);
  }, []);

  const isDone = ready && phase === "completed";
  const isFailed = ready && phase === "failed";

  useEffect(() => {
    if (!open || !isDone) return;
    // Recarrega as perguntas antes de levar ao dashboard.
    void revalidateRef.current();
    const timer = window.setTimeout(() => onFinishRef.current("dashboard"), REDIRECT_AFTER_DONE_MS);
    return () => window.clearTimeout(timer);
  }, [open, isDone]);

  if (!open) return null;

  const notice = isFailed ? getCompanyQuestionsFailureNotice(errorCode, currentModel) : null;
  const questionsStatus: InitialSetupItemStatus = isDone ? "done" : isFailed ? "failed" : "running";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="initial-setup-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md sm:p-6"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-(--primary-color)/30 bg-(--bg-secondary) p-5 shadow-2xl sm:p-7">
        <div className="pointer-events-none absolute -left-24 -top-24 h-52 w-52 rounded-full bg-(--primary-color)/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-52 w-52 rounded-full bg-(--secondary-color)/12 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center border-b border-(--quaternary-color)/10 pb-5 text-center">
          <div className="mb-6 mt-2">
            <SetupOrb status={questionsStatus} />
          </div>
          <h3 id="initial-setup-dialog-title" className="font-montserrat text-xl font-bold text-(--text-primary)">
            {isDone ? "Sua conta está pronta" : "Preparando sua conta"}
          </h3>
          <p className="mt-1 text-xs text-(--text-tertiary)">
            {isDone
              ? "Levando você ao dashboard..."
              : "Estamos finalizando as configurações iniciais da sua empresa."}
          </p>
        </div>

        <ul className="relative z-10 my-5 space-y-4" aria-live="polite">
          <ProgressItem status="done" label="Contexto da empresa salvo" />
          <ProgressItem status="done" label="IA configurada" detail={currentModel ? `Modelo ${currentModel}` : undefined} />
          <ProgressItem
            status={questionsStatus}
            label={isDone ? "Perguntas do formulário criadas" : isFailed ? "Não foi possível criar as perguntas" : "Criando as perguntas personalizadas do formulário"}
            detail={isDone || isFailed ? undefined : "A IA está escrevendo as 3 perguntas a partir do contexto da sua empresa."}
          />
        </ul>

        {notice && (
          <div role="alert" className="relative z-10 mb-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <p className="text-sm font-semibold text-amber-400">{notice.title}</p>
            <p className="mt-1 break-words text-xs text-(--text-secondary)">{notice.description}</p>
          </div>
        )}

        {!isDone && !isFailed && slow && (
          <div role="status" className="relative z-10 mb-5 space-y-3 rounded-2xl border border-(--primary-color)/20 bg-(--primary-color)/8 p-4">
            <div>
              <p className="text-sm font-semibold text-(--text-primary)">A IA está demorando</p>
              <p className="mt-1 text-xs text-(--text-secondary)">
                Modelos gratuitos podem ficar lentos ou ocupados; trocar de modelo costuma resolver.
              </p>
            </div>
            <IaModelQuickSwitch onChanged={handleModelChanged} />
          </div>
        )}

        <div className="relative z-10 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {isFailed && notice?.actionLabel && (
            <button
              type="button"
              onClick={() => onFinish("ia-settings")}
              className="btn-ghost font-poppins h-[46px] px-4 text-xs font-semibold"
            >
              {notice.actionLabel}
            </button>
          )}
          {(isFailed || (givenUp && !isDone)) && (
            <button
              type="button"
              onClick={() => onFinish("dashboard")}
              className="btn-primary font-poppins flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-semibold"
            >
              Continuar com as perguntas padrão <FaArrowRight className="text-[10px]" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
