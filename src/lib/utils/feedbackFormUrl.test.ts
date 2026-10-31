import { describe, expect, it } from 'vitest';
import { feedbackFormUrl, withChannel } from './feedbackFormUrl';

const origin = 'https://app.test';

describe('endereço do formulário com o canal de coleta', () => {
  it('empresa: cada canal leva a sua marca', () => {
    expect(feedbackFormUrl({ origin, enterpriseId: 'e1', channel: 'QR' })).toBe(`${origin}/feedback/qrcode?enterprise=e1&canal=qr`);
    expect(feedbackFormUrl({ origin, enterpriseId: 'e1', channel: 'LINK' })).toBe(`${origin}/feedback/qrcode?enterprise=e1&canal=link`);
  });

  it('item: leva o ponto de coleta e o item, menos na etiqueta NFC, que precisa caber na memória', () => {
    expect(feedbackFormUrl({ origin, enterpriseId: 'e1', collectionPointId: 'cp1', itemId: 'i1', channel: 'QR' }))
      .toBe(`${origin}/feedback/qrcode?enterprise=e1&collection_point=cp1&item=i1&canal=qr`);
    expect(feedbackFormUrl({ origin, enterpriseId: 'e1', collectionPointId: 'cp1', itemId: 'i1', channel: 'NFC' }))
      .toBe(`${origin}/feedback/qrcode?enterprise=e1&collection_point=cp1&canal=nfc`);
  });

  it('troca o canal de um endereço pronto (o teste do dono)', () => {
    expect(withChannel(`${origin}/feedback/qrcode?enterprise=e1&canal=link`, 'TEST')).toBe(`${origin}/feedback/qrcode?enterprise=e1&canal=teste`);
  });
});
