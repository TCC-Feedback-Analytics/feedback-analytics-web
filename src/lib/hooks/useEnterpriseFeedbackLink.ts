import { useCallback, useMemo, useState } from 'react';
import { getQrCodeUrl } from 'src/lib/utils/qrcode';
import { useToast } from 'components/public/forms/messages/useToast';

/**
 * Link do formulário geral da empresa e o QR Code dele, com as ações de baixar,
 * copiar e compartilhar. Usado em Avaliação da empresa e no bloco de boas-vindas do
 * Dashboard, para as duas telas oferecerem exatamente o mesmo link.
 */
export function useEnterpriseFeedbackLink(enterprise: { id: string; full_name?: string | null }) {
  const toast = useToast();
  const [showCopied, setShowCopied] = useState(false);

  const feedbackUrl = useMemo(() => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/feedback/qrcode?enterprise=${enterprise.id}`;
  }, [enterprise.id]);

  const qrCodeUrl = useMemo(
    () => getQrCodeUrl(feedbackUrl, { size: 300, format: 'png' }),
    [feedbackUrl],
  );

  const download = useCallback(async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-feedback-${(enterprise.full_name || 'empresa')
        .toLowerCase()
        .replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('QR Code baixado!', 'Download iniciado automaticamente');
    } catch (error) {
      console.error('Erro ao baixar QR Code:', error);
      toast.error('Erro no download', 'Não foi possível baixar o QR Code');
    }
  }, [enterprise.full_name, qrCodeUrl, toast]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(feedbackUrl);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar link:', error);
    }
  }, [feedbackUrl]);

  const share = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Deixe seu Feedback - ${enterprise.full_name || 'Nossa Empresa'}`,
          text: 'Compartilhe sua experiência conosco! Acesse o formulário de feedback.',
          url: feedbackUrl,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      copyLink();
    }
  }, [enterprise.full_name, feedbackUrl, copyLink]);

  return { feedbackUrl, qrCodeUrl, showCopied, download, copyLink, share };
}
