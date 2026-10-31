import {
  CHANNEL_URL_PARAM,
  CHANNEL_URL_VALUES,
  type FeedbackChannel,
} from 'lib/schemas/public/feedbackChannel';

/**
 * Endereço do formulário público, com a marca do canal de coleta (`canal=qr|link|nfc|teste`).
 * O mesmo formulário serve a todos os canais; a marca só diz por onde o cliente chegou.
 * Na etiqueta NFC o `item` fica de fora: é redundante com o `collection_point` e o
 * endereço precisa caber na memória da etiqueta.
 */
export function feedbackFormUrl({
  enterpriseId,
  collectionPointId,
  itemId,
  channel,
  origin = window.location.origin,
}: {
  enterpriseId: string;
  collectionPointId?: string | null;
  itemId?: string | null;
  channel: FeedbackChannel;
  origin?: string;
}): string {
  const params = new URLSearchParams({ enterprise: enterpriseId });
  if (collectionPointId) params.set('collection_point', collectionPointId);
  if (itemId && channel !== 'NFC') params.set('item', itemId);
  params.set(CHANNEL_URL_PARAM, CHANNEL_URL_VALUES[channel]);
  return `${origin}/feedback/qrcode?${params.toString()}`;
}

/** O mesmo endereço com outro canal (ex.: o link copiado vira o do "Testar o formulário"). */
export function withChannel(url: string, channel: FeedbackChannel): string {
  const parsed = new URL(url, window.location.origin);
  parsed.searchParams.set(CHANNEL_URL_PARAM, CHANNEL_URL_VALUES[channel]);
  return parsed.toString();
}
