import { describe, expect, it } from 'vitest';
import { isFreeIaModel } from '../isFreeIaModel';

describe('isFreeIaModel — identificadores explicitamente gratuitos', () => {
  it.each(['vendor/model:free', 'vendor/another-model:free', 'openrouter/free'])('reconhece %s', (id) => {
    expect(isFreeIaModel(id)).toBe(true);
  });

  it.each(['openrouter/auto', 'openrouter/auto-beta', 'vendor/model', 'vendor/free-model',
    'freedom/model', 'vendor/model:free-preview', 'vendor/model:free:online', 'openrouter/free-other', ''])(
    'não infere gratuidade por nomes parecidos: %s', (id) => {
      expect(isFreeIaModel(id)).toBe(false);
    },
  );
});
