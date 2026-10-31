import { FaLink, FaNfcSymbol, FaQrcode } from 'react-icons/fa6';
import MetricHelp from 'components/user/shared/MetricHelp';
import PrecisionBadge from 'components/user/shared/PrecisionBadge';
import ScopeTag from 'components/user/shared/ScopeTag';
import { useInsightsControls } from 'src/lib/context/insightsControls';
import { formatRating } from 'src/lib/utils/ratingLabel';
import { scopeText } from 'src/lib/utils/scopeText';
import { countLabel } from 'src/lib/utils/plural';
import type { SectionChannelsProps } from './ui.types';

const CHANNEL_INFO = {
  QR: { label: 'QR Code', Icon: FaQrcode },
  LINK: { label: 'Link compartilhado', Icon: FaLink },
  NFC: { label: 'Etiqueta NFC', Icon: FaNfcSymbol },
} as const;

/**
 * "Por onde chegaram" (etapa 06): quantas avaliações e a média de estrelas por
 * canal de coleta, no escopo e no período. Com um canal só, vira uma linha; as
 * avaliações sem a marca de canal (anteriores a ela, QR Codes antigos) ficam à
 * parte, numa linha discreta, porque não são um canal.
 */
export default function SectionChannels({ stats }: SectionChannelsProps) {
  const { scope, catalogItemId, catalogItemOptions, period } = useInsightsControls();
  const scopeInfo = scopeText({ scope, catalogItemId, catalogItemOptions, period });
  const breakdown = stats?.channelBreakdown ?? [];
  const channels = breakdown.flatMap((item) => (item.channel ? [{ ...item, channel: item.channel }] : []));
  const unmarked = breakdown.find((item) => item.channel === null) ?? null;
  const markedTotal = channels.reduce((sum, item) => sum + item.count, 0);

  if (breakdown.length === 0) return null;

  return (
    <section className="font-work-sans space-y-4" aria-labelledby="channels-section-title">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="channels-section-title" className="flex items-center gap-1.5 font-montserrat text-lg font-semibold text-(--text-primary)">
          Por onde chegaram <MetricHelp term="collectionChannels" />
        </h2>
        <ScopeTag />
      </header>

      <div className="space-y-3 rounded-2xl border border-(--quaternary-color)/10 bg-linear-to-br from-(--bg-secondary) to-(--sixth-color) p-5">
        {channels.length === 1 ? (
          <p className="text-sm text-(--text-secondary)">
            Todas as avaliações marcadas {scopeInfo.inScope} vieram pelo{' '}
            <strong className="text-(--text-primary)">{CHANNEL_INFO[channels[0].channel].label}</strong> (
            {countLabel(channels[0].count, 'avaliações')}).
          </p>
        ) : channels.length > 1 ? (
          <ul className="space-y-3">
            {channels.map(({ channel, count, mean, ci }) => {
              const { label, Icon } = CHANNEL_INFO[channel];
              const share = markedTotal > 0 ? Math.round((count / markedTotal) * 100) : 0;
              return (
                <li key={channel} className="space-y-1.5" data-channel={channel}>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="inline-flex items-center gap-2 font-medium text-(--text-primary)">
                      <Icon aria-hidden className="text-(--primary-color)" /> {label}
                    </span>
                    <span className="flex flex-wrap items-center gap-2 text-(--text-secondary)">
                      {countLabel(count, 'avaliações')} · {share}%
                      {mean !== null && (
                        <>
                          {' · média '}
                          <strong className="text-(--text-primary)">{formatRating(mean)}</strong>
                          <PrecisionBadge
                            metricName={`Média pelo ${label}`}
                            n={count}
                            unit="avaliações"
                            interval={ci}
                            kind="mean"
                            ofScope={scopeInfo.ofScope}
                          />
                        </>
                      )}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-(--seventh-color)" aria-hidden>
                    <div className="h-full rounded-full bg-(--primary-color)" style={{ width: `${share}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}

        {unmarked && (
          <p className="text-xs text-(--text-tertiary)">
            {countLabel(unmarked.count, 'avaliações')} sem a marca de canal: são de antes da marcação ou de QR Codes impressos
            antes dela. Baixe o QR Code de novo para as próximas entrarem aqui.
          </p>
        )}
      </div>
    </section>
  );
}
