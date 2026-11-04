import { useEffect } from 'react';
import { FaArrowRotateRight, FaHouse, FaTriangleExclamation } from 'react-icons/fa6';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import AuthShell from 'components/public/shared/AuthShell';
import type { ErrorPageProps } from './ui.types';

export default function ErrorPage({ homePath = '/' }: ErrorPageProps) {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  useEffect(() => {
    if (!notFound) console.error('[ErrorPage]', error);
  }, [error, notFound]);

  return (
    <AuthShell
      icon={<FaTriangleExclamation className="h-4 w-4" aria-hidden />}
      title={notFound ? 'Página não encontrada' : 'Algo deu errado'}
      description={
        notFound
          ? 'O endereço não existe ou mudou de lugar.'
          : 'Não conseguimos concluir esta ação. Tente de novo; se continuar, volte ao início.'
      }
      eyebrow={notFound ? 'ERRO 404' : 'ERRO'}
    >
      <div className="flex flex-col gap-3">
        {!notFound && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-(--primary-color) text-sm font-bold text-(--on-primary) transition-all hover:brightness-105 active:scale-[0.99]"
          >
            <FaArrowRotateRight className="h-3.5 w-3.5" aria-hidden /> Tentar de novo
          </button>
        )}
        <Link
          to={homePath}
          className="inline-flex min-h-11 items-center justify-center gap-2 text-center text-sm font-semibold text-(--primary-color) hover:opacity-80"
        >
          <FaHouse className="h-3.5 w-3.5" aria-hidden /> Voltar ao início
        </Link>
      </div>
    </AuthShell>
  );
}
