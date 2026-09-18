import { FaBuilding, FaCalendarDays, FaFileLines, FaLayerGroup } from 'react-icons/fa6';
import type { ReactNode } from 'react';
import CardSimple from 'components/user/shared/cards/cardSimple';
import { formatDocument } from 'src/lib/utils/formatDocument';
import type { CompanyProfileSectionProps } from './ui.types';

const SUBSCRIPTION_LABELS = {
  ACTIVE: 'Conta ativa',
  TRIAL: 'Período de teste',
  EXPIRED: 'Teste encerrado',
  CANCELED: 'Conta cancelada',
} as const;

function getCreationDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Não informado'
    : date.toLocaleDateString('pt-BR');
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-(--quaternary-color)/10 bg-(--seventh-color)/60 p-3.5">
      <span className="mt-0.5 text-(--primary-color)" aria-hidden>{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-(--text-tertiary)">{label}</p>
        <p className="mt-0.5 break-words text-sm font-semibold text-(--text-primary)">{value}</p>
      </div>
    </div>
  );
}

export default function CompanyProfileSection({
  enterprise,
  children,
}: CompanyProfileSectionProps) {
  const document = formatDocument(enterprise.document ?? '', enterprise.account_type) || 'Não informado';
  const accountType = enterprise.account_type || 'Não informado';
  const subscription = SUBSCRIPTION_LABELS[enterprise.subscription_status] || 'Não informado';

  return (
    <section
      id="dados-da-empresa"
      aria-labelledby="dados-da-empresa-titulo"
      className="scroll-mt-6 space-y-5"
    >
      <div
        data-tour="profile-company-heading"
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--primary-color)/12 text-(--primary-color)" aria-hidden>
            <FaBuilding />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--primary-color)">Empresa</p>
            <h2 id="dados-da-empresa-titulo" className="mt-1 font-montserrat text-xl font-bold text-(--text-primary)">Dados e configurações da empresa</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-(--text-secondary)">Mantenha o cadastro, o escopo de coleta e o contexto que orienta suas análises no mesmo lugar.</p>
          </div>
        </div>
        <a href="#dados-pessoais" className="text-sm font-semibold text-(--primary-color) transition hover:text-(--secondary-color)">Ver dados pessoais</a>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <CardSimple>
          <div className="w-full">
            <div className="mb-5 flex items-center gap-2">
              <FaFileLines className="text-(--primary-color)" aria-hidden />
              <h3 className="font-montserrat text-base font-bold text-(--text-primary)">Cadastro da empresa</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <Detail icon={<FaFileLines />} label="Documento" value={document} />
              <Detail icon={<FaLayerGroup />} label="Tipo de cadastro" value={accountType} />
              <Detail icon={<FaCalendarDays />} label="Conta criada em" value={getCreationDate(enterprise.created_at)} />
              <Detail icon={<FaBuilding />} label="Status da conta" value={subscription} />
            </div>
          </div>
        </CardSimple>

        <CardSimple>
          <div className="w-full">
            <div className="mb-5 flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--primary-color)/12 text-(--primary-color)" aria-hidden>
                <FaLayerGroup />
              </span>
              <div>
                <h3 className="font-montserrat text-base font-bold text-(--text-primary)">Escopos da operação</h3>
                <p className="mt-1 text-sm leading-relaxed text-(--text-secondary)">Defina quais frentes da empresa podem receber feedback.</p>
              </div>
            </div>
            {children}
          </div>
        </CardSimple>
      </div>
    </section>
  );
}
