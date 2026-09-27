import type { CollectingDataEnterprise } from 'lib/interfaces/entities/enterprise.entity';
import { useCallback, useState } from 'react';
import { FaArrowRight, FaBuilding, FaBoxOpen, FaCheck, FaFloppyDisk, FaGear } from 'react-icons/fa6';
import { Form, Link, useRouteLoaderData } from 'react-router-dom';
import type { FeedbackTypeOption } from './ui.types';
import { Switch } from 'components/ui/switch';

const FEEDBACK_TYPES: FeedbackTypeOption[] = [
  { name: 'uses_company_products', savedKey: 'uses_company_products', title: 'Produtos', description: 'Colete avaliações por produto.', configLink: '/user/edit/feedback-products', icon: FaBoxOpen },
  { name: 'uses_company_services', savedKey: 'uses_company_services', title: 'Serviços', description: 'Colete avaliações por serviço.', configLink: '/user/edit/feedback-services', icon: FaGear },
  { name: 'uses_company_departments', savedKey: 'uses_company_departments', title: 'Departamentos', description: 'Colete avaliações por área.', configLink: '/user/edit/feedback-departments', icon: FaBuilding },
];

export default function FormTypesFeedback() {
  const { collecting } = useRouteLoaderData('user') as { collecting: CollectingDataEnterprise | null };
  const [localState, setLocalState] = useState({
    uses_company_products: collecting?.uses_company_products ?? false,
    uses_company_services: collecting?.uses_company_services ?? false,
    uses_company_departments: collecting?.uses_company_departments ?? false,
  });

  const toggle = useCallback((name: keyof typeof localState) => {
    setLocalState((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const isDirty = FEEDBACK_TYPES.some((type) => localState[type.name] !== (collecting?.[type.savedKey] ?? false));
  const enabledCount = FEEDBACK_TYPES.filter((type) => localState[type.name]).length;

  return (
    <Form method="post" className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-secondary) p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-(--text-primary)">{enabledCount} de 3 tipos selecionados</p>
          <p className="mt-1 text-xs text-(--text-tertiary)">{isDirty ? 'Suas alterações ainda não foram salvas.' : 'A seleção atual está salva.'}</p>
        </div>
        <button type="submit" disabled={!isDirty} className="btn-primary font-poppins inline-flex cursor-pointer items-center justify-center gap-2 px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50">
          <FaFloppyDisk aria-hidden /> {isDirty ? 'Salvar seleção' : 'Seleção salva'}
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {FEEDBACK_TYPES.map((type) => {
          const enabled = localState[type.name];
          const savedEnabled = collecting?.[type.savedKey] ?? false;
          const Icon = type.icon;

          return (
            <article key={type.name} className={`flex min-h-56 flex-col rounded-2xl border p-5 transition-colors ${enabled ? 'border-(--primary-color)/40 bg-(--primary-color)/6' : 'border-(--quaternary-color)/12 bg-(--bg-secondary)'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${enabled ? 'bg-(--primary-color)/15 text-(--primary-color)' : 'bg-(--bg-tertiary) text-(--text-tertiary)'}`}><Icon aria-hidden /></div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${enabled ? 'text-(--primary-color)' : 'text-(--text-tertiary)'}`}>{enabled ? 'Ativo' : 'Inativo'}</span>
                  <Switch
                    checked={enabled}
                    onCheckedChange={() => toggle(type.name)}
                    aria-label={`${enabled ? 'Desativar' : 'Ativar'} ${type.title}`}
                  />
                </div>
                <input type="checkbox" name={type.name} checked={enabled} readOnly className="sr-only" tabIndex={-1} />
              </div>

              <div className="mt-5"><div className="flex items-center gap-2"><h3 className="font-montserrat text-base font-semibold text-(--text-primary)">{type.title}</h3>{savedEnabled && <span className="inline-flex items-center gap-1 rounded-full bg-(--positive)/12 px-2 py-0.5 text-[11px] font-semibold text-(--positive)"><FaCheck aria-hidden /> Ativo</span>}</div><p className="mt-1 text-sm text-(--text-secondary)">{type.description}</p></div>

              <div className="mt-auto pt-5">{savedEnabled ? <Link to={type.configLink} className="inline-flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-(--primary-color)/25 bg-(--primary-color)/8 px-3.5 py-2.5 text-sm font-semibold text-(--primary-color) transition hover:bg-(--primary-color)/15">Configurar catálogo <FaArrowRight className="text-xs" aria-hidden /></Link> : <span className="text-xs text-(--text-tertiary)">{enabled ? 'Salve para liberar o catálogo.' : 'Tipo desativado'}</span>}</div>
            </article>
          );
        })}
      </div>

    </Form>
  );
}
