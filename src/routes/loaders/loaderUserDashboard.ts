import type { LoaderFunctionArgs } from 'react-router-dom';
import type { FeedbackStats } from 'lib/interfaces/domain/feedback.domain';
import { loadFeedbackStatsData } from 'src/routes/load/loadFeedbackStats';
import { loadQrCodeEnterpriseData } from 'src/routes/load/loadQrCodeEnterprise';

export async function LoaderUserDashboard(_args: LoaderFunctionArgs) {
  void _args;

  // Escopo inicial = COMPANY (Geral), igual ao padrão do seletor no header.
  // Sem escopo, a API devolve a conta inteira: diz se a empresa ainda não tem
  // nenhum feedback (bloco de boas-vindas). Uma falha nela não bloqueia o painel.
  const [stats, accountStats, qr] = await Promise.all([
    loadFeedbackStatsData({ scope_type: 'COMPANY' }),
    loadFeedbackStatsData(),
    loadQrCodeEnterpriseData(),
  ]);

  const feedbackStats: FeedbackStats | null = stats;
  const dashboardError =
    feedbackStats !== null
      ? null
      : 'Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.';

  return {
    stats: feedbackStats,
    accountTotalFeedbacks: accountStats?.totalFeedbacks ?? null,
    qrActive: qr.qrError ? null : qr.qrActive,
    dashboardError,
  };
}
