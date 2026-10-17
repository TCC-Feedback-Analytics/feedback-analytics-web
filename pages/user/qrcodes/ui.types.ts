/**
 * Resposta da action de ativação/desativação do QR Code.
 * Usado em: pages/user/edit/editFeedbackGeneral.tsx e components/user/pages/dashboard/DashboardWelcome.tsx.
 */
export type QrCodeEnterpriseActionResponse = {
  ok?: boolean;
  active?: boolean;
  error?: string;
};
