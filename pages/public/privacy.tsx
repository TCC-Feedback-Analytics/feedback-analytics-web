import LegalPage, { LegalSection } from 'components/public/legal/LegalPage';
import { LEGAL_CONTACT_EMAIL, TERMS_PATH } from 'src/lib/constants/legal';

export default function Privacy() {
  return (
    <LegalPage
      title="Política de Privacidade"
      related={{ to: TERMS_PATH, label: 'Ler os Termos de Serviço' }}
      intro={
        <p>
          Esta política explica quais dados o Feedback Analytics trata, para quê, com quem compartilha e
          como você exerce seus direitos, nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD).
        </p>
      }>
      <LegalSection title="1. Quem trata os dados">
        <p>
          O Feedback Analytics é o controlador dos dados da conta do negócio (quem se cadastra na plataforma).
        </p>
        <p>
          Os feedbacks que os clientes do negócio deixam pelo QR Code, pelo link ou pela etiqueta NFC pertencem
          ao negócio, que é o controlador
          desses dados. O Feedback Analytics os trata em nome do negócio, como operador, só para guardá-los e
          gerar as análises que o próprio negócio pede.
        </p>
      </LegalSection>

      <LegalSection title="2. Quais dados coletamos">
        <p>Da conta do negócio:</p>
        <ul>
          <li>nome do negócio, e-mail e telefone;</li>
          <li>senha, guardada só como hash, nunca em texto;</li>
          <li>ao entrar com o Google: nome, e-mail e foto do perfil que o Google informa;</li>
          <li>o contexto do negócio digitado na configuração (o que faz e quais são os objetivos);</li>
          <li>a chave de API do OpenRouter, guardada criptografada, e o modelo de IA escolhido;</li>
          <li>dados da sessão: endereço IP e navegador usados para entrar.</li>
        </ul>
        <p>Dos clientes que deixam feedback pelo QR Code, pelo link ou pela etiqueta NFC:</p>
        <ul>
          <li>a nota, o comentário (opcional) e as respostas às perguntas do formulário;</li>
          <li>nome, e-mail e gênero, só se a pessoa quiser informar;</li>
          <li>
            um identificador do aparelho, calculado a partir do IP e do navegador sem guardar os dois, para evitar
            envios repetidos e spam. Ele também serve para contar os clientes que voltam a avaliar.
          </li>
        </ul>
        <p>Não pedimos CPF, CNPJ nem dados sensíveis (como saúde, religião ou opinião política).</p>
      </LegalSection>

      <LegalSection title="3. Para que usamos">
        <ul>
          <li>criar e manter a conta, permitir o login e enviar os e-mails de confirmação e de recuperação de senha;</li>
          <li>receber os feedbacks e gerar as métricas e as análises por IA que o negócio vê no painel;</li>
          <li>proteger a plataforma contra abuso, spam e acesso indevido.</li>
        </ul>
        <p>Não vendemos dados e não os usamos para publicidade.</p>
      </LegalSection>

      <LegalSection title="4. Bases legais">
        <ul>
          <li>execução do contrato com o negócio (art. 7º, V, da LGPD), para oferecer o serviço;</li>
          <li>legítimo interesse (art. 7º, IX), para segurança e prevenção de spam;</li>
          <li>consentimento (art. 7º, I), para os dados opcionais que o cliente escolhe informar no feedback.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Com quem compartilhamos">
        <p>Só com os serviços necessários para a plataforma funcionar:</p>
        <ul>
          <li>Vercel, que hospeda o site e a API;</li>
          <li>Supabase, que hospeda o banco de dados;</li>
          <li>Brevo, que envia os e-mails da conta;</li>
          <li>Google, quando a pessoa escolhe entrar com o Google;</li>
          <li>
            OpenRouter e o provedor do modelo de IA escolhido pelo negócio, que recebem os comentários, as notas,
            as respostas, os nomes dos itens avaliados e o contexto do negócio para gerar as análises, usando a
            chave de API do próprio negócio. O nome, o e-mail, o gênero e o IP de quem respondeu não são enviados.
          </li>
        </ul>
        <p>
          Alguns desses serviços ficam fora do Brasil. A transferência internacional segue o art. 33 da LGPD.
          Também compartilhamos dados quando uma lei ou uma ordem de autoridade exigir.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookies e armazenamento no navegador">
        <p>
          Usamos cookies essenciais para manter a sessão de quem entra na conta e para concluir a troca de senha
          e o login com o Google.
        </p>
        <p>
          O navegador também guarda alguns ajustes do painel: o aviso de IA lenta, o convite do guia, a análise
          em andamento e os marcos de feedbacks já comemorados. Durante a configuração, a aba guarda por pouco
          tempo o rascunho do contexto do negócio e os dados da conexão com o OpenRouter, que somem ao fechar a aba.
        </p>
        <p>Não usamos cookies de publicidade nem de rastreamento.</p>
      </LegalSection>

      <LegalSection title="7. Por quanto tempo guardamos">
        <p>
          Os dados ficam guardados enquanto a conta do negócio existir. O pedido de exclusão é confirmado por um
          link enviado ao e-mail da conta. Depois disso, a conta fica parada por 15 dias, para que o negócio possa
          desistir, e então os dados da conta e os feedbacks dela são apagados, salvo o que a lei obrigar a manter.
        </p>
        <p>
          A sessão é apagada quando a pessoa sai da conta. O identificador do aparelho de quem envia feedback
          fica guardado enquanto a conta do negócio existir. O IP e o navegador de quem envia não são guardados.
        </p>
      </LegalSection>

      <LegalSection title="8. Seus direitos">
        <p>Pela LGPD (art. 18), você pode pedir:</p>
        <ul>
          <li>a confirmação de que tratamos seus dados e o acesso a eles;</li>
          <li>a correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>a anonimização, o bloqueio ou a exclusão de dados desnecessários;</li>
          <li>a portabilidade dos dados e a exclusão da conta;</li>
          <li>informações sobre com quem compartilhamos;</li>
          <li>a revogação do consentimento, quando for essa a base legal.</li>
        </ul>
        <p>
          Os pedidos são feitos pelo e-mail <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>. Se
          você deixou um feedback para um negócio, também pode falar com ele diretamente. Você ainda pode
          reclamar na Autoridade Nacional de Proteção de Dados (ANPD).
        </p>
      </LegalSection>

      <LegalSection title="9. Segurança">
        <p>
          Os dados trafegam com criptografia (HTTPS). A senha é guardada só em hash e a chave de API, criptografada.
          Cada negócio só acessa os próprios dados.
        </p>
        <p>
          Se houver um incidente que traga risco aos dados da sua conta, avisaremos você e a ANPD. Se o
          incidente atingir os feedbacks, avisaremos o negócio, que avisa os clientes dele e a ANPD.
        </p>
      </LegalSection>

      <LegalSection title="10. Mudanças nesta política">
        <p>
          Quando esta política mudar, a data no topo muda. Se a mudança for relevante, avisaremos pela
          plataforma ou por e-mail.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
