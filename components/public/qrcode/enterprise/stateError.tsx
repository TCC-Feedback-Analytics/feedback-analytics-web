import { FaRotateRight, FaTriangleExclamation } from 'react-icons/fa6';
import FeedbackStatusLayout from './FeedbackStatusLayout';

export default function StateError({ error }: { error: string }) {
  return (
    <FeedbackStatusLayout
      tone="error"
      eyebrow="ALGO NÃO SAIU COMO ESPERADO"
      title="Não foi possível continuar"
      description="Tente atualizar a página. Se o problema persistir, verifique sua conexão e leia o QR Code novamente."
      icon={<FaTriangleExclamation className="h-8 w-8" aria-hidden />}
    >
      <div className="space-y-4">
        <p role="alert" className="rounded-xl border border-(--negative)/30 bg-(--negative)/10 px-3.5 py-3 text-xs leading-5 text-(--negative)">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="flex h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-(--primary-color) px-5 font-poppins text-sm font-bold text-(--on-primary) transition-all hover:brightness-105 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color)"
        >
          <FaRotateRight className="h-4 w-4" aria-hidden />
          Tentar novamente
        </button>
      </div>
    </FeedbackStatusLayout>
  );
}
