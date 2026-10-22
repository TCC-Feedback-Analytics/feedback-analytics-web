import { useCallback, useEffect, useState } from 'react';
import { MIN_FEEDBACKS_FOR_AI } from 'src/lib/utils/feedbackMilestones';
import {
  countFirstSteps,
  readFirstStepMarks,
  saveFirstStepMarks,
  type FirstStepMark,
  type FirstStepsStatus,
} from 'src/lib/utils/firstSteps';

/**
 * Estado dos "Primeiros passos" do Dashboard. O cartão aparece enquanto a conta
 * tem menos de 10 feedbacks e algum passo está pendente; concluído nesta visita,
 * fica até sair da tela, como "Tudo pronto".
 */
export function useFirstSteps({
  enterpriseId,
  qrActive,
  accountTotal,
}: {
  enterpriseId: string | null | undefined;
  qrActive: boolean | null;
  accountTotal: number | null;
}) {
  const [marks, setMarks] = useState(() => readFirstStepMarks(enterpriseId));
  const [qrActivatedHere, setQrActivatedHere] = useState(false);

  useEffect(() => {
    setMarks(readFirstStepMarks(enterpriseId));
  }, [enterpriseId]);

  const status: FirstStepsStatus = {
    qrActive: qrActive === null && !qrActivatedHere ? null : qrActive === true || qrActivatedHere,
    tested: marks.tested || (accountTotal ?? 0) > 0,
    downloaded: marks.downloaded,
    shared: marks.shared,
  };
  const { done, total } = countFirstSteps(status);
  const allDone = done === total;
  const [doneOnArrival] = useState(allDone);

  const mark = useCallback(
    (step: FirstStepMark) => {
      setMarks((prev) => {
        if (prev[step]) return prev;
        const next = { ...prev, [step]: true };
        saveFirstStepMarks(enterpriseId, next);
        return next;
      });
    },
    [enterpriseId],
  );

  const visible =
    Boolean(enterpriseId) && accountTotal !== null && accountTotal < MIN_FEEDBACKS_FOR_AI && !doneOnArrival;

  return {
    status,
    done,
    total,
    remaining: total - done,
    allDone,
    visible,
    mark,
    markQrActivated: () => setQrActivatedHere(true),
  };
}

export type FirstStepsState = ReturnType<typeof useFirstSteps>;
