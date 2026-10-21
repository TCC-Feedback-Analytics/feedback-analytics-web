import type { DiagnosisFindingListProps, DiagnosisResultProps } from './ui.types';

function FindingList({ title, items, empty }: DiagnosisFindingListProps) {
  return (
    <div className="rounded-xl bg-(--seventh-color) p-4">
      <h3 className="text-sm font-semibold text-(--text-primary)">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-(--text-tertiary)">{empty}</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {items.map((item, index) => (
            <li key={index} className="text-sm text-(--text-secondary)">
              {item.text}
              <span className="mt-0.5 block text-xs text-(--text-tertiary)">{item.evidence}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * O resultado de um diagnóstico do escopo: resumo, o que fazer em ordem, o que
 * vai bem, o que preocupa, o que mudou e os limites dos dados. Usado no bloco do
 * Dashboard e no histórico.
 */
export default function DiagnosisResult({ diagnosis }: DiagnosisResultProps) {
  const { result } = diagnosis;
  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-(--text-primary)">{result.summary}</p>

      <div className="rounded-xl border border-(--primary-color)/20 bg-(--primary-color)/5 p-4">
        <h3 className="text-sm font-semibold text-(--text-primary)">O que fazer, em ordem</h3>
        <ol className="mt-3 space-y-3">
          {result.recommendations.map((item) => (
            <li key={item.priority} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--primary-color) text-xs font-bold text-(--bg-primary)">
                {item.priority}
              </span>
              <div className="min-w-0 text-sm">
                <span
                  className={`mr-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    item.kind === 'fix' ? 'bg-(--negative)/15 text-(--negative)' : 'bg-(--positive)/15 text-(--positive)'
                  }`}
                >
                  {item.kind === 'fix' ? 'Corrigir' : 'Manter'}
                </span>
                <span className="text-(--text-primary)">{item.action}</span>
                <span className="mt-0.5 block text-xs text-(--text-tertiary)">{item.evidence}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FindingList title="O que vai bem" items={result.going_well} empty="Nada se destacou para o bem." />
        <FindingList title="O que preocupa" items={result.concerns} empty="Nada preocupante nos números." />
        <FindingList
          title="O que mudou"
          items={result.changes}
          empty={diagnosis.previousPeriod ? 'Sem mudança que os números confirmem.' : 'Sem período anterior para comparar.'}
        />
      </div>

      {result.limitations.length > 0 && (
        <div className="text-xs text-(--text-tertiary)">
          <p className="font-medium text-(--text-secondary)">Limites dos dados</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {result.limitations.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
