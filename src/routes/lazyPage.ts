import type { ComponentType } from 'react';
import type { ActionFunction, LoaderFunction } from 'react-router-dom';

type PageModule = { default: ComponentType };
type RouteData = { loader?: LoaderFunction; action?: ActionFunction };

/**
 * Carrega a tela só quando a rota é acessada (propriedade `lazy` do React Router).
 * Assim quem abre a página inicial não baixa o código do painel nem as validações dos
 * formulários, e cada tela vira um arquivo separado no build.
 *
 * `data` traz o loader e a action da rota, quando ela tem. Os dois arquivos são baixados
 * juntos, e o React Router só chama o loader ou a action depois que eles chegam.
 */
export function lazyPage(load: () => Promise<PageModule>, data?: () => Promise<RouteData>) {
  return async () => {
    const [page, extra] = await Promise.all([load(), data ? data() : Promise.resolve({})]);
    return { Component: page.default, ...extra };
  };
}
