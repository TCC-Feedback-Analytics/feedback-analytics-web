import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

const { toast } = vi.hoisted(() => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('components/public/forms/messages/useToast', () => ({
  useToast: () => toast,
}));

import { useEnterpriseFeedbackLink } from './useEnterpriseFeedbackLink';

const enterprise = { id: 'ent-1', full_name: 'Padaria da Vovó' };
// Cada canal leva a sua marca: o link copiado/compartilhado é LINK, o QR é QR e a etiqueta é NFC.
const formUrl = `${window.location.origin}/feedback/qrcode?enterprise=ent-1&canal=link`;
const qrFormUrl = `${window.location.origin}/feedback/qrcode?enterprise=ent-1&canal=qr`;

describe('useEnterpriseFeedbackLink', () => {
  afterEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, { share: undefined });
  });

  it('monta o link do formulário geral e o QR Code dele', () => {
    const { result } = renderHook(() => useEnterpriseFeedbackLink(enterprise));
    expect(result.current.feedbackUrl).toBe(formUrl);
    expect(result.current.qrCodeUrl).toContain(encodeURIComponent(qrFormUrl));
    expect(result.current.nfcUrl).toBe(`${window.location.origin}/feedback/qrcode?enterprise=ent-1&canal=nfc`);
  });

  it('sem compartilhamento nativo, compartilhar copia o link', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText }, share: undefined });
    const { result } = renderHook(() => useEnterpriseFeedbackLink(enterprise));

    await act(async () => {
      await result.current.share();
    });

    expect(writeText).toHaveBeenCalledWith(formUrl);
    expect(result.current.showCopied).toBe(true);
  });

  it('com compartilhamento nativo, usa o link do formulário', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { share });
    const { result } = renderHook(() => useEnterpriseFeedbackLink(enterprise));

    await act(async () => {
      await result.current.share();
    });

    expect(share).toHaveBeenCalledWith(expect.objectContaining({ url: formUrl }));
  });
});
