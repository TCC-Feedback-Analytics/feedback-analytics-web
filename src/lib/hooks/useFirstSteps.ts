import { useState } from 'react';

/** Como o passo opcional "Testar o formulário" foi resolvido nesta visita. */
export type FormTestChoice = 'tested' | 'skipped';

/**
 * Estado dos "Primeiros passos" do Dashboard: ativar o QR Code geral da empresa
 * e, opcionalmente, testar o formulário. O cartão só aparece quando o QR chega
 * desativado do servidor, então é igual em qualquer aparelho. Ativado aqui, ele
 * fica até o teste ser feito ou pulado, mostra "Tudo pronto" e sai (`close`).
 */
export function useFirstSteps({
  enterpriseId,
  qrActive,
}: {
  enterpriseId: string | null | undefined;
  /** QR geral ativo no servidor; `null` quando não deu para consultar (o cartão não aparece). */
  qrActive: boolean | null;
}) {
  const [qrActivatedHere, setQrActivatedHere] = useState(false);
  const [formTest, setFormTest] = useState<FormTestChoice | null>(null);
  const [closed, setClosed] = useState(false);
  const [qrOffOnArrival] = useState(qrActive === false);

  const qrOn = qrActive === true || qrActivatedHere;
  const allDone = qrOn && formTest !== null;

  return {
    qrActive: qrOn,
    formTest,
    allDone,
    visible: Boolean(enterpriseId) && qrOffOnArrival && !closed,
    resolveFormTest: setFormTest,
    markQrActivated: () => setQrActivatedHere(true),
    close: () => setClosed(true),
  };
}

export type FirstStepsState = ReturnType<typeof useFirstSteps>;
