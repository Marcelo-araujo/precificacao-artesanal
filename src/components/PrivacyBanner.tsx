import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('precificaalim_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('precificaalim_consent', 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>Privacidade e Cookies</h4>
      <p className="cookie-text">
        Nós usamos cookies essenciais para manter você conectado e salvar suas preferências de cálculo. 
        Ao continuar navegando, você declara estar de acordo com nossos{' '}
        <Link to="/termos" style={{ textDecoration: 'underline' }}>
          Termos de Serviço
        </Link>{' '}
        e nossa{' '}
        <Link to="/privacidade" style={{ textDecoration: 'underline' }}>
          Política de Privacidade
        </Link>.
      </p>
      <div className="cookie-actions">
        <button 
          className="btn btn-secondary btn-text" 
          onClick={() => setVisible(false)}
          style={{ fontSize: '0.85rem' }}
        >
          Recusar Opcionais
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleAccept}
          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
        >
          Aceitar e Prosseguir
        </button>
      </div>
    </div>
  );
}
