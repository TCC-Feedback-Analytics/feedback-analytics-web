import { describe, expect, it } from 'vitest';
import { commentFieldConfigPath, formConfigPath } from './formConfigPath';

describe('tela de configuração do formulário do escopo', () => {
  it('empresa, tipo inteiro e item', () => {
    expect(formConfigPath('COMPANY', '')).toBe('/user/edit/feedback-general');
    expect(formConfigPath('PRODUCT', '')).toBe('/user/edit/feedback-products');
    expect(formConfigPath('SERVICE', 'item-1')).toBe('/user/edit/feedback/services/item-1');
  });

  it('o atalho do comentário vai direto ao cartão, menos na lista do tipo', () => {
    expect(commentFieldConfigPath('COMPANY', null)).toBe('/user/edit/feedback-general#campo-comentario');
    expect(commentFieldConfigPath('DEPARTMENT', 'item-2')).toBe('/user/edit/feedback/departments/item-2#campo-comentario');
    expect(commentFieldConfigPath('PRODUCT', null)).toBe('/user/edit/feedback-products');
  });
});
