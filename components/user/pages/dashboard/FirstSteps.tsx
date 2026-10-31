import { useCallback, useEffect, useState } from 'react';
import { useFetcher, useRevalidator } from 'react-router-dom';
import { FaCheck, FaClipboardList, FaPlay, FaSpinner } from 'react-icons/fa6';
import { INTENT_QR_ENABLE } from 'src/lib/constants/routes/intents';
import { useEnterpriseFeedbackLink } from 'src/lib/hooks/useEnterpriseFeedbackLink';
import type { EmbeddedFormResult } from 'src/lib/utils/embeddedForm';
import TestFormDialog from './TestFormDialog';
import type { FirstStepItemProps, FirstStepsProps } from './ui.types';
import type { QrCodeEnterpriseActionResponse } from 'pages/user/qrcodes/ui.types';

const actionClass =
  'inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-(--primary-color)/30 bg-(--primary-color)/10 px-3 py-2 text-xs font-semibold text-(--primary-color) transition-colors hover:bg-(--primary-color)/18 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto';
/** Tempo do "Tudo pronto" antes de o cartão sair do Dashboard. */
const CLOSE_AFTER_DONE_MS = 4000;

const primaryActionClass =
  'inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-(--primary-color) px-3.5 py-2 text-xs font-semibold text-(--on-primary) transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto';

function FirstStepItem({ number, title, description, done, note, children }: FirstStepItemProps) {
  return (
    <li
      data-done={done ? 'true' : 'false'}
      className={`flex gap-3 rounded-xl border p-4 transition-colors ${
        done ? 'border-(--positive)/25 bg-(--positive)/6' : 'border-(--quaternary-color)/12 bg-(--bg-primary)/55'
      }`}
    >
      <span
        aria-hidden
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
          done ? 'bg-(--positive) text-white' : 'bg-(--primary-color)/15 text-(--primary-color)'
        }`}
      >
        {done ? <FaCheck /> : number}
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <h3 className="text-sm font-semibold text-(--text-primary)">
            {title}
            {done && <span className="sr-only"> (concluído)</span>}
          </h3>
          <p className="text-xs text-(--text-secondary)">{description}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{children}</div>
        {note && <p className="text-[11px] text-(--text-tertiary)">{note}</p>}
      </div>
    </li>
  );
}

/**
 * "Primeiros passos" da conta nova, no topo do Dashboard: ativar o QR Code geral
 * da empresa e, se quiser, testar o formulário numa janela, sem sair da tela.
 * O teste é opcional: testar ou pular conclui o passo.
 */
export default function FirstSteps({ enterprise, steps, onFeedbackSent }: FirstStepsProps) {
  const { feedbackUrl } = useEnterpriseFeedbackLink(enterprise);
  const revalidator = useRevalidator();
  const [testing, setTesting] = useState(false);
  const { qrActive, formTest, allDone, resolveFormTest, markQrActivated, close } = steps;

  // Tudo concluído: mostra o "Tudo pronto" por um instante e sai sozinho, sem recarregar.
  useEffect(() => {
    if (!allDone) return;
    const id = setTimeout(close, CLOSE_AFTER_DONE_MS);
    return () => clearTimeout(id);
    // close muda a cada render; basta reagir à conclusão.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone]);

  // Ativa o QR geral ali mesmo, pela action da tela Avaliação da empresa.
  const qrFetcher = useFetcher<QrCodeEnterpriseActionResponse>();
  const activating = qrFetcher.state !== 'idle';
  const activateError = qrFetcher.data && !qrFetcher.data.ok ? qrFetcher.data.error ?? null : null;
  const activated = qrFetcher.data?.ok === true && qrFetcher.data.active === true;
  useEffect(() => {
    if (!activated) return;
    markQrActivated();
    revalidator.revalidate();
    // markQrActivated e revalidator mudam a cada render; basta reagir à ativação.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activated]);

  const onFormResult = useCallback(
    (result: EmbeddedFormResult) => {
      resolveFormTest('tested');
      if (result === 'sent') onFeedbackSent?.();
    },
    [resolveFormTest, onFeedbackSent],
  );

  return (
    <section
      aria-labelledby="first-steps-title"
      className="font-work-sans space-y-4 rounded-3xl border-2 border-(--primary-color)/45 bg-linear-to-br from-(--primary-color)/14 via-(--bg-secondary) to-(--sixth-color) p-5 shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary-color)_8%,transparent)] sm:p-7"
    >
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="first-steps-title" className="font-montserrat text-lg font-bold text-(--text-primary) sm:text-xl">
            {allDone ? 'Tudo pronto ✓' : 'Primeiros passos'}
          </h2>
          {!allDone && (
            <span className="rounded-full bg-(--primary-color) px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-(--on-primary)">
              Comece por aqui
            </span>
          )}
        </div>
        <p className="text-sm text-(--text-secondary)">
          {allDone
            ? 'Seu formulário está no ar. Agora é esperar as respostas dos clientes.'
            : 'Ative o QR Code para começar a receber a opinião dos seus clientes.'}
        </p>
        {allDone && (
          <button type="button" onClick={close} className={primaryActionClass}>
            Ver o painel
          </button>
        )}
      </header>

      <ol className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <FirstStepItem
          number={1}
          done={qrActive}
          title={qrActive ? 'QR Code ativado' : 'Ativar o QR Code da empresa'}
          description={qrActive
            ? 'Os clientes já conseguem responder pelo QR Code, pelo link e pela etiqueta NFC.'
            : 'É o QR Code geral, da avaliação da empresa. Desativado, os clientes ainda não conseguem responder.'}
          note={activateError ?? undefined}
        >
          {!qrActive && (
            <button type="button" onClick={() => qrFetcher.submit({ intent: INTENT_QR_ENABLE }, { method: 'post', action: '/user/edit/feedback-general' })} disabled={activating} className={primaryActionClass}>
              {activating ? <FaSpinner aria-hidden className="animate-spin" /> : <FaPlay aria-hidden />} {activating ? 'Ativando…' : 'Ativar QR Code'}
            </button>
          )}
        </FirstStepItem>
        <FirstStepItem
          number={2}
          done={formTest !== null}
          title={formTest === 'tested' ? 'Formulário testado' : formTest === 'skipped' ? 'Teste pulado' : 'Testar o formulário (opcional)'}
          description="Responda como se fosse um cliente para ver como fica. O teste não entra nas métricas."
          note={qrActive ? undefined : 'Ative o QR Code para poder testar.'}
        >
          {formTest === null && (
            <>
              <button type="button" onClick={() => setTesting(true)} disabled={!qrActive} className={primaryActionClass}>
                <FaClipboardList aria-hidden /> Testar o formulário
              </button>
              <button type="button" onClick={() => resolveFormTest('skipped')} disabled={!qrActive} className={actionClass}>
                Pular
              </button>
            </>
          )}
        </FirstStepItem>
      </ol>

      <TestFormDialog open={testing} onOpenChange={setTesting} feedbackUrl={feedbackUrl} onResult={onFormResult} />
    </section>
  );
}
