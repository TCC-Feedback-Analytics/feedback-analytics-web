import ErrorPage from "components/user/shared/handling/errorPage";
import { Route, redirect } from "react-router-dom";
import { lazyPage } from "./lazyPage";

// Todas as telas da área logada (e o layout dela), com os loaders e actions de cada uma,
// são carregadas só quando acessadas. Quem abre a página inicial não baixa nada disto.
export function RouteUser() {
  return (
    <Route
      id="user"
      path="/user"
      errorElement={<ErrorPage />}
      lazy={lazyPage(
        () => import("layouts/user"),
        async () => {
          const [loader, action] = await Promise.all([
            import("./loaders/loaderUserProtected"),
            import("./actions/actionLogout"),
          ]);
          return { loader: loader.LoaderUserProtected, action: action.ActionLogout };
        },
      )}
    >
      <Route
        path="dashboard"
        lazy={lazyPage(
          () => import("pages/user/dashboard"),
          () => import("./loaders/loaderUserDashboard").then((m) => ({ loader: m.LoaderUserDashboard })),
        )}
      />
      <Route path="ratings" lazy={lazyPage(() => import("pages/user/ratings"))} />
      <Route path="customers" lazy={lazyPage(() => import("pages/user/customers"))} />
      <Route path="compare" lazy={lazyPage(() => import("pages/user/compare"))} />
      <Route path="diagnosis" lazy={lazyPage(() => import("pages/user/diagnosis"))} />
      <Route path="openrouter/callback" lazy={lazyPage(() => import("pages/user/openrouterCallback"))} />
      <Route
        path="profile"
        lazy={lazyPage(
          () => import("pages/user/profile"),
          () => import("./actions/actionProfile").then((m) => ({ action: m.ActionProfile })),
        )}
      />
      <Route
        path="qrcode/enterprise"
        loader={() => redirect("/user/edit/feedback-general")}
      />
      <Route
        path="feedbacks/all"
        lazy={lazyPage(
          () => import("pages/user/feedbacks/feedbacksAll"),
          () => import("./loaders/loaderFeedbacksAll").then((m) => ({ loader: m.LoaderFeedbacksAll })),
        )}
      />
      <Route path="feedbacks/:id" lazy={lazyPage(() => import("pages/user/feedbacks/feedbacks"))} />
      {/* "Análise dos comentários": Visão geral (com a action de análise da IA) e Comentários. */}
      <Route path="insights" loader={() => redirect("/user/insights/overview")} />
      <Route
        path="insights/overview"
        lazy={lazyPage(
          () => import("pages/user/feedbacks/insights/overview"),
          () =>
            import("./actions/actionFeedbackInsightsReport").then((m) => ({
              action: m.ActionFeedbackInsightsReport,
            })),
        )}
      />
      <Route
        path="insights/comments"
        lazy={lazyPage(
          () => import("pages/user/feedbacks/insights/comments"),
          () =>
            import("./loaders/loaderCommentsAnalysis").then((m) => ({
              loader: m.LoaderCommentsAnalysis,
            })),
        )}
      />
      {/* Páginas antigas, absorvidas pela nova estrutura: links salvos continuam funcionando. */}
      <Route path="insights/reports" loader={() => redirect("/user/insights/overview")} />
      <Route path="insights/emotional" loader={() => redirect("/user/insights/overview")} />
      <Route path="insights/statistics" loader={() => redirect("/user/insights/overview")} />
      <Route path="feedbacks/analytics/all" loader={() => redirect("/user/insights/comments")} />
      <Route path="feedbacks/analytics/positive" loader={() => redirect("/user/insights/comments?filtro=positivos")} />
      <Route path="feedbacks/analytics/negative" loader={() => redirect("/user/insights/comments?filtro=negativos")} />
      {/* As perguntas ficam no Dashboard ("Perguntas do formulário"), uma página por pergunta. */}
      <Route path="insights/questions" loader={() => redirect("/user/dashboard")} />
      <Route
        path="questions/removed"
        lazy={lazyPage(
          () => import("pages/user/questions/removed"),
          () => import("./loaders/loaderFormQuestions").then((m) => ({ loader: m.LoaderFormQuestions })),
        )}
      />
      <Route
        path="questions/:questionId"
        lazy={lazyPage(
          () => import("pages/user/questions/question"),
          () => import("./loaders/loaderFormQuestions").then((m) => ({ loader: m.LoaderFormQuestions })),
        )}
      />
      <Route path="edit/customers" lazy={lazyPage(() => import("pages/user/edit/editCustomers"))} />
      <Route
        path="edit/collecting-data-enterprise"
        lazy={lazyPage(
          () => import("pages/user/edit/editCompanyData"),
          () => import("./actions/actionCollectingData").then((m) => ({ action: m.ActionCollectingData })),
        )}
      />
      <Route
        path="edit/ia-settings"
        lazy={lazyPage(
          () => import("pages/user/edit/editIaSettings"),
          async () => {
            const [loader, action] = await Promise.all([
              import("./loaders/loaderIaSettings"),
              import("./actions/actionIaSettings"),
            ]);
            return { loader: loader.LoaderIaSettings, action: action.ActionIaSettings };
          },
        )}
      />

      <Route
        path="edit/types-feedback"
        lazy={lazyPage(
          () => import("pages/user/edit/editTypeFeedbacks"),
          () => import("./actions/actionTypesFeedback").then((m) => ({ action: m.ActionTypesFeedback })),
        )}
      />
      <Route
        path="edit/feedback-settings"
        loader={() => redirect("/user/edit/types-feedback")}
      />
      <Route
        path="edit/feedback-products"
        lazy={lazyPage(
          () => import("pages/user/edit/editFeedbackProducts"),
          async () => {
            const [loader, action] = await Promise.all([
              import("./loaders/loaderQrCodeProducts"),
              import("./actions/actionFeedbackCatalogPage"),
            ]);
            return { loader: loader.LoaderQrCodeProducts, action: action.ActionFeedbackCatalogPage };
          },
        )}
      />
      <Route
        path="edit/feedback-services"
        lazy={lazyPage(
          () => import("pages/user/edit/editFeedbackServices"),
          async () => {
            const [loader, action] = await Promise.all([
              import("./loaders/loaderQrCodeServices"),
              import("./actions/actionFeedbackCatalogPage"),
            ]);
            return { loader: loader.LoaderQrCodeServices, action: action.ActionFeedbackCatalogPage };
          },
        )}
      />
      <Route
        path="edit/feedback-departments"
        lazy={lazyPage(
          () => import("pages/user/edit/editFeedbackDepartments"),
          async () => {
            const [loader, action] = await Promise.all([
              import("./loaders/loaderQrCodeDepartments"),
              import("./actions/actionFeedbackCatalogPage"),
            ]);
            return { loader: loader.LoaderQrCodeDepartments, action: action.ActionFeedbackCatalogPage };
          },
        )}
      />
      <Route
        path="edit/feedback/:kind/:itemId"
        lazy={lazyPage(
          () => import("pages/user/edit/editCatalogItem"),
          async () => {
            const [loader, action] = await Promise.all([
              import("./loaders/loaderCatalogItem"),
              import("./actions/actionFeedbackCatalogPage"),
            ]);
            return { loader: loader.LoaderCatalogItem, action: action.ActionFeedbackCatalogPage };
          },
        )}
      />
      <Route
        path="edit/feedback-general"
        lazy={lazyPage(
          () => import("pages/user/edit/editFeedbackGeneral"),
          async () => {
            const [loader, action] = await Promise.all([
              import("./loaders/loaderFeedbackGeneral"),
              import("./actions/actionFeedbackGeneralPage"),
            ]);
            return { loader: loader.LoaderFeedbackGeneral, action: action.ActionFeedbackGeneralPage };
          },
        )}
      />
    </Route>
  );
}
