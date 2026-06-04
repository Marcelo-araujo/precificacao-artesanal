import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShieldCheck, Mail, Lock, User } from 'lucide-react';

interface RegisterProps {
  onAuthSuccess: (user: any) => void;
}

export default function Register({ onAuthSuccess }: RegisterProps) {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }

    if (!termsAccepted) {
      setErrorMsg('Você precisa aceitar a Política de Privacidade e os Termos de Serviço para continuar.');
      return;
    }

    setLoading(true);

    try {
      // Caso de credenciais fictícias locais
      const isPlaceholder = import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
      
      if (isPlaceholder) {
        // Fallback mock para desenvolvimento local
        console.log('[Auth Fallback] Registrando usuário mock:', email);
        const mockUser = {
          id: 'mock-user-123',
          email,
          user_metadata: { full_name: nome }
        };
        // Salva consentimento e dados do mock no localStorage
        localStorage.setItem('precificaalim_user', JSON.stringify(mockUser));
        localStorage.setItem('precificaalim_consent', 'accepted');
        
        // Criar perfil mock no localStorage
        localStorage.setItem('precificaalim_profiles', JSON.stringify({
          id: 'mock-user-123',
          nome,
          email,
          salario_desejado: 2500,
          dias_trabalhados: 22,
          horas_trabalhadas: 8,
          custos_fixos: 500,
          consent_date: new Date().toISOString()
        }));

        onAuthSuccess(mockUser);
        navigate('/');
      } else {
        // Fluxo de registro real no Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: nome,
            }
          }
        });

        if (error) throw error;
        
        if (data.user) {
          // Cria o perfil na tabela 'profiles' registrando a data e hora do consentimento (LGPD)
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                nome,
                email,
                salario_desejado: 0,
                dias_trabalhados: 20,
                horas_trabalhadas: 8,
                custos_fixos: 0,
                consent_date: new Date().toISOString()
              }
            ]);

          if (profileError) {
            console.error('Erro ao salvar perfil:', profileError.message);
          }

          localStorage.setItem('precificaalim_consent', 'accepted');
          onAuthSuccess(data.user);
          navigate('/');
        }
      }
    } catch (err: any) {
      console.error('Erro no registro:', err);
      setErrorMsg(err.message || 'Erro ao registrar sua conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', padding: '24px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', marginBottom: '12px' }}>
            <ShieldCheck size={32} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Criar sua Conta</h2>
          <p style={{ fontSize: '0.875rem', marginTop: '6px' }}>Sua jornada de precificação inteligente começa aqui.</p>
        </div>

        {errorMsg && (
          <div className="alert-card alert-card-danger" style={{ fontSize: '0.875rem', padding: '12px 16px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="nome">Nome Completo</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                id="nome"
                type="text"
                className="input-field"
                placeholder="Ex: Maria da Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
                minLength={6}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="confirmPassword">Confirmar Senha</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input
                id="confirmPassword"
                type="password"
                className="input-field"
                placeholder="Repita sua senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
                minLength={6}
                required
              />
            </div>
          </div>

          <div className="checkbox-group" onClick={() => setTermsAccepted(!termsAccepted)}>
            <input
              type="checkbox"
              className="checkbox-field"
              checked={termsAccepted}
              onChange={() => {}} // Lida no clique da div
              required
            />
            <label className="checkbox-label" style={{ cursor: 'pointer' }}>
              Declaro que li e concordo com os{' '}
              <Link to="/termos" target="_blank" onClick={(e) => e.stopPropagation()} style={{ textDecoration: 'underline', color: 'var(--primary)' }}>
                Termos de Serviço
              </Link>{' '}
              e a{' '}
              <Link to="/privacidade" target="_blank" onClick={(e) => e.stopPropagation()} style={{ textDecoration: 'underline', color: 'var(--primary)' }}>
                Política de Privacidade
              </Link>{' '}
              do sistema, incluindo o processamento seguro de meus dados.
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Criando Conta...' : 'Cadastrar e Precificar'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          <p>
            Já possui uma conta?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Entrar aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
