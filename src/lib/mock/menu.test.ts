import { describe, expect, it } from 'vitest';
import { menuData } from './menu';
import { getSectionSiblings } from 'src/lib/utils/sectionSiblings';

describe('menu lateral', () => {
  it('"Comparar itens" fica logo depois da Visão geral, como página própria', () => {
    expect(menuData.map((item) => item.label).slice(0, 2)).toEqual(['Visão geral', 'Comparar itens']);
    expect(menuData[1].to).toBe('/user/compare');
    // Página de topo: sem abas de seção, como a Visão geral.
    expect(getSectionSiblings('/user/compare')).toEqual([]);
  });
});
