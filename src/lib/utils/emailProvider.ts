/**
 * Provedor do e-mail pelo domínio, para o botão "Abrir o Gmail" depois do
 * cadastro. São os endereços web da caixa de entrada: no celular, os do Gmail e
 * do Outlook costumam abrir o aplicativo quando ele está instalado. E-mail de
 * empresa (domínio próprio) não tem provedor conhecido: sem botão.
 */
export type EmailProvider = { name: string; url: string };

const PROVIDERS: Array<{ domains: string[]; provider: EmailProvider }> = [
  { domains: ['gmail.com', 'googlemail.com'], provider: { name: 'Gmail', url: 'https://mail.google.com/mail/u/0/#inbox' } },
  {
    domains: ['outlook.com', 'outlook.com.br', 'hotmail.com', 'hotmail.com.br', 'live.com', 'msn.com'],
    provider: { name: 'Outlook', url: 'https://outlook.live.com/mail/0/inbox' },
  },
  { domains: ['yahoo.com', 'yahoo.com.br', 'ymail.com'], provider: { name: 'Yahoo Mail', url: 'https://mail.yahoo.com' } },
  { domains: ['icloud.com', 'me.com', 'mac.com'], provider: { name: 'iCloud Mail', url: 'https://www.icloud.com/mail' } },
  { domains: ['uol.com.br'], provider: { name: 'UOL Mail', url: 'https://email.uol.com.br' } },
  { domains: ['bol.com.br'], provider: { name: 'BOL Mail', url: 'https://email.bol.uol.com.br' } },
  { domains: ['terra.com.br'], provider: { name: 'Terra Mail', url: 'https://mail.terra.com.br' } },
];

export function emailProviderOf(email: string | null | undefined): EmailProvider | null {
  const domain = String(email ?? '').trim().toLowerCase().split('@')[1];
  if (!domain) return null;
  return PROVIDERS.find((entry) => entry.domains.includes(domain))?.provider ?? null;
}
