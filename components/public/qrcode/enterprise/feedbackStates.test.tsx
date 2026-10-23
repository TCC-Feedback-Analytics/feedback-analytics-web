import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom';
import StateError from './stateError';
import StateSentPreviousFeedback from './stateSentPreviousFeedback';
import StateSubmitted from './stateSubmitted';

afterEach(cleanup);

describe('estados do formulário de feedback', () => {
  it('confirma o envio no padrão visual do formulário', () => {
    render(<StateSubmitted enterpriseName="Café Aurora" />);

    expect(screen.getByRole('heading', { name: 'Feedback enviado' })).toBeInTheDocument();
    expect(screen.getByText(/enviado para/i)).toHaveTextContent('Café Aurora');
    expect(screen.getByText(/novo feedback amanhã/i)).toBeInTheDocument();
  });

  it('explica o bloqueio de um segundo envio como proteção contra duplicidade', () => {
    render(<StateSentPreviousFeedback enterpriseName="Café Aurora" />);

    expect(screen.getByRole('heading', { name: 'Obrigado por participar' })).toBeInTheDocument();
    expect(screen.getByText(/limite evita envios repetidos/i)).toBeInTheDocument();
  });

  it('apresenta o erro e oferece uma ação de recuperação', () => {
    render(<StateError error="Não foi possível encontrar a empresa." />);

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível encontrar a empresa.');
    expect(screen.getByRole('button', { name: /tentar novamente/i })).toBeInTheDocument();
  });
});
