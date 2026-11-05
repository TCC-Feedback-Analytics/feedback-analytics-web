import QRCode from 'qrcode';

/**
 * Imagem PNG do QR Code (data URL), gerada no navegador. Antes vinha do
 * api.qrserver.com, que recebia o endereço do formulário com o id da empresa;
 * aqui nenhum dado sai para terceiros (LGPD).
 */
export function buildQrCodeDataUrl(data: string, size = 300): Promise<string> {
  return QRCode.toDataURL(data, { width: size, margin: 2 });
}
