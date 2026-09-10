import { useNavigation, useRouteLoaderData } from "react-router-dom";
import type {
  EnterpriseContext,
} from "lib/interfaces/entities/enterprise.entity";
import type { AuthUser } from "lib/interfaces/entities/auth-user.entity";
import PageHeader from "components/user/shared/PageHeader";
import Information from "components/user/pages/profile/editUser/information";
import AIContextProfileCard from "components/user/pages/profile/AIContextProfileCard";
import CompanyProfileSection from "components/user/pages/profile/CompanyProfileSection";
import FormCollectingDataEnterprise from "components/user/pages/profile/editCollectingData/formCollectingDataEnterprise";
import CardSimple from "components/user/shared/cards/cardSimple";
import { FaUser } from "react-icons/fa6";

export default function Profile() {
  const { enterprise, user } = useRouteLoaderData("user") as {
    enterprise: EnterpriseContext;
    user: AuthUser["user"];
  };
  const navigation = useNavigation();

  const fullName = user.user_metadata?.full_name || enterprise.full_name || "";
  const email = user.email || "";
  const phone = user.phone || "";
  const isSavingProfile =
    navigation.state === "submitting" &&
    navigation.formAction?.includes("/user/edit/profile");

  return (
    <div className="font-work-sans space-y-8 pb-8">
      <PageHeader />
      <div className="relative space-y-8">
        <section id="dados-pessoais" aria-labelledby="dados-pessoais-titulo" className="scroll-mt-6 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--primary-color)/12 text-(--primary-color)" aria-hidden><FaUser /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--primary-color)">Sua conta</p>
                <h2 id="dados-pessoais-titulo" className="mt-1 font-montserrat text-xl font-bold text-(--text-primary)">Dados pessoais e acesso</h2>
                <p className="mt-1 text-sm leading-relaxed text-(--text-secondary)">Edite cada informação individualmente. As alterações são salvas sem interromper o restante do perfil.</p>
              </div>
            </div>
            <a href="#dados-da-empresa" className="text-sm font-semibold text-(--primary-color) transition hover:text-(--secondary-color)">Ver dados da empresa</a>
          </div>

          <CardSimple>
            <div className="w-full">
              <Information
                defaultFullName={fullName}
                defaultEmail={email}
                defaultPhone={phone}
              />
            </div>
          </CardSimple>
        </section>

        <CompanyProfileSection enterprise={enterprise}>
          <FormCollectingDataEnterprise />
        </CompanyProfileSection>

        <section aria-labelledby="contexto-ia-titulo" className="scroll-mt-6">
          <h2 id="contexto-ia-titulo" className="sr-only">Contexto da empresa para IA</h2>
          <AIContextProfileCard />
        </section>

        {isSavingProfile && (
          <div className="pointer-events-none absolute inset-0 rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-primary)/35 backdrop-blur-[1px]" />
        )}
      </div>
    </div>
  );
}
