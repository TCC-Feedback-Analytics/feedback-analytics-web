import Public from 'layouts/public';
import Home from 'pages/public/home';
import { Route } from 'react-router-dom';
import ErrorPage from 'components/globals/handling/errorPage';
import { lazyPage } from './lazyPage';

// A página inicial vem no pacote principal, porque é a porta de entrada do site.
// As demais telas públicas, com os loaders e actions delas, são carregadas só quando acessadas.
export function RoutePublic() {
  return (
    <Route path="/" element={<Public />} errorElement={<ErrorPage />}>
      <Route path="/" element={<Home />} />
      <Route path="produto/coleta" lazy={lazyPage(() => import('pages/public/coleta'))} />
      <Route path="produto/analise" lazy={lazyPage(() => import('pages/public/analise'))} />
      <Route path="produto/resultados" lazy={lazyPage(() => import('pages/public/resultados'))} />
      <Route
        path="login"
        lazy={lazyPage(
          () => import('pages/public/login'),
          () => import('./actions/actionLogin').then((m) => ({ action: m.ActionLogin })),
        )}
      />
      <Route
        path="register"
        lazy={lazyPage(
          () => import('pages/public/register'),
          () => import('./actions/actionRegister').then((m) => ({ action: m.ActionRegister })),
        )}
      />
      <Route
        path="forgot-password"
        lazy={lazyPage(
          () => import('pages/public/forgotPassword'),
          () =>
            import('./actions/actionForgotPassword').then((m) => ({
              action: m.ActionForgotPassword,
            })),
        )}
      />
      <Route
        path="resend-confirmation"
        lazy={lazyPage(
          () => import('pages/public/resendConfirmation'),
          () =>
            import('./actions/actionResendConfirmation').then((m) => ({
              action: m.ActionResendConfirmation,
            })),
        )}
      />
      <Route
        path="auth/reset-password"
        lazy={lazyPage(
          () => import('pages/public/resetPassword'),
          () =>
            import('./actions/actionResetPassword').then((m) => ({
              action: m.ActionResetPassword,
            })),
        )}
      />
      <Route
        path="feedback/qrcode"
        lazy={lazyPage(
          () => import('pages/public/qrcode/enterprise'),
          async () => {
            const [loader, action] = await Promise.all([
              import('./loaders/loaderPublicQrCodeEnterprise'),
              import('./actions/actionPublicQrCodeFeedback'),
            ]);
            return {
              loader: loader.LoaderPublicQrCodeEnterprise,
              action: action.ActionPublicQrCodeFeedback,
            };
          },
        )}
      />
      <Route path="auth/success" lazy={lazyPage(() => import('pages/public/authSuccess'))} />
      <Route path="auth/link-expired" lazy={lazyPage(() => import('pages/public/authLinkExpired'))} />
      <Route path="privacidade" lazy={lazyPage(() => import('pages/public/privacy'))} />
      <Route path="termos" lazy={lazyPage(() => import('pages/public/terms'))} />
      <Route
        path="auth/complete-signup"
        lazy={lazyPage(
          () => import('pages/public/completeSignup'),
          () =>
            import('./loaders/loaderCompleteSignup').then((m) => ({
              loader: m.LoaderCompleteSignup,
            })),
        )}
      />
    </Route>
  );
}
