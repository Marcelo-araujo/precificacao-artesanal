import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Mail, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onAuthSuccess: (user: any) => void;
}

export default function Login({ onAuthSuccess }: LoginProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const isPlaceholder = import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
      
      if (isPlaceholder) {
        // Fallback mock
        console.log('[Auth Fallback] Autenticando usuário mock:', email);
        const mockUser = {
          id: 'mock-user-123',
          email,
          user_metadata: { full_name: 'Artesão Confeiteiro' }
        };
        localStorage.setItem('precificaalim_user', JSON.stringify(mockUser));
        onAuthSuccess(mockUser);
        navigate('/');
      } else {
        // Login real no Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        
        if (data.user) {
          onAuthSuccess(data.user);
          navigate('/');
        }
      }
    } catch (err: any) {
      console.error('Erro no login:', err);
      setErrorMsg(err.message || 'Senha incorreta ou usuário não encontrado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '24px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', marginBottom: '12px' }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Entrar no PrecificaAlim</h2>
          <p style={{ fontSize: '0.875rem', marginTop: '6px' }}>Proteja sua margem de lucro contra a inflação.</p>
        </div>

        {errorMsg && (
          <div className="alert-card alert-card-danger" style={{ fontSize: '0.875rem', padding: '12px 16px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">E-mail</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="Ex: confeitaria@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                id="password"
                type="password"
                className="input-field"
                placeholder="Insira sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Acessando...' : 'Entrar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          <p>
            Não tem uma conta?{' '}
            <Link to="/cadastro" style={{ fontWeight: 600 }}>
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
