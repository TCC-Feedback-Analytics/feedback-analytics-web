import Public from 'layouts/public';
import Home from 'pages/public/home';
import { Route } from 'react-router-dom';
import { ActionLogin } from './actions/actionLogin';
import { ActionRegister } from './actions/actionRegister';
import { LoaderCompleteSignup } from './loaders/loaderCompleteSignup';
import ErrorPage from 'components/globals/handling/errorPage';
import { LoaderPublicQrCodeEnterprise } from './loaders/loaderPublicQrCodeEnterprise';
import { ActionPublicQrCodeFeedback } from './actions/actionPublicQrCodeFeedback';
import { ActionForgotPassword } from './actions/actionForgotPassword';
import { ActionResetPassword } from './actions/actionResetPassword';
import { ActionResendConfirmation } from './actions/actionResendConfirmation';

export function RoutePublic() {
  return (
    <Route path="/" element={<Public />} errorElement={<ErrorPage />}>
      <Route path="/" element={<Home />} />
      <Route path="produto/coleta" lazy={async () => ({ Component: (await import("pages/public/coleta")).default })} />
      <Route path="produto/analise" lazy={async () => ({ Component: (await import("pages/public/analise")).default })} />
      <Route path="produto/resultados" lazy={async () => ({ Component: (await import("pages/public/resultados")).default })} />
      <Route path="login" lazy={async () => ({ Component: (await import("pages/public/login")).default })} action={ActionLogin} />
      <Route path="register" lazy={async () => ({ Component: (await import("pages/public/register")).default })} action={ActionRegister} />
      <Route path="forgot-password" lazy={async () => ({ Component: (await import("pages/public/forgotPassword")).default })} action={ActionForgotPassword} />
      <Route
        path="resend-confirmation"
        lazy={async () => ({ Component: (await import("pages/public/resendConfirmation")).default })}
        action={ActionResendConfirmation}
      />
      <Route path="auth/reset-password" lazy={async () => ({ Component: (await import("pages/public/resetPassword")).default })} action={ActionResetPassword} />
      <Route
        path="feedback/qrcode"
        loader={LoaderPublicQrCodeEnterprise}
        action={ActionPublicQrCodeFeedback}
        lazy={async () => ({ Component: (await import("pages/public/qrcode/enterprise")).default })}
      />
      <Route path="auth/success" lazy={async () => ({ Component: (await import("pages/public/authSuccess")).default })} />
      <Route path="auth/link-expired" lazy={async () => ({ Component: (await import("pages/public/authLinkExpired")).default })} />
      <Route path="privacidade" lazy={async () => ({ Component: (await import("pages/public/privacy")).default })} />
      <Route path="termos" lazy={async () => ({ Component: (await import("pages/public/terms")).default })} />
      <Route
        path="auth/complete-signup"
        loader={LoaderCompleteSignup}
        lazy={async () => ({ Component: (await import("pages/public/completeSignup")).default })}
      />
    </Route>
  );
}
