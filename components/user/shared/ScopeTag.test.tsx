import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import ScopeTag from './ScopeTag';

const controls = vi.hoisted(() => ({
  value: { scope: 'COMPANY', catalogItemId: '', catalogItemOptions: [] as Array<{ id: string; name: string; kind: string }> },
}));

vi.mock('src/lib/context/insightsControls', () => ({
  useInsightsControls: () => controls.value,
}));

beforeEach(() => {
  controls.value = { scope: 'COMPANY', catalogItemId: '', catalogItemOptions: [] };
});

afterEach(cleanup);

describe('[Unidade] ScopeTag', () => {
  it('mostra de quem é o número', () => {
    render(<ScopeTag />);
    expect(screen.getByRole('button')).toHaveTextContent('QR geral da empresa');
  });

  it('com item escolhido mostra o tipo e o nome', () => {
    controls.value = {
      scope: 'PRODUCT',
      catalogItemId: 'p1',
      catalogItemOptions: [{ id: 'p1', name: 'Pizza', kind: 'PRODUCT' }],
    };
    render(<ScopeTag />);
    expect(screen.getByRole('button')).toHaveTextContent('Produto · Pizza');
  });

  it('clicar abre o seletor de escopo do cabeçalho', () => {
    const openSelector = vi.fn();
    render(
      <>
        <button data-scope-selector-trigger="" aria-expanded="false" onClick={openSelector}>
          Seletor
        </button>
        <ScopeTag />
      </>,
    );
    Element.prototype.scrollIntoView = vi.fn();
    fireEvent.click(screen.getByRole('button', { name: /QR geral da empresa/ }));
    expect(openSelector).toHaveBeenCalledOnce();
  });
});
