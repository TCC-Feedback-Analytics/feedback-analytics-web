import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigation, useRouteLoaderData } from 'react-router-dom';
import Profile from '../user/profile';

const mockFetcherState = vi.hoisted(() => ({
  data: undefined as unknown,
  submit: vi.fn(),
}));

vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>();

  return {
    ...actual,
    useNavigation: vi.fn(),
    useRouteLoaderData: vi.fn(),
    useFetcher: () => ({
      state: 'idle',
      data: mockFetcherState.data,
      Form: (props: React.FormHTMLAttributes<HTMLFormElement>) => <form {...props} />,
      submit: mockFetcherState.submit,
    }),
  };
});

// Mock dos componentes filhos
vi.mock('components/user/pages/profile/editUser/information', () => ({
  default: ({
    defaultFullName,
    defaultEmail,
    defaultPhone,
  }: {
    defaultFullName?: string;
    defaultEmail?: string;
    defaultPhone?: string;
  }) => (
    <div data-testid="profile-info">
      <div data-testid="enterprise-name">{defaultFullName}</div>
      <div data-testid="profile-email">{defaultEmail}</div>
      <div data-testid="profile-phone">{defaultPhone}</div>
    </div>
  ),
}));

vi.mock('components/user/shared/PageHeader', () => ({
  default: () => <div data-testid="page-header">PageHeader</div>,
}));

// Mock do useRouteLoaderData e useNavigation
const mockUseRouteLoaderData = vi.mocked(useRouteLoaderData);
const mockUseNavigation = vi.mocked(useNavigation);

describe('[Unidade] Profile Page', () => {
  const mockData = {
    enterprise: {
      id: '1',
      name: 'Empresa Teste',
      email: 'empresa@teste.com',
    },
    user: {
      id: '1',
      name: 'João Silva',
      email: 'joao@teste.com',
      user_metadata: {
        full_name: 'João Silva',
      },
    },
    collecting: {
      id: '1',
      uses_company_products: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetcherState.data = undefined;
    mockUseNavigation.mockReturnValue({
      state: 'idle',
      location: undefined,
      formMethod: undefined,
      formAction: undefined,
      formEncType: undefined,
      formData: undefined,
      json: undefined,
      text: undefined,
    } as unknown as ReturnType<typeof useNavigation>);
  });

  it('deve renderizar os componentes principais com dados válidos', () => {
    mockUseRouteLoaderData.mockReturnValue(mockData);

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByTestId('profile-info')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dados pessoais e acesso' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dados e configurações da empresa' })).toBeInTheDocument();
  });

  it('deve renderizar o cabeçalho de página (PageHeader)', () => {
    mockUseRouteLoaderData.mockReturnValue(mockData);

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
  });

  it('mantém o dialog aberto ao clicar em Editar contexto e LLM', () => {
    mockUseRouteLoaderData.mockReturnValue(mockData);

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Editar contexto e LLM' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Contexto e configuração de IA')).toBeInTheDocument();
    expect(screen.queryByLabelText('Fechar')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('dialog'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('avança da etapa 3 para a etapa 4 sem fechar o dialog', () => {
    mockUseRouteLoaderData.mockReturnValue({
      ...mockData,
      collecting: {
        ...mockData.collecting,
        business_summary: '',
        company_objective: '',
        analytics_goal: '',
      },
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Editar contexto e LLM' }));

    fireEvent.change(screen.getByPlaceholderText(/Rede de clínicas odontológicas/), {
      target: { value: 'Resumo da empresa' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Próximo Passo' }));

    fireEvent.change(screen.getByPlaceholderText(/Oferecer a melhor experiência/), {
      target: { value: 'Objetivo da empresa' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Próximo Passo' }));

    fireEvent.change(screen.getByPlaceholderText(/Identificar os principais motivos/), {
      target: { value: 'Objetivo analítico da empresa' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Próximo Passo' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4. Modelo LLM' })).toBeInTheDocument();
    expect(screen.getByText(/Passo 4 de 4/)).toBeInTheDocument();
    expect(mockFetcherState.submit).not.toHaveBeenCalled();
  });

  it('não fecha o dialog quando uma revalidação entrega uma resposta antiga do fetcher', () => {
    mockUseRouteLoaderData.mockReturnValue(mockData);

    const view = render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Editar contexto e LLM' }));

    mockFetcherState.data = { ok: true };
    view.rerender(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('deve passar os dados corretos para o componente Info', () => {
    mockUseRouteLoaderData.mockReturnValue(mockData);

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('enterprise-name')).toHaveTextContent(
      'João Silva',
    );
    expect(screen.getByTestId('profile-email')).toHaveTextContent(
      'joao@teste.com',
    );
  });

  it('deve lidar com dados de collecting nulos', () => {
    const dataWithoutCollecting = {
      ...mockData,
      collecting: null,
    };

    mockUseRouteLoaderData.mockReturnValue(dataWithoutCollecting);

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('enterprise-name')).toHaveTextContent(
      'João Silva',
    );
  });

  it('deve ter a estrutura HTML correta', () => {
    mockUseRouteLoaderData.mockReturnValue(mockData);

    const { container } = render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('font-work-sans', 'space-y-8', 'pb-8');
  });

  it('deve chamar useRouteLoaderData com a chave correta', () => {
    mockUseRouteLoaderData.mockReturnValue(mockData);

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    expect(mockUseRouteLoaderData).toHaveBeenCalledWith('user');
  });

  it('deve lidar com dados incompletos', () => {
    const incompleteData = {
      enterprise: { name: 'Empresa Parcial', full_name: 'Empresa Parcial' },
      user: { name: 'Usuário Parcial' },
      collecting: null,
    };

    mockUseRouteLoaderData.mockReturnValue(incompleteData);

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('page-header')).toBeInTheDocument();
    expect(screen.getByTestId('profile-info')).toBeInTheDocument();
    expect(screen.getByTestId('enterprise-name')).toHaveTextContent(
      'Empresa Parcial',
    );
  });
});
