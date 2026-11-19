import ErrorPage from "components/user/shared/handling/errorPage";
import { Route, redirect } from "react-router-dom";
import { LoaderUserProtected } from "src/routes/loaders/loaderUserProtected";
import { LoaderUserDashboard } from "src/routes/loaders/loaderUserDashboard";
import { LoaderFeedbacksAll } from "src/routes/loaders/loaderFeedbacksAll";
import { LoaderCommentsAnalysis } from "src/routes/loaders/loaderCommentsAnalysis";
import { LoaderFormQuestions } from "./loaders/loaderFormQuestions";
import { ActionCollectingData } from "./actions/actionCollectingData";
import { ActionTypesFeedback } from "./actions/actionTypesFeedback";
import { ActionFeedbackInsightsReport } from "./actions/actionFeedbackInsightsReport";
import { ActionProfile } from "./actions/actionProfile";
import { ActionLogout } from "./actions/actionLogout";
import { ActionFeedbackCatalogPage } from "./actions/actionFeedbackCatalogPage";
import { ActionFeedbackGeneralPage } from "./actions/actionFeedbackGeneralPage";
import { LoaderQrCodeProducts } from "./loaders/loaderQrCodeProducts";
import { LoaderQrCodeServices } from "./loaders/loaderQrCodeServices";
import { LoaderQrCodeDepartments } from "./loaders/loaderQrCodeDepartments";
import { LoaderFeedbackGeneral } from "./loaders/loaderFeedbackGeneral";
import { LoaderCatalogItem } from "./loaders/loaderCatalogItem";
import { ActionIaSettings } from "./actions/actionIaSettings";
import { LoaderIaSettings } from "./loaders/loaderIaSettings";


export function RouteUser() {
  return (
    <Route
      id="user"
      path="/user"
      errorElement={<ErrorPage />}
      lazy={async () => ({ Component: (await import("layouts/user")).default })}
      loader={LoaderUserProtected}
      action={ActionLogout}
    >
      <Route
        path="dashboard"
        loader={LoaderUserDashboard}
        lazy={async () => ({ Component: (await import("pages/user/dashboard")).default })}
      />
      <Route path="ratings" lazy={async () => ({ Component: (await import("pages/user/ratings")).default })} />
      <Route path="customers" lazy={async () => ({ Component: (await import("pages/user/customers")).default })} />
      <Route path="compare" lazy={async () => ({ Component: (await import("pages/user/compare")).default })} />
      <Route path="diagnosis" lazy={async () => ({ Component: (await import("pages/user/diagnosis")).default })} />
      <Route path="openrouter/callback" lazy={async () => ({ Component: (await import("pages/user/openrouterCallback")).default })} />
      <Route
        path="profile"
        lazy={async () => ({ Component: (await import("pages/user/profile")).default })}
        action={ActionProfile}
      />
      <Route
        path="qrcode/enterprise"
        loader={() => redirect("/user/edit/feedback-general")}
      />
      <Route
        path="feedbacks/all"
        loader={LoaderFeedbacksAll}
        lazy={async () => ({ Component: (await import("pages/user/feedbacks/feedbacksAll")).default })}
      />
      <Route path="feedbacks/:id" lazy={async () => ({ Component: (await import("pages/user/feedbacks/feedbacks")).default })} />
      {/* "Análise dos comentários": Visão geral (com a action de análise da IA) e Comentários. */}
      <Route path="insights" loader={() => redirect("/user/insights/overview")} />
      <Route
        path="insights/overview"
        action={ActionFeedbackInsightsReport}
        lazy={async () => ({ Component: (await import("pages/user/feedbacks/insights/overview")).default })}
      />
      <Route
        path="insights/comments"
        loader={LoaderCommentsAnalysis}
        lazy={async () => ({ Component: (await import("pages/user/feedbacks/insights/comments")).default })}
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
      <Route path="questions/removed" loader={LoaderFormQuestions} lazy={async () => ({ Component: (await import("pages/user/questions/removed")).default })} />
      <Route path="questions/:questionId" loader={LoaderFormQuestions} lazy={async () => ({ Component: (await import("pages/user/questions/question")).default })} />
      <Route path="edit/customers" lazy={async () => ({ Component: (await import("pages/user/edit/editCustomers")).default })} />
      <Route
        path="edit/collecting-data-enterprise"
        lazy={async () => ({ Component: (await import("pages/user/edit/editCompanyData")).default })}
        action={ActionCollectingData}
      />
      <Route
        path="edit/ia-settings"
        loader={LoaderIaSettings}
        lazy={async () => ({ Component: (await import("pages/user/edit/editIaSettings")).default })}
        action={ActionIaSettings}
      />

      <Route
        path="edit/types-feedback"
        lazy={async () => ({ Component: (await import("pages/user/edit/editTypeFeedbacks")).default })}
        action={ActionTypesFeedback}
      />
      <Route
        path="edit/feedback-settings"
        loader={() => redirect("/user/edit/types-feedback")}
      />
      <Route
        path="edit/feedback-products"
        loader={LoaderQrCodeProducts}
        lazy={async () => ({ Component: (await import("pages/user/edit/editFeedbackProducts")).default })}
        action={ActionFeedbackCatalogPage}
      />
      <Route
        path="edit/feedback-services"
        loader={LoaderQrCodeServices}
        lazy={async () => ({ Component: (await import("pages/user/edit/editFeedbackServices")).default })}
        action={ActionFeedbackCatalogPage}
      />
      <Route
        path="edit/feedback-departments"
        loader={LoaderQrCodeDepartments}
        lazy={async () => ({ Component: (await import("pages/user/edit/editFeedbackDepartments")).default })}
        action={ActionFeedbackCatalogPage}
      />
      <Route
        path="edit/feedback/:kind/:itemId"
        loader={LoaderCatalogItem}
        lazy={async () => ({ Component: (await import("pages/user/edit/editCatalogItem")).default })}
        action={ActionFeedbackCatalogPage}
      />
      <Route
        path="edit/feedback-general"
        loader={LoaderFeedbackGeneral}
        lazy={async () => ({ Component: (await import("pages/user/edit/editFeedbackGeneral")).default })}
        action={ActionFeedbackGeneralPage}
      />
    </Route>
  );
}
