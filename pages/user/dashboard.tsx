import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Link,
  useLoaderData,
  useRouteLoaderData,
  useSearchParams,
} from 'react-router-dom';
import CardSimple from 'components/user/shared/cards/cardSimple';
import {
  FaArrowRight,
} from 'react-icons/fa';
import SectionRatings from 'components/user/pages/dashboard/SectionRatings';
import ShareQrCard from 'components/user/pages/dashboard/ShareQrCard';
import SectionFormQuestions from 'components/user/pages/questions/SectionFormQuestions';
import DashboardScopedSkeleton from 'components/user/pages/dashboard/DashboardScopedSkeleton';
import InsightsReportContent from 'components/user/pages/feedbacksInsightsReport/InsightsReportContent';
import CommentToneSection from 'components/user/pages/comments/CommentToneSection';
import ScopeTag from 'components/user/shared/ScopeTag';
import DashboardWelcome from 'components/user/pages/dashboard/DashboardWelcome';
import WelcomePreview from 'components/user/pages/dashboard/WelcomePreview';
import { useToast } from 'components/public/forms/messages/useToast';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { useScopedInsightsReport } from 'src/lib/hooks/useScopedInsightsReport';
import { getCatalogKindByKind } from 'src/lib/constants/catalog';
import { scopeText } from 'src/lib/utils/scopeText';
import { activeFormQuestions } from 'src/lib/utils/formQuestions';
import {
  ServiceGetFeedbackStats,
  ServiceGetFeedbackQuestions,
} from 'src/services/serviceFeedbacks';
import type { FeedbackStats, QuestionMetric } from 'lib/interfaces/domain/feedback.domain';
import type { DashboardLoaderData, UserLoaderData } from './ui.types';


// A análise dos comentários pela IA só libera com este mínimo de feedbacks no escopo.
const MIN_FEEDBACKS_TO_ANALYZE = 10;

export default function Dashboard() {
  const userLoaderData = useRouteLoaderData<UserLoaderData>('user');
  const dashboardLoaderData = useLoaderData<DashboardLoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { scope, catalogItemId, catalogItemOptions } = useInsightsControls();

  const toastShownRef = useRef(false);

  useEffect(() => {
    if (searchParams.get('login') !== 'success') return;
    if (toastShownRef.current) return; // já exibiu, ignora

    toastShownRef.current = true;
    toast.success('Login realizado com sucesso.', 'Bem-vindo de volta.');

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('login');
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams, toast]);
  const user = userLoaderData?.user;
  const enterprise = userLoaderData?.enterprise;
  const [stats, setStats] = useState<FeedbackStats | null>(
    dashboardLoaderData?.stats ?? null,
  );
  const [questions, setQuestions] = useState<QuestionMetric[]>([]);
  const [scopedLoading, setScopedLoading] = useState(false);
  // O 1º fetch reaproveita o seed do loader (escopo Empresa) — só mostramos o
  // skeleton nas TROCAS de escopo seguintes, para não piscar no carregamento inicial.
  const firstScopedFetchRef = useRef(true);
  const error = dashboardLoaderData?.dashboardError ?? null;

  // Métricas seguem o escopo selecionado no header (Geral = só o QR da empresa).
  const fetchScopedData = useCallback(async () => {
    const showSkeleton = !firstScopedFetchRef.current;
    if (showSkeleton) setScopedLoading(true);

    const catalogParam =
      scope !== 'COMPANY' ? catalogItemId || undefined : undefined;

    const [statsData, questionsData] = await Promise.all([
      ServiceGetFeedbackStats({
        scope_type: scope,
        catalog_item_id: catalogParam,
      }).catch(() => null),
      ServiceGetFeedbackQuestions({
        scope_type: scope,
        catalog_item_id: catalogParam,
      }).catch(() => null),
    ]);

    setStats(statsData);
    setQuestions(questionsData?.questions ?? []);
    firstScopedFetchRef.current = false;
    setScopedLoading(false);
  }, [scope, catalogItemId]);

  useEffect(() => {
    fetchScopedData();
  }, [fetchScopedData]);

  // Análise dos comentários (tom + resumo e recomendações da IA), filtrada por escopo.
  const { report, summary, loading: reportLoading } = useScopedInsightsReport({ withAnalysis: true });
  const scopeInfo = scopeText({ scope, catalogItemId, catalogItemOptions });

  // O link de compartilhar segue o escopo selecionado no header: empresa → QR
  // geral; produto/serviço/departamento com item escolhido → QR do item; tipo
  // selecionado sem item → catálogo do tipo, para o gestor escolher o item.
  const shareFormPath = (() => {
    if (scope === 'COMPANY') return '/user/qrcode/enterprise';
    const config = getCatalogKindByKind(scope);
    if (!config) return '/user/qrcode/enterprise';
    if (!catalogItemId) return config.listPath;
    return `/user/edit/feedback/${config.slug}/${catalogItemId}`;
  })();

  const displayName =
    user?.user_metadata?.full_name || enterprise?.full_name || user?.email || 'Dashboard';

  const totalFeedbacks = stats?.totalFeedbacks ?? 0;
  const pendingCount = stats?.pendingCount ?? 0;
  // Conta inteira sem nenhum feedback: boas-vindas e prévia no lugar das seções vazias.
  const isAccountEmpty = dashboardLoaderData?.accountTotalFeedbacks === 0;
  const feedbacksUntilAnalysis = Math.max(0, MIN_FEEDBACKS_TO_ANALYZE - totalFeedbacks);

  return (
    <div className="font-work-sans space-y-6">
      <CardSimple type="header">
        <div className="flex-1 space-y-2">
          <p className="text-xs uppercase tracking-wide text-(--text-tertiary)">Visão geral</p>
          <h1 className="font-montserrat text-xl font-semibold text-(--text-primary) md:text-2xl">
            Olá, {displayName}
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-(--text-secondary)">
            {pendingCount > 0 && (
              <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-(--primary-color)" />
            )}
            {isAccountEmpty
              ? 'Vamos coletar os primeiros feedbacks.'
              : totalFeedbacks === 0
              ? 'Compartilhe o formulário pelo QR Code para começar a coletar feedbacks.'
              : pendingCount > 0
                ? `${pendingCount} ${pendingCount === 1 ? 'feedback aguardando' : 'feedbacks aguardando'} análise neste escopo.`
                : 'Tudo em dia — nenhum feedback aguardando análise neste escopo.'}
          </p>
          <Link
            to="/user/feedbacks/all"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-(--text-secondary) transition-colors hover:text-(--text-primary)">
            Ver feedbacks
            <FaArrowRight className="text-[0.6rem]" />
          </Link>
        </div>
        <div className="md:self-center">
          <ShareQrCard to={shareFormPath} />
        </div>
      </CardSimple>

      {error ? (
        <div className="rounded-xl border border-(--negative)/30 bg-(--negative)/10 px-4 py-3 text-sm text-(--text-primary)">
          {error}
        </div>
      ) : null}

      {isAccountEmpty ? (
        <>
          {enterprise && (
            <DashboardWelcome
              enterprise={enterprise}
              qrActive={dashboardLoaderData?.qrActive ?? null}
              totalFeedbacks={0}
            />
          )}
          <WelcomePreview questions={activeFormQuestions(userLoaderData?.collecting?.company_feedback_questions)} />
        </>
      ) : (
        <>
          {scopedLoading ? (
            <DashboardScopedSkeleton />
          ) : (
            <>
              <SectionRatings stats={stats} />

              <SectionFormQuestions metrics={questions} />
            </>
          )}

          {/* O que os clientes ESCREVERAM, lido pela IA (antigo bloco de insights). */}
          <section className="font-work-sans relative space-y-4" aria-labelledby="dashboard-comments-title">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="dashboard-comments-title" className="font-montserrat text-lg font-semibold text-(--text-primary)">
                Análise dos comentários <span className="text-sm font-medium text-(--primary-color)">✨ IA</span>
              </h2>
              <ScopeTag />
            </header>

            <CommentToneSection
              summary={summary}
              inScope={scopeInfo.inScope}
              ofScope={scopeInfo.ofScope}
              feedbacksUntilAnalysis={feedbacksUntilAnalysis}
            />

            <div className="relative overflow-hidden rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6 glass-card">
              <h3 className="font-montserrat text-base font-semibold text-(--text-primary)">Resumo e recomendações da IA</h3>
              <div className="mt-4">
                {reportLoading && !report ? (
                  <p className="text-sm text-(--text-tertiary)">Carregando o resumo…</p>
                ) : (
                  <InsightsReportContent report={report} />
                )}
              </div>
              {reportLoading && report && (
                <div className="pointer-events-none absolute inset-0 rounded-2xl border border-(--quaternary-color)/12 bg-(--bg-primary)/30 backdrop-blur-[1px]" />
              )}
            </div>

            <div className="flex justify-end">
              <Link
                to="/user/insights/overview"
                className="inline-flex items-center gap-1.5 text-sm text-(--text-secondary) transition-colors hover:text-(--text-primary)"
              >
                Ver a análise completa dos comentários
                <FaArrowRight className="text-xs" aria-hidden />
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
