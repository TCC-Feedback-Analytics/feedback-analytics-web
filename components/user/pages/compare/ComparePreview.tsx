import { Link } from 'react-router-dom';
import { FaArrowRight, FaScaleBalanced } from 'react-icons/fa6';

const STEPS = [
  {
    title: 'Cadastre os itens no Catálogo',
    description: 'Pelo menos 2 do mesmo tipo: dois produtos, dois serviços ou dois departamentos.',
  },
  {
    title: 'Ative o QR Code de cada item',
    description: 'Cada item tem o seu formulário. Compartilhe com os clientes para as avaliações chegarem.',
  },
  {
    title: 'Volte aqui e escolha os dois',
    description: 'Escolha também o período. Os dois itens usam sempre o mesmo, para a comparação ser justa.',
  },
];

// Dados de exemplo da prévia: apagados e com selo, para não parecerem reais.
const EXAMPLE_ROWS = [
  { metric: 'Nº de avaliações', a: '128', b: '96', verdict: '—' },
  { metric: 'Média', a: '4,5 /5 · Ótima', b: '3,9 /5 · Boa', verdict: 'Pizza (nota 0,6 maior)' },
  { metric: 'Positivas (4–5★)', a: '82%', b: '61%', verdict: 'Pizza (21 pontos a mais)' },
  { metric: 'Críticas (1–2★)', a: '4%', b: '12%', verdict: 'Pizza (8 pontos a menos)' },
  { metric: 'Tom dos comentários', a: '+52 · Positivo', b: '+44 · Positivo', verdict: 'Diferença incerta' },
];

/**
 * Início da página "Comparar itens" enquanto a conta não tem 2 itens do mesmo
 * tipo (mesmo desenho das boas-vindas do Dashboard): o que fazer para habilitar
 * e uma prévia, com dados de exemplo, do que a página vai mostrar.
 */
export default function ComparePreview() {
  return (
    <div className="font-work-sans space-y-6" data-tour="tour-compare-items">
      <section
        aria-labelledby="compare-preview-title"
        className="relative overflow-hidden rounded-2xl border border-(--primary-color)/20 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-6"
      >
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-(--primary-color)/15 text-(--primary-color)">
            <FaScaleBalanced className="h-5 w-5" aria-hidden />
          </span>
          <div className="space-y-1">
            <h2 id="compare-preview-title" className="font-montserrat text-lg font-semibold text-(--text-primary)">
              Compare dois itens lado a lado
            </h2>
            <p className="max-w-2xl text-sm text-(--text-secondary)">
              Veja qual produto, serviço ou departamento está melhor na média, nas positivas, nas críticas e no tom
              dos comentários. Para isso, cadastre pelo menos 2 itens do mesmo tipo no Catálogo.
            </p>
          </div>
        </div>

        <ol className="mt-5 grid gap-3 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3 rounded-xl border border-(--quaternary-color)/10 bg-(--bg-primary)/45 p-4">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-(--primary-color)/15 text-xs font-bold text-(--primary-color)">
                {index + 1}
              </span>
              <div className="min-w-0 space-y-1">
                <h3 className="text-sm font-semibold text-(--text-primary)">{step.title}</h3>
                <p className="text-xs text-(--text-secondary)">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5">
          <Link to="/user/edit/types-feedback" className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold">
            Abrir o Catálogo
            <FaArrowRight className="text-xs" aria-hidden />
          </Link>
        </div>
      </section>

      <section aria-labelledby="compare-example-title" className="space-y-3">
        <header className="flex items-center justify-between gap-3">
          <h2 id="compare-example-title" className="font-montserrat text-lg font-semibold text-(--text-primary)">
            Como vai ficar
          </h2>
          <span className="shrink-0 rounded-full border border-(--quaternary-color)/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-(--text-tertiary)">
            Exemplo
          </span>
        </header>

        <div className="welcome-ghost overflow-x-auto rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color)" aria-hidden>
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-(--quaternary-color)/10 text-xs text-(--text-tertiary)">
                <th className="px-5 py-3 font-medium">Métrica</th>
                <th className="px-5 py-3 font-medium text-(--text-primary)">A · Pizza</th>
                <th className="px-5 py-3 font-medium text-(--text-primary)">B · Hambúrguer</th>
                <th className="px-5 py-3 font-medium">Quem está melhor</th>
              </tr>
            </thead>
            <tbody>
              {EXAMPLE_ROWS.map((row) => (
                <tr key={row.metric} className="border-b border-(--quaternary-color)/8 last:border-0">
                  <th className="px-5 py-3 font-medium text-(--text-secondary)">{row.metric}</th>
                  <td className="px-5 py-3 text-(--text-primary)">{row.a}</td>
                  <td className="px-5 py-3 text-(--text-primary)">{row.b}</td>
                  <td
                    className={`px-5 py-3 ${
                      row.verdict.startsWith('Pizza') ? 'font-semibold text-(--positive)' : 'text-(--text-tertiary)'
                    }`}
                  >
                    {row.verdict}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-(--text-secondary)">
          &quot;Diferença incerta&quot; aparece quando ainda há poucas avaliações para dizer quem está melhor.
        </p>
      </section>
    </div>
  );
}
