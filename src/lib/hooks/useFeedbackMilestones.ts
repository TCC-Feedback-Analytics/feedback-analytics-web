import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from 'components/public/forms/messages/useToast';
import {
  MIN_FEEDBACKS_FOR_AI,
  nextMilestones,
  readMilestones,
  saveMilestones,
  type MilestoneSnapshot,
} from 'src/lib/utils/feedbackMilestones';

const REFRESH_INTERVAL_MS = 30_000;

/**
 * Comemora no Dashboard o primeiro feedback da conta e os 10 feedbacks de um
 * escopo. Enquanto `watching`, atualiza os números a cada 30s e ao voltar para
 * a aba, para o marco aparecer sem a pessoa recarregar a página.
 */
export function useFeedbackMilestones({
  enterpriseId,
  snapshot,
  inScope,
  watching,
  refresh,
}: {
  enterpriseId: string | undefined;
  snapshot: MilestoneSnapshot;
  /** Complemento do escopo para o texto (ex.: "no QR geral da empresa"). */
  inScope: string;
  watching: boolean;
  refresh: () => void;
}) {
  const toast = useToast();
  const navigate = useNavigate();
  const { accountTotal, scopeKey, scopeTotal } = snapshot;

  useEffect(() => {
    if (!enterpriseId) return;
    const result = nextMilestones(readMilestones(enterpriseId), { accountTotal, scopeKey, scopeTotal });
    saveMilestones(enterpriseId, result.state);

    if (result.celebrate.includes('first')) {
      toast.success('Seu primeiro feedback chegou!', 'O painel já mostra as primeiras métricas.', {
        actionLabel: 'Ver feedback',
        onAction: () => navigate('/user/feedbacks/all'),
        duration: 10000,
      });
    }
    if (result.celebrate.includes('ai')) {
      toast.success(
        'A IA já pode analisar os comentários',
        `Você chegou a ${MIN_FEEDBACKS_FOR_AI} feedbacks ${inScope}. Use Analisar comentários com IA, no topo.`,
        { duration: 10000 },
      );
    }
  }, [enterpriseId, accountTotal, scopeKey, scopeTotal, inScope, navigate, toast]);

  // O refresh muda a cada render do Dashboard; o intervalo usa sempre o mais recente.
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (!watching) return;
    const tick = () => {
      if (document.visibilityState === 'visible') refreshRef.current();
    };
    const intervalId = window.setInterval(tick, REFRESH_INTERVAL_MS);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [watching]);
}
