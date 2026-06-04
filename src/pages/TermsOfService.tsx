import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="container" style={{ maxWidth: '800px', padding: '40px 24px', textAlign: 'left' }}>
      <header style={{ marginBottom: '32px' }}>
        <Link to="/" style={{ fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          ← Voltar para o Início
        </Link>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Termos de Serviço</h1>
        <p style={{ fontSize: '0.95rem' }}>Última atualização: Junho de 2026</p>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h2>1. Termos e Aceitação</h2>
          <p style={{ marginTop: '8px' }}>
            Ao criar uma conta ou utilizar os serviços do Precifica+, você concorda em cumprir e estar 
            sujeito a estes Termos de Serviço. Caso discorde de qualquer cláusula ou termo contido aqui, 
            você deve cessar o uso do aplicativo imediatamente.
          </p>
        </div>

        <div>
          <h2>2. Cadastro e Contas de Usuário</h2>
          <p style={{ marginTop: '8px' }}>
            Para usufruir dos recursos de precificação e da lista de compras automatizada, você deve se cadastrar 
            fornecendo um e-mail válido e gerando uma senha segura. É de sua inteira responsabilidade manter 
            sua senha em segredo e proteger o acesso à sua conta pessoal. Nós não nos responsabilizamos por perdas 
            decorrentes de acessos não autorizados por falha na proteção das credenciais por parte do usuário.
          </p>
        </div>

        <div>
          <h2>3. Modelo SaaS e Assinaturas</h2>
          <p style={{ marginTop: '8px' }}>
            O Precifica+ opera sob o modelo de assinatura com cobrança recorrente:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>Plano Degustação (Freemium):</strong> Oferece uso restrito (limitação no número de receitas e insumos ativos) para demonstração dos cálculos em cascata.</li>
            <li><strong>Plano Profissional (Mensal/Anual):</strong> Dá acesso ilimitado ao dashboard de alertas, insumos e receitas. Os preços são exibidos no momento da assinatura.</li>
            <li><strong>Faturamento:</strong> As cobranças são feitas de forma recorrente com base no plano escolhido. A coleta de dados fiscais (como CPF) ocorre somente na tela de checkout da assinatura.</li>
            <li><strong>Cancelamento:</strong> Você pode cancelar sua assinatura a qualquer momento. O cancelamento interrompe a renovação para o período de faturamento seguinte.</li>
          </ul>
        </div>

        <div>
          <h2>4. Limitação de Responsabilidade</h2>
          <p style={{ marginTop: '8px' }}>
            O Precifica+ fornece ferramentas e calculadoras matemáticas para apoiar profissionais de alimentação 
            na gestão financeira e na composição de seus preços de venda. Embora o sistema faça o recálculo preciso 
            com base nos insumos informados, a tomada de decisão comercial final sobre as margens, os lucros e a 
            saúde do negócio cabe unicamente ao usuário. Não nos responsabilizamos por eventuais prejuízos comerciais, 
            margens de lucro insuficientes ou flutuações inflacionárias do mercado.
          </p>
        </div>

        <div>
          <h2>5. Propriedade Intelectual</h2>
          <p style={{ marginTop: '8px' }}>
            Todo o código-fonte, layout visual, design system, logotipos e textos pertencem integralmente ao 
            Precifica+. Você recebe uma licença de uso limitada, pessoal, intransferível e revogável para utilizar 
            o aplicativo em seu negócio artesanal, sendo estritamente proibido realizar engenharia reversa, cópia ou 
            distribuição de partes do software sem autorização explícita por escrito.
          </p>
        </div>

        <div>
          <h2>6. Alterações nos Termos</h2>
          <p style={{ marginTop: '8px' }}>
            Reservamo-nos o direito de atualizar estes termos de uso para adequação legal ou novos recursos da plataforma. 
            Modificações relevantes serão notificadas a você diretamente pelo e-mail de cadastro ou por meio de aviso destacado 
            na tela principal do aplicativo.
          </p>
        </div>
      </section>
    </div>
  );
}
