import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import NfcTagCard from './NfcTagCard';

const nfcUrl = 'https://app.test/feedback/qrcode?enterprise=e1&canal=nfc';

afterEach(() => {
  cleanup();
  delete (window as { NDEFReader?: unknown }).NDEFReader;
  vi.restoreAllMocks();
});

function withNfc(write: (...args: unknown[]) => Promise<void>) {
  (window as { NDEFReader?: unknown }).NDEFReader = class {
    write = write;
  };
}

describe('Etiqueta NFC', () => {
  it('no Chrome do Android, grava o endereço da etiqueta com um toque', async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    withNfc(write);
    render(<NfcTagCard nfcUrl={nfcUrl} qrActive />);

    fireEvent.click(screen.getByRole('button', { name: /Gravar etiqueta/ }));
    expect(await screen.findByText(/Etiqueta gravada/)).toBeInTheDocument();
    expect(write).toHaveBeenCalledWith({ records: [{ recordType: 'url', data: nfcUrl }] }, expect.objectContaining({ signal: expect.anything() }));
    expect(screen.getByRole('button', { name: /Gravar outra etiqueta/ })).toBeInTheDocument();
  });

  it('enquanto espera a etiqueta, orienta e deixa cancelar', async () => {
    withNfc((_message, options) => new Promise((_resolve, reject) => {
      (options as { signal: AbortSignal }).signal.addEventListener('abort', () => reject(new DOMException('cancelado', 'AbortError')));
    }));
    render(<NfcTagCard nfcUrl={nfcUrl} qrActive />);

    fireEvent.click(screen.getByRole('button', { name: /Gravar etiqueta/ }));
    expect(await screen.findByText(/Aproxime a etiqueta/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(await screen.findByRole('button', { name: /Gravar etiqueta/ })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('explica a falha de permissão', async () => {
    withNfc(vi.fn().mockRejectedValue(new DOMException('negado', 'NotAllowedError')));
    render(<NfcTagCard nfcUrl={nfcUrl} qrActive />);

    fireEvent.click(screen.getByRole('button', { name: /Gravar etiqueta/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('não deu permissão para usar o NFC');
  });

  it('sem Web NFC (iPhone, computador), dá o endereço para copiar e os passos pelo app', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<NfcTagCard nfcUrl={nfcUrl} qrActive />);

    expect(screen.queryByRole('button', { name: /Gravar etiqueta/ })).not.toBeInTheDocument();
    expect(screen.getByText('Como gravar pelo iPhone')).toBeInTheDocument();
    // Fica claro que a etiqueta é comprada, não impressa.
    expect(screen.getByText('Compre as etiquetas')).toBeInTheDocument();
    expect(screen.getByText(/não é impressa/)).toHaveTextContent('etiqueta NFC NTAG215');
    fireEvent.click(screen.getByRole('button', { name: /Copiar endereço da etiqueta/ }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(nfcUrl));
    expect(await screen.findByRole('button', { name: /Endereço copiado!/ })).toBeInTheDocument();
  });

  it('com a coleta pausada, avisa que a etiqueta também não recebe', () => {
    render(<NfcTagCard nfcUrl={nfcUrl} qrActive={false} />);
    expect(screen.getByText(/ative a coleta para ela funcionar/)).toBeInTheDocument();
  });
});
