import { LuBuilding2, LuConciergeBell, LuLink2, LuNetwork, LuPackage, LuQrCode, LuRadio, LuScanQrCode } from 'react-icons/lu';
import { SectionIntro } from './shared';

const channels = [
  { title: 'QR Code', detail: 'Para materiais físicos e pontos de atendimento', icon: LuScanQrCode },
  { title: 'Link', detail: 'Para WhatsApp, redes sociais e mensagens', icon: LuLink2 },
  { title: 'NFC', detail: 'Aproxime o celular e abra a avaliação', icon: LuRadio },
];

const scopes = [
  { name: 'Empresa', description: 'Visão geral da experiência', icon: LuBuilding2 },
  { name: 'Produto', description: 'Qualidade e percepção', icon: LuPackage },
  { name: 'Serviço', description: 'Atendimento e entrega', icon: LuConciergeBell },
  { name: 'Departamento', description: 'Experiência por área', icon: LuNetwork },
];

export default function CollectionSection() {
  return (
    <section id="resultados" className="fn-scopes fn-light-section">
      <div className="fn-container">
        <SectionIntro
          eyebrow="TRÊS CANAIS. UMA ÚNICA LEITURA."
          title="Colete por QR Code, Link ou NFC — no mesmo painel."
          description="Ative os canais em cada escopo e acompanhe todas as respostas em uma leitura unificada."
        />
        <div className="fn-channels items-center">
          {channels.map((channel) => (
            <article className="fn-channel rounded-[14px]" key={channel.title}>
              <div className="fn-channel-icon grid"><channel.icon aria-hidden="true" /></div>
              <div>
                <h3>{channel.title}</h3>
                <p>{channel.detail}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="fn-scopes-grid grid">
          {scopes.map((scope) => (
            <article className="fn-scope" key={scope.name}>
              <div className="fn-scope-icon grid rounded-[12px]"><scope.icon aria-hidden="true" /></div>
              <div className="fn-scope-copy">
                <h3>{scope.name}</h3>
                <p>{scope.description}</p>
              </div>
              <div className="fn-scope-divider h-[1px]" />
              <small>QR · LINK · NFC</small>
              <div className="fn-scope-qr grid rounded-[12px]"><LuQrCode aria-hidden="true" /></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
