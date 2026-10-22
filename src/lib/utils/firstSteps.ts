/**
 * "Primeiros passos" da conta nova, no topo do Dashboard até serem concluídos.
 * O QR ativo vem do servidor e o teste do formulário vale pelo primeiro feedback;
 * baixar o QR e compartilhar o link só o navegador sabe, por isso ficam guardados
 * aqui, por empresa. Sem storage, os passos só voltam a aparecer como pendentes.
 */
const STORAGE_PREFIX = 'feedback:first-steps:';

export type FirstStepMark = 'tested' | 'downloaded' | 'shared';
export type FirstStepMarks = Record<FirstStepMark, boolean>;

export const EMPTY_FIRST_STEP_MARKS: FirstStepMarks = { tested: false, downloaded: false, shared: false };

export function readFirstStepMarks(enterpriseId: string | null | undefined): FirstStepMarks {
  if (!enterpriseId) return EMPTY_FIRST_STEP_MARKS;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + enterpriseId);
    if (!raw) return EMPTY_FIRST_STEP_MARKS;
    const parsed = JSON.parse(raw) as Partial<FirstStepMarks>;
    return {
      tested: parsed.tested === true,
      downloaded: parsed.downloaded === true,
      shared: parsed.shared === true,
    };
  } catch {
    return EMPTY_FIRST_STEP_MARKS;
  }
}

export function saveFirstStepMarks(enterpriseId: string | null | undefined, marks: FirstStepMarks): void {
  if (!enterpriseId) return;
  try {
    localStorage.setItem(STORAGE_PREFIX + enterpriseId, JSON.stringify(marks));
  } catch {
    // Sem storage, o passo só volta a aparecer como pendente.
  }
}

export type FirstStepsStatus = {
  /** QR geral ativo; `null` quando não deu para consultar (o passo some). */
  qrActive: boolean | null;
  tested: boolean;
  downloaded: boolean;
  shared: boolean;
};

export function countFirstSteps(status: FirstStepsStatus): { done: number; total: number } {
  const flags = [status.tested, status.downloaded, status.shared];
  if (status.qrActive !== null) flags.unshift(status.qrActive);
  return { done: flags.filter(Boolean).length, total: flags.length };
}
