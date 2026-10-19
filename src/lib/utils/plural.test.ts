import { describe, expect, it } from 'vitest';
import { countLabel, pluralWord } from './plural';

describe('plural', () => {
  it('singular com 1 e plural com os outros números', () => {
    expect(countLabel(1, 'respostas')).toBe('1 resposta');
    expect(countLabel(0, 'respostas')).toBe('0 respostas');
    expect(countLabel(64, 'respostas')).toBe('64 respostas');
    expect(countLabel(1, 'avaliações')).toBe('1 avaliação');
    expect(countLabel(1, 'comentários analisados')).toBe('1 comentário analisado');
    expect(countLabel(1200, 'feedbacks')).toBe('1.200 feedbacks');
  });

  it('palavra fora da lista fica como veio', () => {
    expect(pluralWord(1, 'itens')).toBe('itens');
  });
});
