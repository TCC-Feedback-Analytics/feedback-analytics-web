import { describe, it, expect } from 'vitest';
import { getPasswordStrength, loadPasswordScorer, userInputTokens } from '../passwordStrength';

describe('[Unidade] força da senha (zxcvbn)', () => {
  it('vazia não mostra a barra', () => {
    const s = getPasswordStrength('', null);
    expect(s.showBar).toBe(false);
    expect(s.meetsPolicy).toBe(false);
  });

  it('enquanto o medidor carrega, mostra a barra sem nota', () => {
    const s = getPasswordStrength('algo', null);
    expect(s.showBar).toBe(true);
    expect(s.label).toBe('');
  });

  it('palavra + número + a mesma palavra deixou de ser forte', async () => {
    const score = await loadPasswordScorer();
    const s = getPasswordStrength('Palavra123palavra', score('Palavra123palavra'));
    expect(s.label).not.toBe('Forte');
    expect(s.meetsPolicy).toBe(false);
    expect(s.hint).toBeTruthy();
  });

  it('frase curta ou palavras com símbolo chegam a "Forte" e passam', async () => {
    const score = await loadPasswordScorer();
    for (const password of ['sol azul de manha', 'Gato!Verde!Pulou']) {
      const s = getPasswordStrength(password, score(password));
      expect(s).toMatchObject({ label: 'Forte', meetsPolicy: true, hint: null, color: 'bg-green-500' });
    }
  });

  it('curta nunca passa, mesmo aleatória, e pede os 10 caracteres', async () => {
    const score = await loadPasswordScorer();
    const s = getPasswordStrength('Xk9#mQ2v', score('Xk9#mQ2v'));
    expect(s.meetsPolicy).toBe(false);
    expect(s.hint).toBe('Use pelo menos 10 caracteres.');
  });

  it('o nome do negócio dentro da senha derruba a nota', async () => {
    const score = await loadPasswordScorer();
    expect(getPasswordStrength('PadariaBomPao!2026', score('PadariaBomPao!2026')).meetsPolicy).toBe(true);
    const withInputs = score('PadariaBomPao!2026', userInputTokens(['Padaria Bom Pão']));
    expect(getPasswordStrength('PadariaBomPao!2026', withInputs).meetsPolicy).toBe(false);
  });

  it('separa os dados da pessoa em pedaços, sem acento', () => {
    expect(userInputTokens(['Padaria Bom Pão', '', null])).toEqual(['padaria bom pao', 'padaria', 'bom', 'pao', 'padariabompao']);
  });
});
