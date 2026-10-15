import { describe, expect, it } from 'vitest';
import { filterIaModelsByPrice, startsWithFreeModelsOnly } from './iaModelPriceFilter';

describe('startsWithFreeModelsOnly', () => {
  it.each([
    [null, true],
    [{ hasKey: false, provider: null, model: null, keyHint: null }, true],
    [{ hasKey: true, provider: 'openrouter', model: 'vendor/model:free', keyHint: 'x' }, true],
    [{ hasKey: true, provider: 'openrouter', model: 'vendor/model', keyHint: 'x' }, false],
    // Sem modelo salvo vale o padrão openrouter/auto, que pode usar modelos pagos.
    [{ hasKey: true, provider: 'openrouter', model: null, keyHint: 'x' }, false],
  ] as const)('%j → %s', (config, expected) => {
    expect(startsWithFreeModelsOnly(config)).toBe(expected);
  });
});

describe('filterIaModelsByPrice', () => {
  const models = [{ id: 'openrouter/auto' }, { id: 'vendor/paid' }, { id: 'vendor/free:free' }, { id: 'openrouter/free' }];

  it('sem os pagos, mantém só os gratuitos', () => {
    expect(filterIaModelsByPrice(models, { includePaid: false }).map((m) => m.id))
      .toEqual(['vendor/free:free', 'openrouter/free']);
  });

  it('mantém a seleção atual visível mesmo sendo paga', () => {
    expect(filterIaModelsByPrice(models, { includePaid: false, keepId: 'vendor/paid' }).map((m) => m.id))
      .toEqual(['vendor/paid', 'vendor/free:free', 'openrouter/free']);
  });

  it('com os pagos, devolve todos', () => {
    expect(filterIaModelsByPrice(models, { includePaid: true })).toHaveLength(4);
  });
});
