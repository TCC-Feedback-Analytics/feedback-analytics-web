import { useEffect, useState } from 'react';
import { useRouteLoaderData } from 'react-router-dom';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { activeFormQuestions, type FormQuestionConfig } from 'src/lib/utils/formQuestions';
import { ServiceGetQrCatalogStatus } from 'src/services/serviceCollectionPoints';
import type { CollectingDataEnterprise } from 'lib/interfaces/entities/enterprise.entity';

export type FormQuestionsConfigState = {
  /**
   * - ready: perguntas atuais do formulário do escopo, em ordem;
   * - pick-item: tipo sem item escolhido — cada item tem as suas perguntas;
   * - loading / error: perguntas de um item ainda chegando ou indisponíveis.
   */
  status: 'loading' | 'ready' | 'pick-item' | 'error';
  questions: FormQuestionConfig[];
};

/**
 * Perguntas ATUAIS do formulário do escopo do cabeçalho, na ordem do formulário.
 * Empresa: as do "Feedback geral", já no loader do layout. Item: as do QR daquele
 * item (`/collection-points/qr/catalog`). Sem mudar a API.
 */
export function useFormQuestionsConfig(): FormQuestionsConfigState {
  const { scope, catalogItemId } = useInsightsControls();
  const routeData = useRouteLoaderData('user') as { collecting?: CollectingDataEnterprise | null } | undefined;
  const companyQuestions = routeData?.collecting?.company_feedback_questions;
  const [itemState, setItemState] = useState<FormQuestionsConfigState>({ status: 'loading', questions: [] });

  useEffect(() => {
    if (scope === 'COMPANY' || !catalogItemId) return;
    let cancelled = false;
    setItemState({ status: 'loading', questions: [] });
    ServiceGetQrCatalogStatus(scope)
      .then(({ items }) => {
        if (cancelled) return;
        const item = items.find((candidate) => candidate.catalog_item_id === catalogItemId);
        setItemState({ status: 'ready', questions: activeFormQuestions(item?.questions) });
      })
      .catch(() => {
        if (!cancelled) setItemState({ status: 'error', questions: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [scope, catalogItemId]);

  if (scope === 'COMPANY') return { status: 'ready', questions: activeFormQuestions(companyQuestions) };
  if (!catalogItemId) return { status: 'pick-item', questions: [] };
  return itemState;
}
