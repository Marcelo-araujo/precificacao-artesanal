import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Download, Trash2, ShieldAlert } from 'lucide-react';

interface GDPRDashboardProps {
  userId: string;
  onAccountDeleted: () => void;
}

export default function GDPRDashboard({ userId, onAccountDeleted }: GDPRDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Lógica de exportação dos dados do usuário (Portabilidade de Dados - LGPD Art. 18, V)
  const handleExportData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Carrega dados de perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // 2. Carrega insumos
      const { data: insumos } = await supabase
        .from('insumos')
        .select('*')
        .eq('user_id', userId);

      // 3. Carrega receitas
      const { data: receitas } = await supabase
        .from('receitas')
        .select('*')
        .eq('user_id', userId);

      const fullData = {
        exportado_em: new Date().toISOString(),
        perfil: profile || { user_id: userId },
        insumos: insumos || [],
        receitas: receitas || [],
        mensagem: 'Dados exportados em conformidade com o Artigo 18 da Lei Geral de Proteção de Dados (LGPD).'
      };

      // Cria download do JSON
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `meus-dados-precificamais-${userId.slice(0, 8)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Erro na portabilidade dos dados:', err);
      setErrorMsg('Falha ao exportar seus dados. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Lógica de exclusão da conta (Direito ao Esquecimento - LGPD Art. 18, VI)
  const handleDeleteAccount = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // Exclui no banco de dados. A tabela profiles/auth e demais tabelas relacionadas
      // devem ter exclusão em cascata (ON DELETE CASCADE) configurada no PostgreSQL do Supabase.
      // Se a cascata estiver configurada no banco, deletar o profile irá limpar tudo.
      const { error: dbError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (dbError) throw dbError;

      // Dispara a exclusão da autenticação do Supabase
      const { error: authError } = await supabase.auth.signOut();
      if (authError) throw authError;

      onAccountDeleted();
    } catch (err: any) {
      console.error('Erro ao deletar conta:', err);
      setErrorMsg(err.message || 'Falha ao processar a exclusão. Por favor, contate o suporte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left', border: '1px solid var(--danger-light)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ShieldAlert style={{ color: 'var(--danger)', width: '28px', height: '28px' }} />
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Gerenciamento de Privacidade e Dados (LGPD)</h3>
          <p style={{ fontSize: '0.85rem' }}>Gerencie suas informações e controle seus direitos de privacidade.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="alert-card alert-card-danger" style={{ fontSize: '0.875rem' }}>
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Portabilidade dos Dados</h4>
            <p style={{ fontSize: '0.8rem' }}>Baixe uma cópia completa de suas receitas, insumos e dados cadastrais em formato JSON legível.</p>
          </div>
          <button 
            className="btn btn-secondary" 
            onClick={handleExportData} 
            disabled={loading}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <Download size={16} />
            Exportar Meus Dados
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '4px' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--danger)' }}>Excluir Minha Conta (Direito ao Esquecimento)</h4>
            <p style={{ fontSize: '0.8rem' }}>Esta ação é irreversível. Todos os seus insumos, receitas e dados cadastrados serão permanentemente apagados de nossos servidores.</p>
          </div>
          
          {!confirmDelete ? (
            <button 
              className="btn btn-danger" 
              onClick={() => setConfirmDelete(true)} 
              disabled={loading}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <Trash2 size={16} />
              Excluir Conta
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 600 }}>Tem certeza?</span>
              <button 
                className="btn btn-secondary" 
                onClick={() => setConfirmDelete(false)}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleDeleteAccount}
                disabled={loading}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                Sim, Excluir Tudo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
