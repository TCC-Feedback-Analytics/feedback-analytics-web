import ErrorPage from "components/user/shared/handling/errorPage";
import Dashboard from "pages/user/dashboard";
import Ratings from "pages/user/ratings";
import CompareItems from "pages/user/compare";
import DiagnosisHistory from "pages/user/diagnosis";
import OpenRouterCallback from "pages/user/openrouterCallback";
import EditCustomer from "pages/user/edit/editCustomers";
import FeedbacksAll from "pages/user/feedbacks/feedbacksAll";
import Feedbacks from "pages/user/feedbacks/feedbacks";
import CommentsOverview from "pages/user/feedbacks/insights/overview";
import CommentsPage from "pages/user/feedbacks/insights/comments";
import LayoutUser from "layouts/user";
import { Route, redirect } from "react-router-dom";
import { LoaderUserProtected } from "src/routes/loaders/loaderUserProtected";
import { LoaderUserDashboard } from "src/routes/loaders/loaderUserDashboard";
import { LoaderFeedbacksAll } from "src/routes/loaders/loaderFeedbacksAll";
import { LoaderCommentsAnalysis } from "src/routes/loaders/loaderCommentsAnalysis";
import { LoaderFormQuestions } from "./loaders/loaderFormQuestions";
import Profile from "pages/user/profile";
import QuestionPage from "pages/user/questions/question";
import RemovedQuestionsPage from "pages/user/questions/removed";
import { ActionCollectingData } from "./actions/actionCollectingData";
import { ActionTypesFeedback } from "./actions/actionTypesFeedback";
import { ActionFeedbackInsightsReport } from "./actions/actionFeedbackInsightsReport";
import EditTypeFeedbacks from "pages/user/edit/editTypeFeedbacks";
import EditFeedbackProducts from "pages/user/edit/editFeedbackProducts";
import EditFeedbackServices from "pages/user/edit/editFeedbackServices";
import EditFeedbackDepartments from "pages/user/edit/editFeedbackDepartments";
import EditCompanyData from "pages/user/edit/editCompanyData";
import EditFeedbackGeneral from "pages/user/edit/editFeedbackGeneral";
import EditCatalogItem from "pages/user/edit/editCatalogItem";
import { ActionProfile } from "./actions/actionProfile";
import { ActionLogout } from "./actions/actionLogout";
import { ActionFeedbackCatalogPage } from "./actions/actionFeedbackCatalogPage";
import { ActionFeedbackGeneralPage } from "./actions/actionFeedbackGeneralPage";
import { LoaderQrCodeProducts } from "./loaders/loaderQrCodeProducts";
import { LoaderQrCodeServices } from "./loaders/loaderQrCodeServices";
import { LoaderQrCodeDepartments } from "./loaders/loaderQrCodeDepartments";
import { LoaderFeedbackGeneral } from "./loaders/loaderFeedbackGeneral";
import { LoaderCatalogItem } from "./loaders/loaderCatalogItem";
import EditIaSettings from "pages/user/edit/editIaSettings";
import { ActionIaSettings } from "./actions/actionIaSettings";
import { LoaderIaSettings } from "./loaders/loaderIaSettings";


export function RouteUser() {
  return (
    <Route
      id="user"
      path="/user"
      errorElement={<ErrorPage />}
      element={<LayoutUser />}
      loader={LoaderUserProtected}
      action={ActionLogout}
    >
      <Route
        path="dashboard"
        loader={LoaderUserDashboard}
        element={<Dashboard />}
      />
      <Route path="ratings" element={<Ratings />} />
      <Route path="compare" element={<CompareItems />} />
      <Route path="diagnosis" element={<DiagnosisHistory />} />
      <Route path="openrouter/callback" element={<OpenRouterCallback />} />
      <Route
        path="profile"
        element={<Profile />}
        action={ActionProfile}
      />
      <Route
        path="qrcode/enterprise"
        loader={() => redirect("/user/edit/feedback-general")}
      />
      <Route
        path="feedbacks/all"
        loader={LoaderFeedbacksAll}
        element={<FeedbacksAll />}
      />
      <Route path="feedbacks/:id" element={<Feedbacks />} />
      {/* "Análise dos comentários": Visão geral (com a action de análise da IA) e Comentários. */}
      <Route path="insights" loader={() => redirect("/user/insights/overview")} />
      <Route
        path="insights/overview"
        action={ActionFeedbackInsightsReport}
        element={<CommentsOverview />}
      />
      <Route
        path="insights/comments"
        loader={LoaderCommentsAnalysis}
        element={<CommentsPage />}
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
      <Route path="questions/removed" loader={LoaderFormQuestions} element={<RemovedQuestionsPage />} />
      <Route path="questions/:questionId" loader={LoaderFormQuestions} element={<QuestionPage />} />
      <Route path="edit/customers" element={<EditCustomer />} />
      <Route
        path="edit/collecting-data-enterprise"
        element={<EditCompanyData />}
        action={ActionCollectingData}
      />
      <Route
        path="edit/ia-settings"
        loader={LoaderIaSettings}
        element={<EditIaSettings />}
        action={ActionIaSettings}
      />

      <Route
        path="edit/types-feedback"
        element={<EditTypeFeedbacks />}
        action={ActionTypesFeedback}
      />
      <Route
        path="edit/feedback-settings"
        loader={() => redirect("/user/edit/types-feedback")}
      />
      <Route
        path="edit/feedback-products"
        loader={LoaderQrCodeProducts}
        element={<EditFeedbackProducts />}
        action={ActionFeedbackCatalogPage}
      />
      <Route
        path="edit/feedback-services"
        loader={LoaderQrCodeServices}
        element={<EditFeedbackServices />}
        action={ActionFeedbackCatalogPage}
      />
      <Route
        path="edit/feedback-departments"
        loader={LoaderQrCodeDepartments}
        element={<EditFeedbackDepartments />}
        action={ActionFeedbackCatalogPage}
      />
      <Route
        path="edit/feedback/:kind/:itemId"
        loader={LoaderCatalogItem}
        element={<EditCatalogItem />}
        action={ActionFeedbackCatalogPage}
      />
      <Route
        path="edit/feedback-general"
        loader={LoaderFeedbackGeneral}
        element={<EditFeedbackGeneral />}
        action={ActionFeedbackGeneralPage}
      />
    </Route>
  );
}
