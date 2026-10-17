/**
 * Props da seção "Canais de coleta": por onde o cliente chega às perguntas.
 * Hoje só o QR Code (com o link); o NFC entra como mais um canal.
 * Usado em: components/user/pages/qrcodeEnterprise/CollectionChannelsSection.tsx.
 */
export interface CollectionChannelsSectionProps {
  /** Complemento do texto: "da empresa", "deste produto". */
  ofTarget: string;
  /** Nome mostrado no QR para download (empresa ou item). */
  displayName?: string | null;
  qrActive: boolean;
  qrLoading: boolean;
  qrError?: string | null;
  onToggleQr: () => void;
  qrCodeUrl: string;
  feedbackUrl: string;
  showCopied: boolean;
  onDownload: () => void;
  onCopyLink: () => void;
  onShare: () => void;
}
