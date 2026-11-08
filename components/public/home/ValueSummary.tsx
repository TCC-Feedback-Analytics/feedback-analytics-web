const valueSteps = [
  { number: '01', title: 'Experiência fresca', detail: 'QR Code · Link · NFC' },
  { number: '02', title: 'Leitura estruturada', detail: 'Nota + texto + escopo' },
  { number: '03', title: 'Decisão orientada', detail: 'Prioridade + recomendação' },
];

export default function ValueSummary() {
  return (
    <section className="fn-receipt bg-[#061d22]" aria-label="Jornada de valor">
      <div className="fn-container fn-receipt-inner min-h-[164px]">
        <div className="fn-receipt-lead">
          <p className="fn-eyebrow font-medium tracking-[.09em]">UMA RESPOSTA. TRÊS CAMADAS DE VALOR.</p>
          <h2>Capture o momento. Preserve o contexto.</h2>
        </div>
        {valueSteps.map((step) => (
          <div className="fn-receipt-step" key={step.number}>
            <span>{step.number}</span>
            <div>
              <strong>{step.title}</strong>
              <small>{step.detail}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
