import { describe, expect, it } from 'vitest';
import { menuData } from './menu';
import { getSectionSiblings } from 'src/lib/utils/sectionSiblings';

describe('menu lateral', () => {
  it('o detalhe de cada grupo do Dashboard vem logo depois da Visão geral, como página própria', () => {
    expect(menuData.slice(0, 3)).toMatchObject([
      { label: 'Visão geral', to: '/user/dashboard' },
      { label: 'Nota', to: '/user/ratings' },
      { label: 'Clientes e canais', to: '/user/customers' },
    ]);
    // Páginas de topo: sem abas de seção, como a Visão geral.
    expect(getSectionSiblings('/user/ratings')).toEqual([]);
    expect(getSectionSiblings('/user/customers')).toEqual([]);
  });

  it('"Comparar itens" e o histórico de diagnósticos vêm em seguida, também como páginas próprias', () => {
    expect(menuData.slice(3, 5)).toMatchObject([
      { label: 'Comparar itens', to: '/user/compare' },
      { label: 'Diagnósticos ✨', to: '/user/diagnosis' },
    ]);
    expect(getSectionSiblings('/user/compare')).toEqual([]);
    expect(getSectionSiblings('/user/diagnosis')).toEqual([]);
  });

  it('o resumo da Análise dos comentários não repete o nome "Visão geral"', () => {
    const comments = menuData.find((item) => item.label.startsWith('Análise dos comentários'));
    expect(comments?.children?.map((child) => child.label)).toEqual(['Resumo', 'Comentários']);
  });
});
