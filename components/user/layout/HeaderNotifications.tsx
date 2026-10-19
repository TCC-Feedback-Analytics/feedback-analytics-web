import { useInsightsControls } from 'src/lib/context/insightsControls';
import { useScopedPendingCount } from 'src/lib/hooks/useScopedPendingCount';
import { NotificationBellDropdown } from 'components/user/pages/feedbacksInsightsReport/NotificationBellDropdown';

/**
 * Sino do cabeçalho: feedbacks do escopo atual aguardando análise da IA. Saiu da
 * barra de controles (que fica só com escopo, período e "Analisar comentários
 * com IA") e vale em todas as telas logadas; abre a mesma janela de análise.
 */
export default function HeaderNotifications() {
  const { scope, catalogItemId, catalogItemOptions, setGenerateDialogOpen } = useInsightsControls();
  const { pendingCount, totalFeedbacks } = useScopedPendingCount(true);

  return (
    <NotificationBellDropdown
      pendingCount={pendingCount}
      totalFeedbacks={totalFeedbacks}
      scope={scope}
      catalogItemId={catalogItemId}
      catalogItemOptions={catalogItemOptions}
      onOpenGenerateDialog={() => setGenerateDialogOpen(true)}
      align="right"
    />
  );
}
