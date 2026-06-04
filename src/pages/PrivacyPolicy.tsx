import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="container" style={{ maxWidth: '800px', padding: '40px 24px', textAlign: 'left' }}>
      <header style={{ marginBottom: '32px' }}>
        <Link to="/" style={{ fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          ← Voltar para o Início
        </Link>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Política de Privacidade</h1>
        <p style={{ fontSize: '0.95rem' }}>Última atualização: Junho de 2026</p>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h2>1. Introdução</h2>
          <p style={{ marginTop: '8px' }}>
            Nós do Precifica+ valorizamos a sua privacidade e segurança. Esta Política de Privacidade descreve 
            como coletamos, armazenamos e tratamos os seus dados pessoais em conformidade com a Lei Geral de Proteção 
            de Dados (LGPD - Lei nº 13.709/2018). Ao utilizar nossa plataforma, você concorda com as práticas 
            descritas neste documento.
          </p>
        </div>

        <div>
          <h2>2. Dados Coletados</h2>
          <p style={{ marginTop: '8px' }}>
            Para fornecer as funcionalidades do aplicativo de precificação, coletamos apenas os dados estritamente necessários:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>Dados de Acesso:</strong> Nome e endereço de e-mail para autenticação de conta e contato essencial.</li>
            <li><strong>Dados de Negócio:</strong> Insumos, embalagens, receitas, salário desejado e custos fixos declarados para o funcionamento das calculadoras de precificação.</li>
            <li><strong>Dados de Pagamento:</strong> Caso assine um plano pago, as transações financeiras e dados adicionais de faturamento (como CPF) são processados diretamente e de forma segura pelo gateway de pagamento Stripe. Nós não armazenamos dados de cartões de crédito em nossos servidores.</li>
          </ul>
        </div>

        <div>
          <h2>3. Finalidade do Tratamento</h2>
          <p style={{ marginTop: '8px' }}>
            Os dados coletados são utilizados exclusivamente para:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Garantir o funcionamento e o cálculo correto das suas receitas e produtos.</li>
            <li>Salvar suas configurações personalizadas de custos fixos e horas de trabalho.</li>
            <li>Gerenciar o controle de acesso e assinaturas de planos.</li>
            <li>Enviar comunicações críticas de suporte ou atualizações importantes de sistema.</li>
          </ul>
        </div>

        <div>
          <h2>4. Armazenamento e Transferência de Dados</h2>
          <p style={{ marginTop: '8px' }}>
            Os dados de autenticação e negócio são armazenados de forma criptografada em servidores hospedados pelo 
            provedor Supabase nos Estados Unidos. A transferência internacional ocorre de forma segura e em total conformidade 
            com os requisitos da LGPD, adotando salvaguardas contratuais robustas para a proteção de suas informações.
          </p>
        </div>

        <div>
          <h2>5. Seus Direitos (LGPD)</h2>
          <p style={{ marginTop: '8px' }}>
            Como titular dos dados, você pode exercer os seguintes direitos diretamente pelo aplicativo a qualquer momento:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>Acesso e Portabilidade:</strong> Baixar todos os seus dados cadastrados (insumos, receitas e informações de perfil) em formato estruturado (JSON).</li>
            <li><strong>Retificação:</strong> Editar suas informações cadastrais a qualquer momento.</li>
            <li><strong>Eliminação (Direito ao Esquecimento):</strong> Solicitar a exclusão definitiva de sua conta, o que removerá de forma irreversível todos os seus dados e receitas em cascata de nossa base ativa.</li>
          </ul>
        </div>

        <div>
          <h2>6. Cookies e Tecnologias de Rastreamento</h2>
          <p style={{ marginTop: '8px' }}>
            Utilizamos cookies estritamente necessários para manter a sua sessão de usuário ativa e lembrar suas preferências. 
            Não compartilhamos seus dados com redes de publicidade parceiras.
          </p>
        </div>

        <div>
          <h2>7. Contato</h2>
          <p style={{ marginTop: '8px' }}>
            Para dúvidas ou solicitações referentes à privacidade de dados, você pode entrar em contato com o nosso 
            Encarregado de Proteção de Dados (DPO) através do e-mail: <strong>privacidade@precificamais.com.br</strong>.
          </p>
        </div>
      </section>
    </div>
  );
}
