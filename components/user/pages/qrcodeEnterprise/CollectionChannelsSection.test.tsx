import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CollectionChannelsSection from './CollectionChannelsSection';
import type { CollectionChannelsSectionProps } from './ui.types';

vi.mock('./SectionQrInstructions', () => ({ default: () => <div>Instruções do QR</div> }));
vi.mock('./SectionQrCodeDisplay', () => ({ default: () => <div>QR para baixar</div> }));
vi.mock('./SectionQrUsageTips', () => ({ default: () => <div>Dicas de uso</div> }));

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
    expect(screen.getByText('QR para baixar')).toBeInTheDocument();
  });

  it('pausado, oferece ativar a coleta', () => {
    const onToggleQr = renderSection({ qrActive: false });
    expect(screen.getByText('Pausado')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Ativar coleta/ }));
    expect(onToggleQr).toHaveBeenCalledOnce();
  });

  it('ativo, oferece pausar e mostra o erro quando houver', () => {
    renderSection({ qrActive: true, qrError: 'Não foi possível atualizar o QR.' });
    expect(screen.getByText('Recebendo respostas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pausar coleta/ })).toBeInTheDocument();
    expect(screen.getByText('Não foi possível atualizar o QR.')).toBeInTheDocument();
  });
});
