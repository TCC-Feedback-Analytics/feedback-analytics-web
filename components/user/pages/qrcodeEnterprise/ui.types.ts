/**
 * Props do cabeçalho da área de QR Code da empresa.
 * Usado em: components/user/pages/qrcodeEnterprise/SectionQrHeader.tsx.
 */
export interface SectionQrHeaderProps {
  enterpriseName?: string | null;
  qrActive: boolean;
  qrLoading: boolean;
  qrError: string | null;
  onToggleQr: () => void;
  /** Título do cartão (padrão: "QR Code para Feedback"). */
  title?: string;
  /** Rótulo do sujeito (padrão: "Empresa:"); use "Item:" em escopo de catálogo. */
  subjectLabel?: string;
}

/**
 * Props da seção de exibição do QR Code e ações de compartilhamento.
 * Usado em: components/user/pages/qrcodeEnterprise/SectionQrCodeDisplay.tsx.
 */
export interface SectionQrCodeDisplayProps {
  enterpriseName?: string | null;
  qrActive: boolean;
  qrCodeUrl: string;
  feedbackUrl: string;
  showCopied: boolean;
  onDownload: () => void;
  onCopyLink: () => void;
  onShare: () => void;
}

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
