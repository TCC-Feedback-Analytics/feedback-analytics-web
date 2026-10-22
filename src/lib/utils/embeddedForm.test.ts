import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  EMBEDDED_FORM_MESSAGE,
  embeddedFormUrl,
  isEmbeddedForm,
  notifyEmbeddedFormResult,
  readEmbeddedFormResult,
} from './embeddedForm';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('formulário embutido no Dashboard', () => {
  it('reconhece o ?embed=1 e monta a URL do iframe', () => {
    expect(isEmbeddedForm('?enterprise=e1&embed=1')).toBe(true);
    expect(isEmbeddedForm('?enterprise=e1')).toBe(false);
    expect(embeddedFormUrl(`${window.location.origin}/feedback/qrcode?enterprise=e1`))
      .toBe(`${window.location.origin}/feedback/qrcode?enterprise=e1&embed=1`);
  });

  it('fora de um iframe, não avisa ninguém', () => {
    const post = vi.spyOn(window, 'postMessage');
    notifyEmbeddedFormResult('sent');
    expect(post).not.toHaveBeenCalled();
  });

  it('só aceita o aviso do próprio iframe, da mesma origem', () => {
    const frame = {} as Window;
    const event = (origin: string, source: unknown, data: unknown) =>
      ({ origin, source, data }) as MessageEvent;
    const ok = { type: EMBEDDED_FORM_MESSAGE, result: 'sent' };

    expect(readEmbeddedFormResult(event(window.location.origin, frame, ok), frame)).toBe('sent');
    expect(readEmbeddedFormResult(event('https://outro.com', frame, ok), frame)).toBeNull();
    expect(readEmbeddedFormResult(event(window.location.origin, {}, ok), frame)).toBeNull();
    expect(readEmbeddedFormResult(event(window.location.origin, frame, { type: 'x', result: 'sent' }), frame)).toBeNull();
    expect(readEmbeddedFormResult(event(window.location.origin, frame, { type: EMBEDDED_FORM_MESSAGE, result: 'hack' }), frame)).toBeNull();
  });
});
