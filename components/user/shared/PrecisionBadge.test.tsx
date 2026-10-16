import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom';
import PrecisionBadge from './PrecisionBadge';

afterEach(cleanup);

const base = {
  metricName: 'Média de satisfação',
  unit: 'avaliações',
  kind: 'mean' as const,
  ofScope: 'do QR geral da empresa',
};

describe('[Unidade] PrecisionBadge', () => {
  it('sem respostas não mostra nada', () => {
    const { container } = render(<PrecisionBadge {...base} n={0} interval={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('mostra o nível e abre o painel com a faixa, o n, o escopo e o aviso', () => {
    render(<PrecisionBadge {...base} n={128} interval={{ lower: 4.03, upper: 4.36 }} />);
    fireEvent.click(screen.getByRole('button', { name: /Precisão alta/ }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Média de satisfação');
    expect(dialog).toHaveTextContent('O valor real deve estar entre 4,0 e 4,4');
    expect(dialog).toHaveTextContent('Baseado em 128 avaliações do QR geral da empresa');
    expect(dialog).toHaveTextContent('não garante que quem respondeu represente todos os seus clientes');

    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('com poucas respostas é baixa e não mostra faixa', () => {
    render(<PrecisionBadge {...base} n={4} interval={{ lower: 5, upper: 5 }} />);
    fireEvent.click(screen.getByRole('button', { name: /Precisão baixa/ }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).not.toHaveTextContent('O valor real deve estar entre');
    expect(dialog).toHaveTextContent('menos de 10 respostas');
  });
});
