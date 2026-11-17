import { describe, expect, it } from 'vitest';
import { countFittingNavItems } from './navOverflow';

describe('countFittingNavItems', () => {
  it('quando todos cabem, mostra todos, sem o "Mais"', () => {
    expect(countFittingNavItems([100, 80, 120], 308, 70, 4)).toBe(3);
  });

  it('quando não cabem, reserva o "Mais" e mostra os primeiros que couberem', () => {
    // 70 do "Mais" + 4 + 100 + 4 + 80 = 258; o terceiro (120) já passa de 300.
    expect(countFittingNavItems([100, 80, 120], 300, 70, 4)).toBe(2);
  });

  it('sem espaço nem para o primeiro, tudo vai para o "Mais"', () => {
    expect(countFittingNavItems([100, 80], 120, 70, 4)).toBe(0);
  });

  it('sem medida (antes do layout), mostra todos', () => {
    expect(countFittingNavItems([0, 0, 0], 0, 0, 4)).toBe(3);
  });
});
