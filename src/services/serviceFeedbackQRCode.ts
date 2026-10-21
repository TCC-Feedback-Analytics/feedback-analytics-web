import type { QrcodeFeedbackPayload } from 'lib/schemas/public/feedbackSchema';
import type { QrcodeFeedbackResponse } from 'lib/interfaces/contracts/qrcode/response.contract';
import { postPublicJson } from 'src/lib/utils/http';

// Direto no gateway: o anti-spam identifica o aparelho pelo navegador + IP do cliente.
export function ServiceSubmitQrcodeFeedback(payload: QrcodeFeedbackPayload) {
  return postPublicJson<QrcodeFeedbackResponse>(
    '/api/public/qrcode/feedback',
    payload,
  );
}
