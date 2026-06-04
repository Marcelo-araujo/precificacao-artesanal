import { Clock, Sparkles, CheckCircle2, LogOut } from 'lucide-react';

interface TrialExpiredPaywallProps {
  user: any;
  handleLogout: () => void;
  onResetTrial: () => void;
}

export default function TrialExpiredPaywall({ user, handleLogout, onResetTrial }: TrialExpiredPaywallProps) {
  const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      padding: '24px',
      background: 'radial-gradient(circle at top right, rgba(168, 85, 247, 0.08), transparent 40%)'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid rgba(168, 85, 247, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Detalhe estético de gradiente */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #a855f7, #ec4899)'
        }}></div>

        <div style={{
          display: 'inline-flex',
          padding: '16px',
          borderRadius: '50%',
          backgroundColor: 'var(--danger-light)',
          color: 'var(--danger)',
          marginBottom: '20px',
          animation: 'pulse 2s infinite'
        }}>
          <Clock size={36} />
        </div>

        <h2 style={{
          fontSize: '2rem',
          fontWeight: 800,
          marginBottom: '12px',
          background: 'linear-gradient(135deg, var(--text) 30%, #a855f7 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.2
        }}>
          Seu Período de Avaliação Expirou!
        </h2>
        
        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          marginBottom: '28px'
        }}>
          Olá, <strong>{user?.user_metadata?.full_name || 'artesão'}</strong>. Seus 3 dias de avaliação gratuita do <strong>Precifica+</strong> chegaram ao fim. Para continuar gerenciando seus custos e protegendo suas margens de lucro, ative sua assinatura Pro.
        </p>

        {/* Card de Benefícios */}
        <div style={{
          background: 'var(--bg)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'left',
          marginBottom: '32px',
          border: '1px solid var(--border)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--primary)',
            fontWeight: 700,
            fontSize: '1rem',
            marginBottom: '16px'
          }}>
            <Sparkles size={18} />
            <span>Recursos Inclusos no Plano Pro</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.875rem' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)', marginTop: '2px', flexShrink: 0 }} />
              <span><strong>Precificação Ilimitada:</strong> Cadastre quantos insumos, embalagens e receitas desejar.</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.875rem' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)', marginTop: '2px', flexShrink: 0 }} />
              <span><strong>Alertas contra Prejuízo:</strong> Monitore margens reais em tempo real frente à inflação.</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.875rem' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)', marginTop: '2px', flexShrink: 0 }} />
              <span><strong>Simulador de Ganhos:</strong> Estipule metas mensais e ponto de equilíbrio por receita.</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.875rem' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--success)', marginTop: '2px', flexShrink: 0 }} />
              <span><strong>Importador de Planilhas:</strong> Carregue insumos e embalagens em lote instantaneamente.</span>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a
            href="https://buy.stripe.com/eVq00cbY28KW6IofCn8og00"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{
              padding: '14px',
              fontSize: '1rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(168, 85, 247, 0.25)'
            }}
          >
            Assinar Plano Pro - R$ 19,90/mês
          </a>

          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{
              padding: '12px',
              fontSize: '0.9rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-muted)'
            }}
          >
            <LogOut size={16} />
            Sair da Conta
          </button>
        </div>

        {/* Recurso de Reset apenas para Teste/Desenvolvimento */}
        {isPlaceholder && (
          <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px dashed var(--border)' }}>
            <button
              onClick={onResetTrial}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                textDecoration: 'underline',
                fontSize: '0.8rem',
                cursor: 'pointer',
                opacity: 0.7,
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              Resetar Período de Avaliação (Apenas Dev)
            </button>
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}} />
    </div>
  );
}
