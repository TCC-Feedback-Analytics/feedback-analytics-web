import { describe, expect, it } from 'vitest';
import { emailProviderOf } from './emailProvider';

describe('provedor do e-mail', () => {
  it('reconhece os provedores mais usados, sem diferenciar maiúsculas', () => {
    expect(emailProviderOf('Pessoa@Gmail.com')?.name).toBe('Gmail');
    expect(emailProviderOf('pessoa@hotmail.com')?.name).toBe('Outlook');
    expect(emailProviderOf('pessoa@outlook.com.br')?.name).toBe('Outlook');
    expect(emailProviderOf('pessoa@yahoo.com.br')?.name).toBe('Yahoo Mail');
    expect(emailProviderOf('pessoa@icloud.com')?.name).toBe('iCloud Mail');
    expect(emailProviderOf('pessoa@uol.com.br')?.name).toBe('UOL Mail');
  });

  it('e-mail de empresa ou inválido não tem provedor', () => {
    expect(emailProviderOf('contato@padariabompao.com.br')).toBeNull();
    expect(emailProviderOf('sem-arroba')).toBeNull();
    expect(emailProviderOf('')).toBeNull();
    expect(emailProviderOf(null)).toBeNull();
  });
});
