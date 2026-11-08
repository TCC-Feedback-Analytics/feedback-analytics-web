import { Link } from 'react-router-dom';
import { LuArrowRight, LuLink2, LuRadio, LuScanQrCode, LuTicketCheck } from 'react-icons/lu';

const channels = [
  { label: 'QR', icon: LuScanQrCode },
  { label: 'LINK', icon: LuLink2 },
  { label: 'NFC', icon: LuRadio },
];

export default function FinalCtaSection() {
  return (
    <section className="fn-final fn-light-section min-h-[506px] overflow-hidden">
      <div className="fn-container fn-final-inner relative">
        <div className="fn-final-copy">
          <p className="fn-final-tag inline-flex items-center gap-[8px] bg-[#ddeeeb] rounded-[20px] tracking-[.05em]"><LuTicketCheck aria-hidden="true" /> SEU PRÓXIMO PONTO DE ESCUTA COMEÇA AQUI</p>
          <h2>Coloque a voz do cliente no centro da operação.</h2>
          <p>Ative QR Code, Link e NFC, receba respostas reais e transforme padrões em uma próxima ação clara.</p>
          <Link to="/register" className="fn-button fn-button-dark inline-flex items-center justify-center font-semibold whitespace-nowrap text-[#f2faf9]">Começar teste grátis <LuArrowRight aria-hidden="true" /></Link>
          <small>4 meses de teste · sem instalar nada · configuração rápida</small>
        </div>
        <div className="fn-ticket bg-[#fff] rounded-[4px] flex flex-col gap-[18px]" aria-hidden="true">
          <div className="fn-ticket-top flex items-center justify-between overflow-hidden">
            <img src="/field-notes/logo-light.png" alt="" />
            <span>#001</span>
          </div>
          <div className="fn-ticket-rule h-[1px] bg-[#d4e5e2]" />
          <h3>Seus canais de coleta</h3>
          <div className="fn-ticket-channels p-[10px]">
            {channels.map((channel) => (
              <div key={channel.label}>
                <channel.icon />
                <span>{channel.label}</span>
              </div>
            ))}
          </div>
          <p>QR Code · Link · NFC</p>
        </div>
      </div>
    </section>
  );
}
