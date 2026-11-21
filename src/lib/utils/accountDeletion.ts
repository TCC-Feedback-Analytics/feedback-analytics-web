/**
 * "Excluir minha conta" em três passos: o pedido no Perfil, o link do e-mail
 * (página /conta/excluir) e 15 dias de conta parada, com o aviso para desistir
 * (página /conta/exclusao-agendada). Depois, o gateway apaga tudo.
 */
export const ACCOUNT_DELETION_CONFIRM_PATH = '/conta/excluir';
export const ACCOUNT_DELETION_PENDING_PATH = '/conta/exclusao-agendada';
export const ACCOUNT_DELETION_GRACE_DAYS = 15;

/** Data da exclusão no fuso de Brasília, como nos e-mails: 05/12/2026. */
export function formatDeletionDate(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date(iso));
}
