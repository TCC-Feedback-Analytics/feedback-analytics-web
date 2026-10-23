import PageHeader from 'components/user/shared/PageHeader';
import FormIaSettings from 'components/user/pages/profile/editIaSettings/formIaSettings';
import { FaBrain } from 'react-icons/fa6';

export default function EditIaSettings() {
  return (
    <div className="font-work-sans space-y-5 pb-8 sm:space-y-6">
      <PageHeader />

      <section className="space-y-5 rounded-3xl border border-(--quaternary-color)/12 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--primary-color)/15 text-(--primary-color)">
            <FaBrain aria-hidden />
          </span>
          <div>
            <h2 className="font-montserrat text-xl font-semibold text-(--text-primary)">Inteligência para analisar seus feedbacks</h2>
            <p className="mt-1 text-sm text-(--text-secondary)">Conecte sua conta OpenRouter e escolha o modelo que analisará os comentários.</p>
          </div>
        </div>
        <FormIaSettings />
      </section>
    </div>
  );
}
