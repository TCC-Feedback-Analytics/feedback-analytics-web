import { useEffect, useState } from 'react';
import { buildQrCodeDataUrl } from 'src/lib/utils/qrcode';

/**
 * QR Code do endereço como imagem (data URL), gerado no navegador. Vazio
 * enquanto gera, sem endereço ou se a geração falhar.
 */
export function useQrCodeDataUrl(text: string): string {
  const [result, setResult] = useState({ text: '', url: '' });

  useEffect(() => {
    if (!text) return;
    let cancelled = false;
    buildQrCodeDataUrl(text)
      .then((url) => {
        if (!cancelled) setResult({ text, url });
      })
      .catch((error) => {
        console.error('Erro ao gerar o QR Code:', error);
      });
    return () => {
      cancelled = true;
    };
  }, [text]);

  return result.text === text ? result.url : '';
}
