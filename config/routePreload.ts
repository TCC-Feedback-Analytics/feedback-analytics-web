import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';

/**
 * Pré-carregamento por rota.
 *
 * As telas são carregadas sob demanda (`lazy` do React Router, ver `src/routes/lazyPage.ts`).
 * Sem ajuda, quem abre `/user/dashboard` direto baixa o pacote principal e só depois descobre
 * que precisa do arquivo da tela: dois downloads em fila. Este plugin gera um script pequeno que
 * olha a URL aberta e pede ao navegador, logo de início, os arquivos daquela rota
 * (`<link rel="modulepreload">`). Eles baixam junto com o pacote principal.
 *
 * O script fica num arquivo próprio (`assets/route-preload-<hash>.js`), e não embutido no HTML,
 * para a Content-Security-Policy do `vercel.json` poder proibir scripts embutidos.
 *
 * As páginas públicas vêm no pacote principal, então só a área logada entra aqui.
 * Cada entrada liga o começo da URL aos módulos que a rota carrega (tela, loader e action).
 * Uma rota fora da lista continua funcionando: só não é pré-carregada.
 */
const ROTAS: Record<string, string[]> = {
  '/user': ['layouts/user', 'src/routes/loaders/loaderUserProtected', 'src/routes/actions/actionLogout'],
  '/user/dashboard': ['pages/user/dashboard', 'src/routes/loaders/loaderUserDashboard'],
};

type Chunk = {
  type: 'chunk';
  fileName: string;
  isEntry: boolean;
  isDynamicEntry: boolean;
  facadeModuleId: string | null;
  moduleIds: string[];
  imports: string[];
};

const semExtensao = (id: string) => id.replace(/\\/g, '/').replace(/\.[cm]?[jt]sx?$/, '');

export function routePreload(): Plugin {
  let arquivo: { nome: string; conteudo: string } | null = null;

  return {
    name: 'feedback-route-preload',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        const chunks = Object.values(ctx.bundle).filter((c) => c.type === 'chunk') as unknown as Chunk[];
        const porArquivo = new Map(chunks.map((c) => [c.fileName, c]));

        // Arquivos que o index.html já carrega (entrada e as dependências estáticas dela).
        const jaCarregados = new Set<string>();
        const marcar = (arquivo: string) => {
          if (jaCarregados.has(arquivo)) return;
          jaCarregados.add(arquivo);
          porArquivo.get(arquivo)?.imports.forEach(marcar);
        };
        chunks.filter((c) => c.isEntry).forEach((c) => marcar(c.fileName));

        const chunkDoModulo = (modulo: string) => {
          const alvo = `/${modulo}`;
          const contem = (c: Chunk) =>
            (c.facadeModuleId && semExtensao(c.facadeModuleId).endsWith(alvo)) ||
            c.moduleIds.some((id) => semExtensao(id).endsWith(alvo));
          return chunks.find((c) => c.isDynamicEntry && contem(c)) ?? chunks.find(contem);
        };

        const mapa: Record<string, string[]> = {};
        for (const [rota, modulos] of Object.entries(ROTAS)) {
          const arquivos = new Set<string>();
          const juntar = (arquivo: string) => {
            if (arquivos.has(arquivo) || jaCarregados.has(arquivo)) return;
            arquivos.add(arquivo);
            porArquivo.get(arquivo)?.imports.forEach(juntar);
          };
          for (const modulo of modulos) {
            const chunk = chunkDoModulo(modulo);
            if (!chunk) {
              console.warn(`route-preload: módulo ${modulo} (rota ${rota}) não encontrado no build`);
              continue;
            }
            juntar(chunk.fileName);
          }
          if (arquivos.size) mapa[rota] = [...arquivos];
        }

        const script =
          `(function(){var m=${JSON.stringify(mapa)},p=location.pathname,v={};` +
          `for(var r in m){if(p===r||p.indexOf(r+'/')===0){for(var i=0;i<m[r].length;i++){var f=m[r][i];` +
          `if(v[f])continue;v[f]=1;var l=document.createElement('link');l.rel='modulepreload';` +
          `l.crossOrigin='';l.href='/'+f;document.head.appendChild(l);}}}})();`;

        const nome = `assets/route-preload-${createHash('sha256').update(script).digest('hex').slice(0, 8)}.js`;
        arquivo = { nome, conteudo: script };
        return [{ tag: 'script', attrs: { src: `/${nome}` }, injectTo: 'head-prepend' }];
      },
    },
    writeBundle(options) {
      if (!arquivo || !options.dir) return;
      writeFileSync(join(options.dir, arquivo.nome), arquivo.conteudo);
    },
  };
}
