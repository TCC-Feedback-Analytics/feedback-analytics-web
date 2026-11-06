import { Link } from 'react-router-dom';
import { LuArrowRight, LuMapPin, LuPlay } from 'react-icons/lu';
import ProductNavigation from 'components/public/product/ProductNavigation';

export default function HeroSection() {
  return (
    <section className="fn-hero" aria-labelledby="fn-hero-title">
      <div className="fn-hero-inner fn-container relative">
        <ProductNavigation />
        <div className="fn-hero-copy">
          <p className="fn-hero-tag inline-flex items-center gap-[10px] rounded-[100px] bg-[#083238b3] tracking-[.04em]">
            <LuMapPin aria-hidden="true" /> ESCUTE NO PONTO EXATO DA EXPERIÊNCIA
          </p>
          <h1 id="fn-hero-title">A melhor decisão começa onde a experiência acontece.</h1>
          <p className="fn-hero-description leading-[1.55] text-[#b3c7c5]">
            Colete por QR Code, Link ou NFC no balcão, na mesa, na recepção ou em qualquer ponto de
            contato. A IA organiza. Você sabe onde agir.
          </p>
          <div className="fn-hero-actions flex">
            <Link
              className="fn-button fn-button-accent inline-flex items-center justify-center font-semibold whitespace-nowrap text-[#082a2d]"
              to="/register"
            >
              Começar teste grátis <LuArrowRight aria-hidden="true" />
            </Link>
            <a
              className="fn-button fn-button-outline inline-flex items-center justify-center font-semibold whitespace-nowrap text-[#f2faf9]"
              href="#coleta"
            >
              <LuPlay aria-hidden="true" /> Ver o fluxo
            </a>
          </div>
          <p className="fn-trial-note">
            4 meses de teste <span>•</span> sem instalar nada <span>•</span> configuração rápida
          </p>
        </div>
        <div
          className="fn-live-card bg-[#f3faf9] rounded-[16px]"
          aria-label="Exemplo de coleta em tempo real"
        >
          <div className="fn-live-head justify-between">
            <span>
              <img src="/field-notes/symbol.png" alt="" /> 3 canais ativos · Balcão
            </span>
            <strong>
              <span className="fn-live-dot" /> ATIVO
            </strong>
          </div>
          <p>18 respostas hoje</p>
          <small>A nota média permanece estável em 4,6.</small>
        </div>
      </div>
    </section>
  );
}
