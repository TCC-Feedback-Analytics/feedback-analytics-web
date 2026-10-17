import { describe, expect, it } from 'vitest';
import { scopeText } from './scopeText';

const items = [
  { id: 'p1', name: 'Pizza', kind: 'PRODUCT' as const },
  { id: 'p2', name: 'Refrigerante', kind: 'PRODUCT' as const },
  { id: 's1', name: 'Entrega', kind: 'SERVICE' as const },
];

describe('scopeText', () => {
  it('"Geral" é só o Avaliação geral da empresa', () => {
    expect(scopeText({ scope: 'COMPANY', catalogItemId: '', catalogItemOptions: items })).toEqual({
      label: 'Avaliação geral da empresa',
      inScope: 'na empresa (avaliação geral)',
      ofScope: 'da empresa (avaliação geral)',
    });
  });

  it('item escolhido mostra o tipo e o nome', () => {
    expect(scopeText({ scope: 'PRODUCT', catalogItemId: 'p1', catalogItemOptions: items })).toEqual({
      label: 'Produto · Pizza',
      inScope: 'no produto Pizza',
      ofScope: 'do produto Pizza',
    });
    expect(scopeText({ scope: 'SERVICE', catalogItemId: 's1', catalogItemOptions: items }).label).toBe('Serviço · Entrega');
  });

  it('tipo sem item soma todos os itens daquele tipo', () => {
    expect(scopeText({ scope: 'PRODUCT', catalogItemId: '', catalogItemOptions: items })).toEqual({
      label: 'Todos os produtos (2)',
      inScope: 'em todos os produtos',
      ofScope: 'de todos os produtos',
    });
    expect(scopeText({ scope: 'DEPARTMENT', catalogItemId: '', catalogItemOptions: items }).label).toBe('Todos os departamentos (0)');
  });

  it('item fora da lista carregada não inventa nome', () => {
    expect(scopeText({ scope: 'PRODUCT', catalogItemId: 'desconhecido', catalogItemOptions: items }).label).toBe('Produto');
  });

  it('com período, ele entra na etiqueta e nas frases; sem período nada muda', () => {
    expect(
      scopeText({ scope: 'PRODUCT', catalogItemId: 'p1', catalogItemOptions: items, period: { preset: 'LAST_30_DAYS' } }),
    ).toEqual({
      label: 'Produto · Pizza · Últimos 30 dias',
      inScope: 'no produto Pizza nos últimos 30 dias',
      ofScope: 'do produto Pizza nos últimos 30 dias',
    });
    expect(scopeText({ scope: 'COMPANY', catalogItemId: '', catalogItemOptions: items, period: { preset: 'ALL' } }).label).toBe(
      'Avaliação geral da empresa',
    );
  });
});
