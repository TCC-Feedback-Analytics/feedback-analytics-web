import { FaCircleCheck, FaLock } from 'react-icons/fa6';
import FeedbackStatusLayout from './FeedbackStatusLayout';

export default function StateSubmitted({
  enterpriseName,
}: {
  enterpriseName: string;
}) {
  return (
    <FeedbackStatusLayout
      tone="success"
      eyebrow="RESPOSTA RECEBIDA"
      title="Feedback enviado"
      description="Obrigado por compartilhar sua experiência. Sua resposta já foi registrada e ajudará a melhorar os próximos atendimentos."
      icon={<FaCircleCheck className="h-8 w-8" aria-hidden />}
    >
      <div className="space-y-3">
        {enterpriseName && (
          <p className="rounded-xl border border-(--quaternary-color)/14 bg-(--bg-tertiary) px-3.5 py-3 text-xs text-(--text-secondary)">
            Enviado para <span className="font-semibold text-(--text-primary)">{enterpriseName}</span>
          </p>
        )}
        <div className="flex items-start gap-3 rounded-xl border border-(--primary-color)/22 bg-(--primary-color)/10 p-3.5">
          <FaLock className="mt-0.5 h-4 w-4 shrink-0 text-(--primary-color)" aria-hidden />
          <p className="text-xs leading-5 text-(--text-secondary)">Para preservar a qualidade das respostas, este dispositivo poderá enviar um novo feedback amanhã.</p>
        </div>
      </div>
    </FeedbackStatusLayout>
  );
}
