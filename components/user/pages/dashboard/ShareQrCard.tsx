import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import QrGlyph from "./QrGlyph";

/**
 * CTA compacto de compartilhamento: um mini QR Code decorativo (com linha de
 * leitura deslizante) que leva ao formulário/QR do escopo selecionado. O
 * destino (`to`) é calculado no dashboard e varia conforme o escopo.
 *
 * O QR é apenas ilustrativo — o código real (escaneável) vive na tela de
 * configuração do formulário, para onde este atalho aponta.
 */
export default function ShareQrCard({ to }: { to: string }) {
  return (
    <Link
      to={to}
      aria-label="Compartilhar o formulário de feedback pelo QR Code"
      className="group flex w-full items-center gap-4 rounded-xl border border-(--primary-color)/25 bg-(--primary-color)/8 px-4 py-3 transition-all hover:border-(--primary-color)/50 hover:bg-(--primary-color)/12 md:w-auto"
    >
      <span className="qr-anim relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg border border-(--primary-color)/30 bg-(--bg-primary)/40">
        <QrGlyph className="h-10 w-10 text-(--text-primary)" />
        <span className="qr-anim__scan" aria-hidden />
      </span>

      <span className="min-w-0">
        <span className="font-poppins flex items-center gap-1.5 text-sm font-semibold text-(--text-primary)">
          Utilize o QR Code
          <FaArrowRight className="text-[0.65rem] text-(--primary-color) transition-transform group-hover:translate-x-0.5" />
        </span>
        <span className="mt-0.5 block text-xs text-(--text-tertiary)">
          Compartilhe o formulário e colete feedbacks
        </span>
      </span>
    </Link>
  );
}
