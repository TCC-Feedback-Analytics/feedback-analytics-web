import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PeriodSelectorDropdown } from './PeriodSelectorDropdown';

afterEach(cleanup);

function openSelector() {
  fireEvent.click(screen.getByRole('button', { name: /Período:/ }));
}

describe('PeriodSelectorDropdown', () => {
  it('mostra "Todo o período" e troca para uma janela pronta', () => {
    const onChange = vi.fn();
    render(<PeriodSelectorDropdown value={{ preset: 'ALL' }} onChange={onChange} />);

    expect(screen.getByRole('button', { name: /Todo o período/ })).toBeInTheDocument();
    openSelector();
    fireEvent.click(screen.getByRole('option', { name: 'Últimos 30 dias' }));

    expect(onChange).toHaveBeenCalledWith({ preset: 'LAST_30_DAYS' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('Personalizado só aplica com o início antes do fim', () => {
    const onChange = vi.fn();
    render(<PeriodSelectorDropdown value={{ preset: 'ALL' }} onChange={onChange} />);

    openSelector();
    fireEvent.click(screen.getByRole('option', { name: 'Personalizado' }));
    const apply = screen.getByRole('button', { name: 'Aplicar período' });
    expect(apply).toBeDisabled();

    fireEvent.change(screen.getByLabelText('De'), { target: { value: '2026-10-10' } });
    fireEvent.change(screen.getByLabelText('Até'), { target: { value: '2026-10-01' } });
    expect(screen.getByText('A data inicial precisa ser antes da final.')).toBeInTheDocument();
    expect(apply).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Até'), { target: { value: '2026-10-17' } });
    fireEvent.click(apply);
    expect(onChange).toHaveBeenCalledWith({ preset: 'CUSTOM', from: '2026-10-10', to: '2026-10-17' });
  });

  it('escolher o período que já está ativo não recarrega nada', () => {
    const onChange = vi.fn();
    render(<PeriodSelectorDropdown value={{ preset: 'LAST_7_DAYS' }} onChange={onChange} />);

    openSelector();
    fireEvent.click(screen.getByRole('option', { name: 'Últimos 7 dias' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
