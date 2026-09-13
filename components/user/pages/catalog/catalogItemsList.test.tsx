import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import CatalogItemsList from './catalogItemsList';

const mocks = vi.hoisted(() => ({
  submit: vi.fn(),
  collecting: {
    catalog_products: [
      { id: 'product-active', name: 'Produto Premium', description: 'Assinatura completa', sort_order: 0, status: 'ACTIVE' },
      { id: 'product-inactive', name: 'Produto Básico', description: 'Plano de entrada', sort_order: 1, status: 'ACTIVE' },
    ],
  },
  qrData: {
    items: [
      { catalog_item_id: 'product-active', active: true },
      { catalog_item_id: 'product-inactive', active: false },
    ],
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useFetcher: () => ({ state: 'idle', data: undefined, submit: mocks.submit }),
    useLoaderData: () => mocks.qrData,
    useRouteLoaderData: () => ({ collecting: mocks.collecting }),
  };
});

vi.mock('components/public/forms/messages/useToast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}));

describe('CatalogItemsList', () => {
  it('filtra produtos pelo texto e pelo status do QR Code', () => {
    render(<MemoryRouter><CatalogItemsList kindSlug="products" /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText('Buscar produtos'), { target: { value: 'premium' } });
    expect(screen.getByText('Produto Premium')).toBeInTheDocument();
    expect(screen.queryByText('Produto Básico')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByRole('option', { name: 'QR Code inativo' }));

    expect(screen.getByText('Produto Básico')).toBeInTheDocument();
    expect(screen.queryByText('Produto Premium')).not.toBeInTheDocument();
    expect(screen.getByText('1 de 2 itens encontrados')).toBeInTheDocument();
  });
});
