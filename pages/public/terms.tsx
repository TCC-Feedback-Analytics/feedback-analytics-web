import { Link } from 'react-router-dom';
import LegalPage, { LegalSection } from 'components/public/legal/LegalPage';
import { LEGAL_CONTACT_EMAIL, PRIVACY_PATH } from 'src/lib/constants/legal';

export default function Terms() {
  return (
    <LegalPage
      title="Termos de Serviço"
      related={{ to: PRIVACY_PATH, label: 'Ler a Política de Privacidade' }}
      intro={
        <p>
          Estes termos valem para quem cria uma conta no Feedback Analytics. Ao criar a conta, você concorda
          com eles e com a <Link to={PRIVACY_PATH}>Política de Privacidade</Link>.
        </p>
      }>
      <LegalSection title="1. O serviço">
        <p>
          O Feedback Analytics ajuda negócios a coletar a opinião dos clientes por QR Code e a entender essas
          opiniões com métricas e análises feitas por inteligência artificial (IA).
        </p>
      </LegalSection>

      <LegalSection title="2. A conta">
        <ul>
          <li>Informe dados verdadeiros e mantenha-os atualizados.</li>
          <li>Guarde sua senha. Você responde pelo que for feito na sua conta.</li>
          <li>Se suspeitar de acesso indevido, troque a senha e nos avise.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Os feedbacks dos seus clientes">
        <p>Os feedbacks coletados pelo seu QR Code são do seu negócio. Ao usá-lo, você se compromete a:</p>
        <ul>
          <li>informar seus clientes de que a opinião será analisada, inclusive por IA;</li>
          <li>não pedir, nas perguntas do formulário, dados sensíveis nem dados que não precisa;</li>
          <li>usar os feedbacks de acordo com a LGPD e atender aos pedidos dos seus clientes sobre os dados deles.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. A inteligência artificial">
        <ul>
          <li>
            As análises são geradas automaticamente e podem conter erros ou imprecisões. Use-as como apoio: as
            decisões sobre o seu negócio são suas.
          </li>
          <li>
            A IA roda no OpenRouter, com a sua chave de API. Os termos e os eventuais custos do OpenRouter e do
            modelo escolhido são entre você e eles. Os modelos gratuitos não cobram, mas podem ficar lentos ou
            indisponíveis.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. O que não é permitido">
        <ul>
          <li>usar a plataforma para fins ilegais, enganosos ou para enviar spam;</li>
          <li>publicar ou coletar conteúdo ofensivo, discriminatório ou que viole direitos de terceiros;</li>
          <li>tentar acessar dados de outros negócios ou burlar os limites e as proteções do sistema.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Disponibilidade e mudanças">
        <p>
          Trabalhamos para manter o serviço no ar, mas ele pode ter interrupções, mudanças ou falhas. As
          funcionalidades podem mudar com o tempo.
        </p>
        <p>Se algum dia houver cobrança, ela será informada antes e só valerá com o seu aceite.</p>
      </LegalSection>

      <LegalSection title="7. Encerramento">
        <p>
          Você pode pedir a exclusão da conta a qualquer momento pelo e-mail{' '}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>. Podemos suspender ou encerrar contas
          que descumpram estes termos.
        </p>
      </LegalSection>

      <LegalSection title="8. Responsabilidade">
        <p>
          O serviço é oferecido como está. Na medida permitida pela lei, não respondemos por decisões tomadas com
          base nas análises nem por falhas de serviços de terceiros, como o OpenRouter e os provedores de IA.
        </p>
      </LegalSection>

      <LegalSection title="9. Mudanças nestes termos">
        <p>
          Quando estes termos mudarem, a data no topo muda. Se a mudança for relevante, avisaremos pela
          plataforma ou por e-mail e poderemos pedir um novo aceite.
        </p>
      </LegalSection>

      <LegalSection title="10. Lei aplicável">
        <p>Estes termos seguem as leis do Brasil.</p>
      </LegalSection>
    </LegalPage>
  );
}
