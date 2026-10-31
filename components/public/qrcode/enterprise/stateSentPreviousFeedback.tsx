import { FaClock, FaShieldHalved } from 'react-icons/fa6';
import FeedbackStatusLayout from './FeedbackStatusLayout';

export default function StateSentPreviousFeedback({
  enterpriseName,
}: {
  enterpriseName: string;
}) {
  return (
    <FeedbackStatusLayout
      tone="notice"
      eyebrow="RESPOSTA JÁ REGISTRADA"
      title="Obrigado por participar"
      description="Este dispositivo já enviou uma resposta para esta empresa hoje. Você poderá compartilhar uma nova opinião amanhã."
      icon={<FaClock className="h-8 w-8" aria-hidden />}
    >
      <div className="space-y-3">
        {enterpriseName && (
          <p className="rounded-xl border border-(--quaternary-color)/14 bg-(--bg-tertiary) px-3.5 py-3 text-xs text-(--text-secondary)">
            Empresa: <span className="font-semibold text-(--text-primary)">{enterpriseName}</span>
          </p>
        )}
        <div className="flex items-start gap-3 rounded-xl border border-(--primary-color)/22 bg-(--primary-color)/10 p-3.5">
          <FaShieldHalved className="mt-0.5 h-4 w-4 shrink-0 text-(--primary-color)" aria-hidden />
          <p className="text-xs leading-5 text-(--text-secondary)">Esse limite evita envios repetidos e ajuda a manter a qualidade das informações recebidas.</p>
        </div>
      </div>
    </FeedbackStatusLayout>
  );
}
