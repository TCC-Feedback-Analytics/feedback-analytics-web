import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useFetcher, useLoaderData, useLocation, useNavigation } from 'react-router-dom';
import Header from 'components/user/layout/Header';
import {
  InsightsControlsProvider,
  useInsightsControlsState,
} from 'src/lib/context/insightsControls';
import type { InsightsControlsInitialData } from 'src/lib/context/insightsControls.types';
import Sidebar from 'components/user/layout/Sidebar';
import MobileBottomNav from 'components/user/layout/MobileBottomNav';
import MobileMenuDrawer from 'components/user/layout/MobileMenuDrawer';
import { SidebarProvider } from 'components/ui/sidebar';
import SectionTabs from 'components/user/shared/SectionTabs';
import InsightsActionBar from 'components/user/layout/InsightsActionBar';
import DashboardSkeleton from 'components/user/pages/dashboard/DashboardSkeleton';
import ProfileSkeleton from 'components/user/pages/profile/ProfileSkeleton';
import QrCodeEnterpriseSkeleton from 'components/user/pages/qrcodes/QrCodeEnterpriseSkeleton';
import FeedbacksAllSkeleton from 'components/user/pages/feedbacks/FeedbacksAllSkeleton';
import FeedbackDetailsSkeleton from 'components/user/pages/feedbacks/FeedbackDetailsSkeleton';
import FeedbacksAnalyticsAllSkeleton from 'components/user/pages/feedbacks/analytics/FeedbacksAnalyticsAllSkeleton';
import FeedbacksAnalyticsPositiveSkeleton from 'components/user/pages/feedbacks/analytics/FeedbacksAnalyticsPositiveSkeleton';
import FeedbacksAnalyticsNegativeSkeleton from 'components/user/pages/feedbacks/analytics/FeedbacksAnalyticsNegativeSkeleton';
import InsightsReportSkeleton from 'components/user/pages/feedbacks/insights/InsightsReportSkeleton';
import InsightsEmotionalSkeleton from 'components/user/pages/feedbacks/insights/InsightsEmotionalSkeleton';
import InsightsStatisticsSkeleton from 'components/user/pages/feedbacks/insights/InsightsStatisticsSkeleton';
import InsightsQuestionsSkeleton from 'components/user/pages/feedbacks/insights/InsightsQuestionsSkeleton';
import EditCustomersSkeleton from 'components/user/pages/edit/EditCustomersSkeleton';
import EditProfileSkeleton from 'components/user/pages/edit/EditProfileSkeleton';
import EditCollectingDataSkeleton from 'components/user/pages/edit/EditCollectingDataSkeleton';
import EditFeedbackSettingsSkeleton from 'components/user/pages/edit/EditFeedbackSettingsSkeleton';
import type { CollectingDataEnterprise, EnterpriseContext } from 'lib/interfaces/entities/enterprise.entity';
import type { IaConfigResponse } from 'src/services/serviceIaConfig';
import type { InsightScopeOption, InsightsCatalogItemOption } from 'components/user/pages/feedbacksInsightsReport/ui.types';
import { INTENT_LOGOUT, INTENT_FEEDBACK_ANALYZE_RAW, INTENT_FEEDBACK_RUN_IA } from 'src/lib/constants/routes/intents';
import { useToast } from 'components/public/forms/messages/useToast';
import { OnboardingProvider, useOnboarding } from 'src/lib/context/onboardingContext';
import AIContextDialog from 'components/user/onboarding/AIContextDialog';
import UserInteractiveTour from 'components/user/onboarding/UserInteractiveTour';
import { useIaOperation } from 'src/lib/hooks/useIaOperation';

function UserOnboardingManager({
  onOpenMobileDrawer,
  onCloseMobileDrawer,
}: {
  onOpenMobileDrawer: () => void;
  onCloseMobileDrawer: () => void;
}) {
  const { hasCompletedAISetup } = useOnboarding();
  const [mandatoryOpen, setMandatoryOpen] = useState(!hasCompletedAISetup);

  useEffect(() => {
    setMandatoryOpen(!hasCompletedAISetup);
  }, [hasCompletedAISetup]);

  return (
    <>
      <AIContextDialog
        open={mandatoryOpen}
        onOpenChange={setMandatoryOpen}
        isMandatory={true}
      />
      <UserInteractiveTour
        onOpenMobileDrawer={onOpenMobileDrawer}
        onCloseMobileDrawer={onCloseMobileDrawer}
      />
    </>
  );
}

function buildInsightsInitialData(collecting: CollectingDataEnterprise | null): InsightsControlsInitialData {
  const availableScopes: InsightScopeOption[] = ['COMPANY'];
  const catalogItemOptions: InsightsCatalogItemOption[] = [];

  if (!collecting) {
    return { availableScopes, catalogItemOptions, canAnalyze: false };
  }

  const hasCompanyObjective = String(collecting.company_objective ?? '').trim().length > 0;
  const hasAnalyticsGoal = String(collecting.analytics_goal ?? '').trim().length > 0;
  const hasBusinessSummary = String(collecting.business_summary ?? '').trim().length > 0;
  const canAnalyze = hasCompanyObjective && hasAnalyticsGoal && hasBusinessSummary;

  const productItems = collecting.catalog_products ?? [];
  const serviceItems = collecting.catalog_services ?? [];
  const departmentItems = collecting.catalog_departments ?? [];

  if (collecting.uses_company_products && productItems.length > 0) {
    availableScopes.push('PRODUCT');
    catalogItemOptions.push(
      ...productItems.map((item) => ({ id: item.id, name: item.name, kind: 'PRODUCT' as const })),
    );
  }

  if (collecting.uses_company_services && serviceItems.length > 0) {
    availableScopes.push('SERVICE');
    catalogItemOptions.push(
      ...serviceItems.map((item) => ({ id: item.id, name: item.name, kind: 'SERVICE' as const })),
    );
  }

  if (collecting.uses_company_departments && departmentItems.length > 0) {
    availableScopes.push('DEPARTMENT');
    catalogItemOptions.push(
      ...departmentItems.map((item) => ({ id: item.id, name: item.name, kind: 'DEPARTMENT' as const })),
    );
  }

  return { availableScopes, catalogItemOptions, canAnalyze };
}

export default function User() {
  const logoutFetcher = useFetcher();
  const navigation = useNavigation();
  const toast = useToast();
  const { enterprise, collecting, iaConfig } = useLoaderData() as {
    enterprise: EnterpriseContext;
    collecting: CollectingDataEnterprise | null;
    iaConfig: IaConfigResponse | null;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const insightsInitial = useMemo(() => buildInsightsInitialData(collecting), []);
  const insightsState = useInsightsControlsState(insightsInitial);

  // Sincroniza o contexto quando collecting muda (ex: após salvar catálogo)
  useEffect(() => {
    const updated = buildInsightsInitialData(collecting);
    insightsState.setAvailableScopes(updated.availableScopes);
    insightsState.setCatalogItemOptions(updated.catalogItemOptions);
    insightsState.setCanAnalyze(updated.canAnalyze);

    if (!updated.availableScopes.includes(insightsState.scope)) {
      insightsState.setScope('COMPANY');
      insightsState.setCatalogItemId('');
    } else if (insightsState.scope !== 'COMPANY') {
      const itemStillValid = updated.catalogItemOptions.some(
        (item) =>
          item.id === insightsState.catalogItemId && item.kind === insightsState.scope,
      );
      if (!itemStillValid) {
        const firstOfKind = updated.catalogItemOptions.find(
          (item) => item.kind === insightsState.scope,
        );
        insightsState.setCatalogItemId(firstOfKind?.id ?? '');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collecting]);

  const rawOperation = useIaOperation({
    kind: 'analyze_raw',
    enterpriseId: enterprise.id,
    onSuccess: ({ analyzedCount = 0 }) => toast.success(
      analyzedCount > 0 ? 'Feedbacks analisados!' : 'Nenhum feedback novo',
      analyzedCount > 0 ? `${analyzedCount} feedback(s) processado(s) com sucesso.` : 'Os feedbacks deste escopo já estavam analisados.',
    ),
    onError: (message) => toast.error('Erro na análise', message),
  });
  const insightsOperation = useIaOperation({
    kind: 'regenerate_insights',
    enterpriseId: enterprise.id,
    onSuccess: () => toast.success('Insights atualizados!', 'Relatório atualizado com os novos insights da IA'),
    onError: (message) => toast.error('Erro na geração de insights', message),
  });
  const submitRaw = rawOperation.submit;
  const submitInsights = insightsOperation.submit;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isHoverActivator, setIsHoverActivator] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const location = useLocation();
  const isSigningOut = logoutFetcher.state !== 'idle';
  const isRouteLoading = navigation.state === 'loading';
  const pendingPathname = navigation.location?.pathname ?? '';
  const isNavigatingToNewPage = isRouteLoading && pendingPathname !== location.pathname;

  const analyzeRaw = useCallback(() => {
    if (!insightsState.canAnalyze) {
      toast.warning('Configuração necessária', 'Preencha as informações da empresa para liberar a análise.');
      return;
    }
    if (insightsState.scope !== 'COMPANY' && !insightsState.catalogItemId) {
      toast.warning('Item necessário', 'Selecione um item do catálogo para este escopo.');
      return;
    }
    const form = new FormData();
    form.set('intent', INTENT_FEEDBACK_ANALYZE_RAW);
    form.set('scope_type', insightsState.scope);
    if (insightsState.catalogItemId) {
      form.set('catalog_item_id', insightsState.catalogItemId);
    }
    toast.success('Enfileirando análise...', 'Você pode continuar navegando enquanto a IA processa.');
    submitRaw(form);
  }, [insightsState.canAnalyze, insightsState.scope, insightsState.catalogItemId, submitRaw, toast]);

  const regenerateInsights = useCallback((options?: { analyzePending?: boolean; force?: boolean }) => {
    if (!insightsState.canAnalyze) {
      toast.warning('Configuração necessária', 'Preencha as informações da empresa para liberar a análise.');
      return;
    }
    if (insightsState.scope !== 'COMPANY' && !insightsState.catalogItemId) {
      toast.warning('Item necessário', 'Selecione um item do catálogo para este escopo.');
      return;
    }
    const form = new FormData();
    form.set('intent', INTENT_FEEDBACK_RUN_IA);
    form.set('analyze_pending', String(options?.analyzePending === true));
    form.set('force', String(options?.force === true));
    form.set('scope_type', insightsState.scope);
    if (insightsState.catalogItemId) {
      form.set('catalog_item_id', insightsState.catalogItemId);
    }
    toast.success('Enfileirando relatório...', 'O processamento continuará em segundo plano.');
    submitInsights(form);
  }, [insightsState.canAnalyze, insightsState.scope, insightsState.catalogItemId, submitInsights, toast]);

  const pendingContent = (() => {
    if (!isNavigatingToNewPage) {
      return <Outlet />;
    }

    if (pendingPathname === '/user/dashboard') return <DashboardSkeleton />;
    if (pendingPathname === '/user/profile') return <ProfileSkeleton />;

    if (pendingPathname === '/user/qrcode/enterprise') return <QrCodeEnterpriseSkeleton />;

    if (pendingPathname === '/user/feedbacks/all') return <FeedbacksAllSkeleton />;
    if (pendingPathname.startsWith('/user/feedbacks/') && !pendingPathname.startsWith('/user/feedbacks/analytics/')) {
      return <FeedbackDetailsSkeleton />;
    }
    if (pendingPathname === '/user/feedbacks/analytics/all') return <FeedbacksAnalyticsAllSkeleton />;
    if (pendingPathname === '/user/feedbacks/analytics/positive') return <FeedbacksAnalyticsPositiveSkeleton />;
    if (pendingPathname === '/user/feedbacks/analytics/negative') return <FeedbacksAnalyticsNegativeSkeleton />;

    if (pendingPathname === '/user/insights/reports') return <InsightsReportSkeleton />;
    if (pendingPathname === '/user/insights/emotional') return <InsightsEmotionalSkeleton />;
    if (pendingPathname === '/user/insights/statistics') return <InsightsStatisticsSkeleton />;
    if (pendingPathname === '/user/insights/questions') return <InsightsQuestionsSkeleton />;

    if (pendingPathname === '/user/edit/customers') return <EditCustomersSkeleton />;
    if (pendingPathname === '/user/edit/profile') return <EditProfileSkeleton />;
    if (pendingPathname === '/user/edit/collecting-data-enterprise') return <EditCollectingDataSkeleton />;
    if (pendingPathname === '/user/edit/feedback-settings') return <EditFeedbackSettingsSkeleton />;

    return <Outlet />;
  })();

  function handleSignOut() {
    if (isSigningOut) return;

    logoutFetcher.submit(
      { intent: INTENT_LOGOUT },
      { method: 'post', action: '/user' },
    );
  }

  const cancelClose = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    if (isHoverActivator) return;
    closeTimerRef.current = window.setTimeout(() => {
      setIsSidebarOpen(false);
      closeTimerRef.current = null;
    }, 120);
  };

  const insightsRunning = insightsOperation.status === 'running';
  const isAnalyzingRaw = rawOperation.status === 'running' || (insightsRunning && insightsOperation.job?.phase === 'analyzing');
  const isRegeneratingInsights = insightsRunning && insightsOperation.job?.phase !== 'analyzing';
  const latestOperation = rawOperation.startedAt > insightsOperation.startedAt ? rawOperation : insightsOperation;

  return (
    <OnboardingProvider collecting={collecting} iaConfig={iaConfig}>
      <InsightsControlsProvider
        value={{
          ...insightsState,
          analyzeRaw,
          regenerateInsights,
          isAnalyzingRaw,
          isRegeneratingInsights,
          rawProgress: insightsRunning && insightsOperation.job?.phase === 'analyzing' ? insightsOperation.progress : rawOperation.progress,
          insightsProgress: insightsOperation.progress,
          rawStatus: rawOperation.status,
          insightsStatus: insightsOperation.status,
          rawError: rawOperation.error,
          insightsError: insightsOperation.error,
          activeJob: insightsRunning ? insightsOperation.job : rawOperation.status === 'running' ? rawOperation.job : null,
          pollingWarning: (insightsRunning && insightsOperation.connectionError) || (rawOperation.status === 'running' && rawOperation.connectionError),
          operationStatus: latestOperation.status,
          operationError: latestOperation.error,
          operationScope: latestOperation.job,
        }}
      >
        <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <div className="private-user-theme min-h-screen w-full max-w-full overflow-x-hidden bg-(--bg-primary) text-(--text-primary)">
            <header className="fixed top-0 left-0 right-0 z-50 h-16 w-full max-w-full border-b border-(--quaternary-color)/10 bg-linear-to-r from-(--bg-secondary) to-(--sixth-color) backdrop-blur-md">
              <Header
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
                enterprise={enterprise}
                onSignOut={handleSignOut}
                isSigningOut={isSigningOut}
              />
            </header>

            <div className="relative w-full max-w-full overflow-x-hidden bg-(--bg-primary) pt-16">
              {/* Ativador de borda desktop */}
              <div
                className="hidden md:block fixed left-0 top-16 z-30 h-[calc(100vh-64px)] w-2"
                onMouseEnter={() => {
                  cancelClose();
                  setIsSidebarOpen(true);
                  setIsHoverActivator(true);
                }}
                onMouseLeave={() => {
                  setIsHoverActivator(false);
                  scheduleClose();
                }}
              />

              <main className={`w-full max-w-full min-w-0 pb-24 md:pb-5 transition-all duration-300 ${
                isSidebarOpen ? 'md:pl-64' : 'md:pl-16'
              }`}>
                <div className="w-full max-w-full min-w-0 bg-(--bg-primary) p-4 md:p-5">
                  <InsightsActionBar />
                  <SectionTabs className="mb-5" />
                  {pendingContent}
                </div>
              </main>
            </div>

            {/* Desktop Sidebar (shadcn UI pattern) */}
            <Sidebar
              isOpen={isSidebarOpen}
              onOpen={() => {
                cancelClose();
                setIsSidebarOpen(true);
              }}
              onClose={() => {
                scheduleClose();
              }}
              pendingPathname={pendingPathname}
            />

            {/* Mobile Bottom Navigation (Apenas no Mobile) */}
            <MobileBottomNav
              onOpenDrawer={() => setIsMobileDrawerOpen(true)}
              pendingPathname={pendingPathname}
            />

            {/* Mobile Bottom Sheet Drawer */}
            <MobileMenuDrawer
              isOpen={isMobileDrawerOpen}
              onClose={() => setIsMobileDrawerOpen(false)}
              pendingPathname={pendingPathname}
              enterprise={enterprise}
              onSignOut={handleSignOut}
            />

            <UserOnboardingManager
              onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
              onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
            />
          </div>
        </SidebarProvider>
      </InsightsControlsProvider>
    </OnboardingProvider>
  );
}
