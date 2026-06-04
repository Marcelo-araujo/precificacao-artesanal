import { Link } from 'react-router-dom';
import { 
  TrendingUp, Sparkles, CheckCircle2, ShoppingCart, 
  Layers, Clock, ArrowRight, Star, Award 
} from 'lucide-react';

export default function LandingPage() {
  const stripePaymentLink = 'https://buy.stripe.com/eVq00cbY28KW6IofCn8og00';

  return (
    <div style={{ fontFamily: "'Outfit', 'Inter', sans-serif", color: 'var(--text)', backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* MENU HEADER */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        background: 'rgba(255, 255, 255, 0.8)', 
        backdropFilter: 'blur(12px)', 
        borderBottom: '1px solid var(--border)', 
        zIndex: 100, 
        padding: '16px 24px' 
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <Sparkles size={20} />
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>
              Precifica<span style={{ color: 'var(--primary)' }}>+</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a href="#beneficios" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none' }}>Recursos</a>
            <a href="#depoimentos" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none' }}>Depoimentos</a>
            <a href="#precos" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none' }}>Preços</a>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
              Entrar na Cozinha
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{ 
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(236, 72, 153, 0.03) 100%)', 
        padding: '80px 24px', 
        textAlign: 'center', 
        borderBottom: '1px solid var(--border)' 
      }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '6px 16px', 
            borderRadius: '20px', 
            backgroundColor: 'var(--primary-light)', 
            color: 'var(--primary)', 
            fontSize: '0.85rem', 
            fontWeight: 600, 
            marginBottom: '24px' 
          }}>
            <Award size={16} /> O Assistente do Empreendedor de Alimentação Artesanal
          </div>

          <h1 style={{ 
            fontSize: '3.2rem', 
            fontWeight: 800, 
            lineHeight: 1.15, 
            marginBottom: '20px', 
            letterSpacing: '-0.02em' 
          }}>
            Valorize seu trabalho e proteja seu lucro com o{' '}
            <span style={{ 
              background: 'linear-gradient(90deg, var(--primary) 0%, #ec4899 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              fontWeight: 800
            }}>
              Precifica+
            </span>
          </h1>

          <p style={{ 
            fontSize: '1.2rem', 
            color: 'var(--text-muted)', 
            lineHeight: 1.5, 
            marginBottom: '36px',
            maxWidth: '680px',
            margin: '0 auto 36px'
          }}>
            Fichas técnicas em tempo real, custos fixos e variáveis detalhados e um simulador de metas mensais inteligente. Importe suas planilhas e veja seu lucro subir de forma simples e descomplicada.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <a href="#precos" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)' }}>
              Quero Garantir Meu Acesso <ArrowRight size={18} />
            </a>
            <Link to="/cadastro?payment=success" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem', fontWeight: 600 }}>
              Testar Versão de Avaliação
            </Link>
          </div>
        </div>
      </section>

      {/* SEÇÃO RECURSOS */}
      <section id="beneficios" style={{ padding: '80px 24px', backgroundColor: 'var(--bg-card)' }}>
        <div className="container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>Tudo o que sua confeitaria artesanal precisa</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>Esqueça cadernos velhos e planilhas confusas. Gerencie sua precificação em um só lugar.</p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
            gap: '24px' 
          }}>
            {/* CARD 1 */}
            <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', width: 'fit-content' }}>
                <Layers size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Segregação de Insumos</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Separe claramente ingredientes de embalagens nas fichas técnicas, aplicando fatores de perda específicos de produção apenas na massa.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', width: 'fit-content' }}>
                <ShoppingCart size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Importador Inteligente</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Suba seus insumos e componentes do Excel ou CSV em lote e mapeie as colunas de forma simples. Evita o atrito do lançamento manual unitário.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', width: 'fit-content' }}>
                <TrendingUp size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Simulador de Ganhos</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Calcule a margem de contribuição e o ponto de equilíbrio de cada receita para planejar vendas e atingir suas metas financeiras mensais.
              </p>
            </div>

            {/* CARD 4 */}
            <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '12px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', width: 'fit-content' }}>
                <Clock size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Histórico de Variação</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Grave o preço de suas últimas compras e veja a porcentagem exata de variação. O sistema avisa como os reajustes impactam o custo total da receita.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO PROVA SOCIAL */}
      <section id="depoimentos" style={{ padding: '80px 24px', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>Aprovado por profissionais do setor</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Veja como o Precifica+ ajuda a melhorar as finanças no dia a dia da cozinha.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px' }}>
            {/* DEPOIMENTO 1 */}
            <div className="card" style={{ padding: '28px', border: '1px solid var(--border)', background: 'var(--bg)' }}>
              <div style={{ display: 'flex', gap: '4px', color: '#fbbf24', marginBottom: '12px' }}>
                <Star size={16} fill="#fbbf24" /><Star size={16} fill="#fbbf24" /><Star size={16} fill="#fbbf24" /><Star size={16} fill="#fbbf24" /><Star size={16} fill="#fbbf24" />
              </div>
              <p style={{ fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.5, color: 'var(--text-muted)', marginBottom: '16px' }}>
                "Sempre tive dificuldade para precificar meus bombons artesanais. O cálculo de rendimento por peso e a margem de contribuição me ajudaram a ver exatamente onde eu estava perdendo lucro."
              </p>
              <strong style={{ fontSize: '0.95rem', display: 'block' }}>Renata Mendes</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ateliê Doce Cacau</span>
            </div>

            {/* DEPOIMENTO 2 */}
            <div className="card" style={{ padding: '28px', border: '1px solid var(--border)', background: 'var(--bg)' }}>
              <div style={{ display: 'flex', gap: '4px', color: '#fbbf24', marginBottom: '12px' }}>
                <Star size={16} fill="#fbbf24" /><Star size={16} fill="#fbbf24" /><Star size={16} fill="#fbbf24" /><Star size={16} fill="#fbbf24" /><Star size={16} fill="#fbbf24" />
              </div>
              <p style={{ fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.5, color: 'var(--text-muted)', marginBottom: '16px' }}>
                "O importador de planilhas me economizou horas de trabalho. Carreguei mais de 100 insumos que eu já tinha catalogado de uma vez só, e os alertas de encarecimento no dashboard são fantásticos."
              </p>
              <strong style={{ fontSize: '0.95rem', display: 'block' }}>Julio Cesar</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pães e Companhia</span>
            </div>

            {/* DEPOIMENTO 3 */}
            <div className="card" style={{ padding: '28px', border: '1px solid var(--border)', background: 'var(--bg)' }}>
              <div style={{ display: 'flex', gap: '4px', color: '#fbbf24', marginBottom: '12px' }}>
                <Star size={16} fill="#fbbf24" /><Star size={16} fill="#fbbf24" /><Star size={16} fill="#fbbf24" /><Star size={16} fill="#fbbf24" /><Star size={16} fill="#fbbf24" />
              </div>
              <p style={{ fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.5, color: 'var(--text-muted)', marginBottom: '16px' }}>
                "A separação clara entre ingredientes e embalagens fez toda a diferença. Agora eu sei quanto do custo é o doce e quanto é a caixa para presente. A integração com o Stripe é super simples."
              </p>
              <strong style={{ fontSize: '0.95rem', display: 'block' }}>Clara Vasconcelos</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Chef Confeiteira</span>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO PREÇOS */}
      <section id="precos" style={{ padding: '80px 24px', backgroundColor: 'var(--bg-card)' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '12px' }}>Preço justo e sem pegadinhas</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Assine o plano completo e comece a precificar profissionalmente hoje mesmo.</p>
          </div>

          <div className="card" style={{ 
            maxWidth: '460px', 
            margin: '0 auto', 
            padding: '40px 32px', 
            background: 'var(--bg)', 
            border: '2px solid var(--primary)', 
            boxShadow: '0 10px 25px rgba(168, 85, 247, 0.15)',
            position: 'relative'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: '-15px', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              background: 'var(--primary)', 
              color: 'white', 
              padding: '4px 16px', 
              borderRadius: '20px', 
              fontSize: '0.8rem', 
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Mais Vendido
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>Plano Confeiteiro Pro</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>Acesso total e ilimitado a todos os recursos da plataforma.</p>
            
            <div style={{ marginBottom: '28px' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 500, verticalAlign: 'top', marginRight: '4px' }}>R$</span>
              <span style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>19,90</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/mês</span>
            </div>

            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: '0 0 36px 0', 
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '0.9rem'
            }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} /> Fichas Técnicas Automáticas e Ilimitadas
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} /> Segregação de Ingredientes e Embalagens
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} /> Importador de Planilha Excel e CSV
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} /> Histórico de Preços e Alertas de Lucro
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} /> Simulador de Metas Financeiras e Custos Fixos
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} style={{ color: 'var(--success)' }} /> Exportação de Dados e Painel LGPD Integrado
              </li>
            </ul>

            <a href={stripePaymentLink} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: 700, display: 'block', textDecoration: 'none', textAlign: 'center' }}>
              Assinar Plano Pro
            </a>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '12px' }}>
              Processamento seguro e criptografado garantido pelo Stripe. Cancelamento grátis a qualquer momento.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ 
        borderTop: '1px solid var(--border)', 
        padding: '32px 24px', 
        background: 'var(--bg-card)', 
        fontSize: '0.85rem', 
        color: 'var(--text-muted)',
        marginTop: 'auto'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span>© {new Date().getFullYear()} Precifica+. Todos os direitos reservados.</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/privacidade" style={{ textDecoration: 'underline', color: 'var(--text-muted)' }}>Política de Privacidade</Link>
            <Link to="/termos" style={{ textDecoration: 'underline', color: 'var(--text-muted)' }}>Termos de Serviço</Link>
          </div>
        </div>
      </footer>
      
    </div>
  );
}
