import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import type { CommentFieldSettings } from 'lib/schemas/public/commentField';
import type { PublicQrFeedbackFormViewModel } from './fields/fieldsQRCode/ui.types';
import FormQRCodeFeedback from './formQRCodeFeedback';

afterEach(cleanup);

function model(commentField?: CommentFieldSettings): PublicQrFeedbackFormViewModel {
  return {
    state: {
      formData: { message: '', rating: 0, answers: [], subanswers: [], enterprise_id: 'e1' },
      questions: [],
      customerData: {},
      showOptionalFields: false,
      error: '',
      isSubmitting: false,
      commentField,
    },
    actions: {
      updateFormData: vi.fn(),
      updateAnswer: vi.fn(),
      updateSubanswer: vi.fn(),
      updateCustomerData: vi.fn(),
      toggleOptionalFields: vi.fn(),
      submit: vi.fn(),
    },
  };
}

describe('formulário do cliente — campo de comentário do escopo', () => {
  it('sem configuração, mostra o convite padrão', () => {
    render(<FormQRCodeFeedback model={model()} />);
    expect(screen.getByLabelText(/Conte-nos mais sobre sua experiência/)).toBeInTheDocument();
  });

  it('com a pergunta própria, mostra a pergunta no lugar do convite', () => {
    render(<FormQRCodeFeedback model={model({ mode: 'CUSTOM', prompt: 'O que mudaria neste prato?' })} />);
    expect(screen.getByLabelText(/O que mudaria neste prato\?/)).toBeInTheDocument();
    expect(screen.queryByText(/Conte-nos mais sobre sua experiência/)).not.toBeInTheDocument();
  });

  it('com o campo oculto, não pede comentário', () => {
    render(<FormQRCodeFeedback model={model({ mode: 'HIDDEN', prompt: null })} />);
    expect(screen.queryByRole('textbox', { name: /experiência|opcional/ })).not.toBeInTheDocument();
    expect(document.getElementById('message')).toBeNull();
  });

  it('mantém os controles do novo formulário acessíveis e funcionais', () => {
    const formModel = model();
    render(<FormQRCodeFeedback model={formModel} />);

    fireEvent.click(screen.getByRole('radio', { name: /5 estrelas: muito satisfeito/i }));
    expect(formModel.actions.updateFormData).toHaveBeenCalledWith({ rating: 5 });

    const personalInfoButton = screen.getByRole('button', { name: /informações pessoais/i });
    expect(personalInfoButton).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(personalInfoButton);
    expect(formModel.actions.toggleOptionalFields).toHaveBeenCalledOnce();
    expect(screen.getByText(/seus dados são protegidos/i)).toBeInTheDocument();
  });
});
