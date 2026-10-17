import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CollectionChannelsSection from './CollectionChannelsSection';
import type { CollectionChannelsSectionProps } from './ui.types';

vi.mock('components/user/shared/HelpHint', () => ({ default: () => null }));

function renderSection(props: Partial<CollectionChannelsSectionProps> = {}) {
  const onToggleQr = vi.fn();
  render(
    <CollectionChannelsSection
      ofTarget="da empresa"
      displayName="Padaria da Vovó"
      qrActive={false}
      qrLoading={false}
      onToggleQr={onToggleQr}
      qrCodeUrl="https://qr.example/img.png"
      feedbackUrl="https://app.example/feedback/qrcode?enterprise=ent-1"
      showCopied={false}
      onDownload={vi.fn()}
      onCopyLink={vi.fn()}
      onShare={vi.fn()}
      {...props}
    />,
  );
  return onToggleQr;
}

describe('[Unidade] Canais de coleta', () => {
  afterEach(() => cleanup());

  it('separa o canal das perguntas e mostra o QR Code com o link', () => {
    renderSection();
    expect(screen.getByRole('region', { name: 'Por onde seus clientes respondem' })).toBeInTheDocument();
    expect(screen.getByText(/Os canais levam às perguntas da empresa/)).toBeInTheDocument();
    expect(screen.getByText('QR Code e link')).toBeInTheDocument();
    expect(screen.getByText('https://app.example/feedback/qrcode?enterprise=ent-1')).toBeInTheDocument();
    // Passos e dicas num card só, com as dicas recolhidas, para caber numa tela.
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('Dicas de uso').closest('details')).not.toHaveAttribute('open');
  });

  it('pausado, esconde o QR, não deixa baixar e oferece ativar a coleta', () => {
    const onToggleQr = renderSection({ qrActive: false });
    expect(screen.getByText('Pausado')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Ative a coleta para mostrar o QR Code.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Baixar QR Code/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /Ativar coleta/ }));
    expect(onToggleQr).toHaveBeenCalledOnce();
  });

  it('ativo, oferece pausar e mostra o erro quando houver', () => {
    renderSection({ qrActive: true, qrError: 'Não foi possível atualizar o QR.' });
    expect(screen.getByText('Recebendo respostas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pausar coleta/ })).toBeInTheDocument();
    expect(screen.getByText('Não foi possível atualizar o QR.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /QR Code para feedback - Padaria da Vovó/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Baixar QR Code/ })).toBeEnabled();
  });
});
