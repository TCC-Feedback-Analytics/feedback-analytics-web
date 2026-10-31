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
  /** Endereço gravado na etiqueta NFC (marcado como canal NFC). */
  nfcUrl: string;
  showCopied: boolean;
  onDownload: () => void;
  onCopyLink: () => void;
  onShare: () => void;
}

/**
 * Props do card "Etiqueta NFC" dos Canais de coleta.
 * Usado em: components/user/pages/qrcodeEnterprise/NfcTagCard.tsx.
 */
export interface NfcTagCardProps {
  nfcUrl: string;
  /** A etiqueta usa a mesma coleta do QR: pausada, ela não recebe respostas. */
  qrActive: boolean;
}

/** Etapas da gravação da etiqueta pelo navegador (Web NFC). */
export type NfcWriteState = 'idle' | 'writing' | 'done' | 'error';
