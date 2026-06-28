import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { supabase, pingDatabase } from './lib/supabase';
import { useData } from './hooks/useData';
import * as XLSX from 'xlsx';

// Componentes e Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import PrivacyBanner from './components/PrivacyBanner';
import GDPRDashboard from './components/GDPRDashboard';
import LandingPage from './pages/LandingPage';
import TrialExpiredPaywall from './components/TrialExpiredPaywall';
import { Kits } from './pages/Kits';

// Ícones
import {
  TrendingUp, Sparkles, Plus, Trash2, Settings,
  ClipboardList, ShoppingCart, LogOut, DollarSign,
  Clock, Calendar, CheckCircle2, AlertTriangle, X, Edit2, Menu, Package
} from 'lucide-react';

function AppContent() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [trialExpired, setTrialExpired] = useState(false);
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'compras' | 'receitas' | 'kits' | 'config'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddInsumoModal, setShowAddInsumoModal] = useState(false);
  const [expandedHistoryInsumoId, setExpandedHistoryInsumoId] = useState<string | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Controle de sub-abas internas da Lista de Compras
  const [comprasSubTab, setComprasSubTab] = useState<'ingrediente' | 'embalagem'>('ingrediente');
  const [newInsumoTipo, setNewInsumoTipo] = useState<'ingrediente' | 'embalagem'>('ingrediente');

  // Controle de Custos Fixos adicionais
  const [showAddCustoModal, setShowAddCustoModal] = useState(false);
  const [newCustoNome, setNewCustoNome] = useState('');
  const [newCustoValor, setNewCustoValor] = useState(0);

  // Controle de formulários (estados locais)
  const [newInsumoNome, setNewInsumoNome] = useState('');
  const [newInsumoPreco, setNewInsumoPreco] = useState(0);
  const [newInsumoQtd, setNewInsumoQtd] = useState(0);
  const [newInsumoUnidade, setNewInsumoUnidade] = useState('g');

  const [newReceitaNome, setNewReceitaNome] = useState('');
  const [newReceitaRendimento, setNewReceitaRendimento] = useState(1);
  const [newReceitaTempo, setNewReceitaTempo] = useState(30);
  const [newReceitaMargem, setNewReceitaMargem] = useState(30);
  const [newReceitaPrecoVenda, setNewReceitaPrecoVenda] = useState(0);
  const [isPrecoVendaEdited, setIsPrecoVendaEdited] = useState(false);

  const [newReceitaIngredientes, setNewReceitaIngredientes] = useState<{ insumo_id: string; vanity?: boolean; quantidade: number }[]>([]);
  const [selectedInsumoId, setSelectedInsumoId] = useState('');
  const [selectedInsumoQtd, setSelectedInsumoQtd] = useState(0);
  const [editingReceitaId, setEditingReceitaId] = useState<string | null>(null);
  const [newReceitaPerda, setNewReceitaPerda] = useState(0);
  const [newReceitaPeso, setNewReceitaPeso] = useState(0);
  const [simulacaoQuantidades, setSimulacaoQuantidades] = useState<{ [key: string]: number }>({});

  // Estados para o Modal de Importação de Planilha
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState(1);
  const [sheetColumns, setSheetColumns] = useState<string[]>([]);
  const [sheetData, setSheetData] = useState<any[]>([]);
  const [mapping, setMapping] = useState({
    nome: '',
    preco: '',
    quantidade: '',
    unidade: '',
    tipo: ''
  });
  const [defaultUnidade, setDefaultUnidade] = useState('g');
  const [defaultTipo, setDefaultTipo] = useState('ingrediente');
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);

  // Estados para Estoque e Produção
  const [showCompraModal, setShowCompraModal] = useState(false);
  const [compraInsumoId, setCompraInsumoId] = useState('');
  const [compraEmbalagens, setCompraEmbalagens] = useState(1);
  const [compraPreco, setCompraPreco] = useState(0);


  // Custom Hook com a lógica de dados
  const {
    profile, insumos, receitas, kits, loading: dataLoading, custosItens,
    addInsumo, updateInsumo, deleteInsumo,
    addReceita, deleteReceita, updateReceita, updateProfile, getCalculosReceita, getPrecosHistoricos,
    addCustoItem, updateCustoItem, deleteCustoItem, limparTodosInsumos, importarInsumosLote,
    addKit, updateKit, deleteKit, getCalculosKit,
    registrarCompraInsumo
  } = useData(user?.id || null);

  const filteredInsumos = [...insumos]
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .filter(insumo =>
      insumo.nome.toLowerCase().includes(searchTerm.toLowerCase()) &&
      insumo.tipo === comprasSubTab
    );

  // Monitora a sessão de autenticação
  useEffect(() => {
    const checkUser = async () => {
      const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

      if (isPlaceholder) {
        const savedUser = localStorage.getItem('precificaalim_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        setAuthLoading(false);
      } else {
        // Ping inicial para acordar o banco se necessário
        pingDatabase();

        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
        });

        setAuthLoading(false);
        return () => subscription.unsubscribe();
      }
    };

    checkUser();
  }, []);

  // Monitora e calcula o estado de expiração do período de avaliação do usuário
  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata || {};
      const isTrial = metadata.is_trial;
      const trialStartDate = metadata.trial_start_date;

      if (isTrial && trialStartDate) {
        const start = new Date(trialStartDate).getTime();
        const now = new Date().getTime();
        const diffTime = now - start;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        // Limite de 3 dias
        if (diffDays >= 3) {
          setTrialExpired(true);
          setDiasRestantes(0);
        } else {
          setTrialExpired(false);
          setDiasRestantes(Math.max(0, Math.ceil(3 - diffDays)));
        }
      } else {
        setTrialExpired(false);
        setDiasRestantes(null);
      }
    } else {
      setTrialExpired(false);
      setDiasRestantes(null);
    }
  }, [user]);

  const handleResetTrial = () => {
    if (!user) return;

    // Atualiza o objeto de metadados localmente
    const updatedUser = {
      ...user,
      user_metadata: {
        ...user.user_metadata,
        trial_start_date: new Date().toISOString()
      }
    };

    // Salva no localStorage caso seja mock
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
    if (isPlaceholder) {
      localStorage.setItem('precificaalim_user', JSON.stringify(updatedUser));
    }

    // Atualiza o estado do usuário
    setUser(updatedUser);
  };

  const handleLogout = async () => {
    const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');
    if (isPlaceholder) {
      localStorage.removeItem('precificaalim_user');
      setUser(null);
      navigate('/login');
    } else {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
    }
  };

  const handleAccountDeleted = () => {
    localStorage.removeItem('precificaalim_user');
    setUser(null);
    navigate('/login');
  };

  const previewCalc = getCalculosReceita({
    id: 'preview',
    user_id: user?.id || '',
    nome: newReceitaNome || 'Preview',
    rendimento: newReceitaRendimento || 1,
    rendimento_peso: newReceitaPeso || 0,
    ingredientes: newReceitaIngredientes,
    tempo_preparo: newReceitaTempo || 0,
    margem_alvo: newReceitaMargem || 0,
    preco_venda_praticado: newReceitaPrecoVenda || 0,
    fator_perda: newReceitaPerda || 0
  });

  useEffect(() => {
    if (!isPrecoVendaEdited && previewCalc.precoVendaIdeal > 0) {
      setNewReceitaPrecoVenda(Number(previewCalc.precoVendaIdeal.toFixed(2)));
    }
  }, [previewCalc.precoVendaIdeal, isPrecoVendaEdited]);

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>Carregando sua cozinha...</p>
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes spin { to { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  // Se o usuário não estiver logado, redireciona rotas protegidas
  const isPublicRoute = ['/', '/login', '/cadastro', '/privacidade', '/termos'].includes(window.location.pathname);
  if (!user && !isPublicRoute) {
    return <Navigate to="/login" replace />;
  }

  // Helpers para o Dashboard e Lista de compras
  const addIngredienteToDraft = () => {
    if (!selectedInsumoId || selectedInsumoQtd <= 0) return;
    setNewReceitaIngredientes([
      ...newReceitaIngredientes,
      { insumo_id: selectedInsumoId, quantidade: selectedInsumoQtd }
    ]);
    setSelectedInsumoId('');
    setSelectedInsumoQtd(0);
  };

  const removeIngredienteFromDraft = (index: number) => {
    setNewReceitaIngredientes(newReceitaIngredientes.filter((_, i) => i !== index));
  };

  const handleCreateInsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInsumoNome || newInsumoPreco <= 0 || newInsumoQtd <= 0) return;
    await addInsumo(newInsumoNome, newInsumoPreco, newInsumoQtd, newInsumoUnidade, newInsumoTipo);
    setNewInsumoNome('');
    setNewInsumoPreco(0);
    setNewInsumoQtd(0);
  };

  const handleCreateReceita = async (e: React.FormEvent) => {
    e.preventDefault();

    // UX Fallback: se houver um insumo selecionado com quantidade válida no select, adiciona automaticamente
    let ingredientesFinais = [...newReceitaIngredientes];
    if (selectedInsumoId && selectedInsumoQtd > 0) {
      ingredientesFinais.push({ insumo_id: selectedInsumoId, quantidade: selectedInsumoQtd });
      setSelectedInsumoId('');
      setSelectedInsumoQtd(0);
    }

    if (!newReceitaNome || newReceitaRendimento <= 0 || ingredientesFinais.length === 0) return;

    if (editingReceitaId) {
      await updateReceita(
        editingReceitaId,
        newReceitaNome,
        newReceitaRendimento,
        ingredientesFinais,
        newReceitaTempo,
        newReceitaMargem,
        newReceitaPrecoVenda,
        newReceitaPerda,
        newReceitaPeso
      );
      setEditingReceitaId(null);
    } else {
      await addReceita(
        newReceitaNome,
        newReceitaRendimento,
        ingredientesFinais,
        newReceitaTempo,
        newReceitaMargem,
        newReceitaPrecoVenda,
        newReceitaPerda,
        newReceitaPeso
      );
    }

    setNewReceitaNome('');
    setNewReceitaRendimento(1);
    setNewReceitaTempo(30);
    setNewReceitaMargem(30);
    setNewReceitaPrecoVenda(0);

    setNewReceitaPerda(0);
    setNewReceitaPeso(0);
    setNewReceitaIngredientes([]);
    setIsPrecoVendaEdited(false);
  };

  // Ações de Importação de Planilha
  const handleImportFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[];
        if (data.length === 0) {
          alert('A planilha selecionada está vazia.');
          return;
        }

        const headers = data[0] as string[];
        const rows = data.slice(1);

        const formattedRows = rows.map(row => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] !== undefined ? row[index] : null;
          });
          return obj;
        });

        setSheetColumns(headers);
        setSheetData(formattedRows);

        const mappingAdivinhado = {
          nome: headers.find(h => ['nome', 'produto', 'insumo', 'ingrediente', 'embalagem', 'descrição', 'desc'].some(k => String(h).toLowerCase().trim().includes(k))) || '',
          preco: headers.find(h => ['preco', 'preço', 'valor', 'custo', 'pago'].some(k => String(h).toLowerCase().trim().includes(k))) || '',
          quantidade: headers.find(h => ['quantidade', 'qtd', 'medida', 'peso', 'volume', 'tamanho'].some(k => String(h).toLowerCase().trim().includes(k))) || '',
          unidade: headers.find(h => ['unidade', 'unid', 'medida', 'tipo unidade'].some(k => String(h).toLowerCase().trim().includes(k))) || '',
          tipo: headers.find(h => ['tipo', 'categoria', 'tipo insumo', 'classe'].some(k => String(h).toLowerCase().trim().includes(k))) || ''
        };

        setMapping(mappingAdivinhado);
        setImportStep(2);
      } catch (err) {
        console.error(err);
        alert('Erro ao processar o arquivo de planilha. Certifique-se de que é um Excel ou CSV válido.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const applyMappingAndPreview = () => {
    if (!mapping.nome || !mapping.preco || !mapping.quantidade) {
      alert('Por favor, preencha o mapeamento dos campos obrigatórios (Nome, Preço e Quantidade).');
      return;
    }

    const preview = sheetData.map(row => {
      const rawNome = String(row[mapping.nome] || '').trim();
      // Sanitização de segurança contra XSS: remove tags HTML e URIs javascript:
      const nomeVal = rawNome
        .replace(/<[^>]*>?/gm, '')
        .replace(/javascript:/gi, '')
        .replace(/[<>]/g, '');

      let precoVal = 0;
      if (mapping.preco && row[mapping.preco] !== null) {
        const raw = String(row[mapping.preco]);
        precoVal = parseFloat(raw.replace(/[R$\s]/g, '').replace(',', '.')) || 0;
      }

      let qtdVal = 0;
      if (mapping.quantidade && row[mapping.quantidade] !== null) {
        const raw = String(row[mapping.quantidade]);
        qtdVal = parseFloat(raw.replace(',', '.')) || 0;
      }

      let unidadeVal = defaultUnidade;
      if (mapping.unidade && row[mapping.unidade]) {
        const raw = String(row[mapping.unidade]).toLowerCase().trim();
        if (['g', 'gramas', 'grama'].includes(raw)) unidadeVal = 'g';
        else if (['ml', 'mililitros', 'mililitro', 'l', 'litro', 'litros'].includes(raw)) unidadeVal = 'ml';
        else if (['un', 'unidade', 'unidades', 'peça', 'peças'].includes(raw)) unidadeVal = 'un';
      }

      let tipoVal = defaultTipo as 'ingrediente' | 'embalagem';
      if (mapping.tipo && row[mapping.tipo]) {
        const raw = String(row[mapping.tipo]).toLowerCase().trim();
        if (['embalagem', 'embalagens', 'caixa', 'saco', 'fecho', 'fita', 'tag', 'sacola'].some(k => raw.includes(k))) {
          tipoVal = 'embalagem';
        } else {
          tipoVal = 'ingrediente';
        }
      }

      return {
        nome: nomeVal,
        preco_pago: precoVal,
        quantidade_embalagem: qtdVal,
        unidade: unidadeVal,
        tipo: tipoVal
      };
    }).filter(item => item.nome !== '');

    setImportPreview(preview);
    setImportStep(3);
  };

  const handleExecuteImport = async () => {
    if (importPreview.length === 0) return;
    setImporting(true);
    try {
      await importarInsumosLote(importPreview);
      alert(`${importPreview.length} insumos importados/atualizados com sucesso!`);
      setShowImportModal(false);
      setImportStep(1);
      setSheetColumns([]);
      setSheetData([]);
      setImportPreview([]);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro durante a importação dos dados.');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = ['Nome do Insumo', 'Preço Pago (R$)', 'Quantidade da Embalagem', 'Unidade (g, ml, un)', 'Tipo (ingrediente ou embalagem)'];
    const sampleData = [
      ['Farinha de Trigo Especial', 5.50, 1000, 'g', 'ingrediente'],
      ['Leite Condensado Moça', 7.80, 395, 'g', 'ingrediente'],
      ['Manteiga com Sal Elegê', 18.90, 500, 'g', 'ingrediente'],
      ['Caixa de Papelão para Bolo', 4.50, 1, 'un', 'embalagem'],
      ['Fecho de Arame Prático', 0.05, 1, 'un', 'embalagem']
    ];

    try {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
      XLSX.utils.book_append_sheet(wb, ws, 'Modelo Insumos');
      XLSX.writeFile(wb, 'modelo_importacao_precificamais.xlsx');
    } catch (err) {
      console.error('Erro ao gerar planilha modelo:', err);
      alert('Não foi possível gerar a planilha modelo.');
    }
  };



  return (
    <>
      {user && !trialExpired && (
        <header style={{
          position: 'sticky',
          top: 0,
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(var(--glass-blur))',
          borderBottom: '1px solid var(--border)',
          zIndex: 100,
          padding: '12px 24px'
        }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'var(--primary)', color: 'white', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                <Sparkles size={20} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>
                Precifica<span style={{ color: 'var(--primary)' }}>+</span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {diasRestantes !== null && (
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'hsl(var(--warning-h), var(--warning-s), 30%)',
                  backgroundColor: 'var(--warning-light)',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Clock size={12} />
                  Avaliação: {diasRestantes} {diasRestantes === 1 ? 'dia' : 'dias'} restante{diasRestantes === 1 ? '' : 's'}
                </span>
              )}

              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setIsNavOpen(!isNavOpen)}
                  style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Menu size={20} /> Menu
                </button>

                {isNavOpen && (
                  <nav style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    background: 'var(--bg-card)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                    zIndex: 200,
                    minWidth: '220px'
                  }}>
                    <button className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setActiveTab('dashboard'); setIsNavOpen(false); }} style={{ padding: '10px 16px', fontSize: '0.9rem', justifyContent: 'flex-start', width: '100%' }}>
                      Dashboard
                    </button>
                    <button className={`btn ${activeTab === 'compras' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setActiveTab('compras'); setIsNavOpen(false); }} style={{ padding: '10px 16px', fontSize: '0.9rem', justifyContent: 'flex-start', width: '100%' }}>
                      <ShoppingCart size={18} /> Lista de Compras
                    </button>
                    <button className={`btn ${activeTab === 'receitas' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setActiveTab('receitas'); setIsNavOpen(false); }} style={{ padding: '10px 16px', fontSize: '0.9rem', justifyContent: 'flex-start', width: '100%' }}>
                      <ClipboardList size={18} /> Receitas
                    </button>
                    <button className={`btn ${activeTab === 'kits' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setActiveTab('kits'); setIsNavOpen(false); }} style={{ padding: '10px 16px', fontSize: '0.9rem', justifyContent: 'flex-start', width: '100%' }}>
                      <Package size={18} /> Kits e Combos
                    </button>
                    <button className={`btn ${activeTab === 'config' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { setActiveTab('config'); setIsNavOpen(false); }} style={{ padding: '10px 16px', fontSize: '0.9rem', justifyContent: 'flex-start', width: '100%' }}>
                      <Settings size={18} /> Configurações
                    </button>
                  </nav>
                )}
              </div>

              <span className="desktop-only" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{profile?.nome || user.email}</span>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                <LogOut size={14} /> Sair
              </button>
            </div>
          </div>
        </header>
      )}

      <main style={{ flexGrow: 1, padding: user ? '32px 0' : 0 }}>
        <Routes>
          <Route path="/login" element={!user ? <Login onAuthSuccess={setUser} /> : <Navigate to="/" replace />} />
          <Route path="/cadastro" element={!user ? <Register onAuthSuccess={setUser} /> : <Navigate to="/" replace />} />
          <Route path="/privacidade" element={<PrivacyPolicy />} />
          <Route path="/termos" element={<TermsOfService />} />

          <Route path="/" element={
            user ? (
              trialExpired ? (
                <TrialExpiredPaywall
                  user={user}
                  handleLogout={handleLogout}
                  onResetTrial={handleResetTrial}
                />
              ) : (
                <div className="container">
                  {dataLoading ? (
                    <p style={{ textAlign: 'center', padding: '40px' }}>Carregando dados da sua cozinha...</p>
                  ) : (
                    <>
                      {/* ABA: DASHBOARD */}
                      {activeTab === 'dashboard' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                              <h2 style={{ fontWeight: 800 }}>Dashboard de Alertas</h2>
                              <p style={{ fontSize: '0.9rem' }}>Monitore a lucratividade de suas receitas e proteja suas margens.</p>
                            </div>
                          </div>

                          {/* Cards de Alertas de Lucro (MVP core) */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px' }}>
                            {/* Alerta de Receitas que Encareceram (Vermelho) */}
                            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '6px solid var(--danger)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.1rem', color: 'var(--danger)', fontWeight: 700 }}>Alerta de Queda de Lucro</h3>
                                <AlertTriangle size={24} style={{ color: 'var(--danger)' }} />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {receitas.filter(rec => {
                                  const calc = getCalculosReceita(rec);
                                  return calc.margemRealProjetada < rec.margem_alvo;
                                }).length === 0 ? (
                                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Todas as suas receitas estão operando com margem dentro ou acima do esperado.</p>
                                ) : (
                                  receitas.filter(rec => {
                                    const calc = getCalculosReceita(rec);
                                    return calc.margemRealProjetada < rec.margem_alvo;
                                  }).map(rec => {
                                    const calc = getCalculosReceita(rec);
                                    return (
                                      <div key={rec.id} className="alert-card alert-card-danger" style={{ margin: 0, padding: '10px 14px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                          <strong style={{ display: 'block' }}>{rec.nome}</strong>
                                          <span>Margem: {calc.margemRealProjetada.toFixed(1)}% (Alvo: {rec.margem_alvo}%)</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                          <strong style={{ display: 'block' }}>Custo: R$ {calc.custoTotal.toFixed(2)}</strong>
                                          <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>+{calc.diferencaCusto > 0 ? `R$ ${calc.diferencaCusto.toFixed(2)}` : 'Variação'}</span>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>

                            {/* Alerta de Receitas Saudáveis (Verde) */}
                            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '6px solid var(--success)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.1rem', color: 'var(--success)', fontWeight: 700 }}>Margem Segura</h3>
                                <CheckCircle2 size={24} style={{ color: 'var(--success)' }} />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {receitas.filter(rec => {
                                  const calc = getCalculosReceita(rec);
                                  return calc.margemRealProjetada >= rec.margem_alvo;
                                }).length === 0 ? (
                                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nenhuma receita cadastrada ou operando acima do alvo.</p>
                                ) : (
                                  receitas.filter(rec => {
                                    const calc = getCalculosReceita(rec);
                                    return calc.margemRealProjetada >= rec.margem_alvo;
                                  }).map(rec => {
                                    const calc = getCalculosReceita(rec);
                                    return (
                                      <div key={rec.id} className="alert-card alert-card-success" style={{ margin: 0, padding: '10px 14px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                          <strong style={{ display: 'block' }}>{rec.nome}</strong>
                                          <span>Margem: {calc.margemRealProjetada.toFixed(1)}% (Alvo: {rec.margem_alvo}%)</span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                          <strong style={{ display: 'block' }}>Preço Venda: R$ {rec.preco_venda_praticado.toFixed(2)}</strong>
                                          <span style={{ fontSize: '0.75rem' }}>Custo: R$ {calc.custoTotal.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>

                            {/* Sugestões de Preço de Venda (Roxo) */}
                            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '6px solid var(--primary)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 700 }}>Ajustes Recomendados</h3>
                                <TrendingUp size={24} style={{ color: 'var(--primary)' }} />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {receitas.filter(rec => {
                                  const calc = getCalculosReceita(rec);
                                  return calc.margemRealProjetada < rec.margem_alvo;
                                }).length === 0 ? (
                                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sem sugestões de ajustes. Seus preços praticados sustentam as margens de lucro.</p>
                                ) : (
                                  receitas.filter(rec => {
                                    const calc = getCalculosReceita(rec);
                                    return calc.margemRealProjetada < rec.margem_alvo;
                                  }).map(rec => {
                                    const calc = getCalculosReceita(rec);
                                    return (
                                      <div key={rec.id} className="alert-card alert-card-warning" style={{ margin: 0, padding: '10px 14px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', backgroundColor: 'var(--primary-light)', borderColor: 'rgba(168, 85, 247, 0.2)', color: 'hsl(var(--primary-h), var(--primary-s), 25%)' }}>
                                        <div>
                                          <strong style={{ display: 'block' }}>{rec.nome}</strong>
                                          <span>Praticado: <span style={{ textDecoration: 'line-through' }}>R$ {rec.preco_venda_praticado.toFixed(2)}</span></span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                          <strong style={{ display: 'block', color: 'var(--primary)' }}>Sugerido: R$ {calc.precoVendaIdeal.toFixed(2)}</strong>
                                          <span style={{ fontSize: '0.75rem' }}>Para atingir {rec.margem_alvo}%</span>
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Visão de Custos Gerais e Métricas do Negócio */}
                          <div className="card" style={{ textAlign: 'left' }}>
                            <h3 style={{ marginBottom: '16px' }}>Painel Resumo da Operação</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '20px' }}>
                              <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: '12px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Salário Mensal Esperado</span>
                                <strong style={{ fontSize: '1.4rem' }}>R$ {(profile?.salario_desejado || 0).toFixed(2)}</strong>
                              </div>
                              <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: '12px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Custos Fixos Totais</span>
                                <strong style={{ fontSize: '1.4rem' }}>R$ {custosItens.reduce((sum, item) => sum + item.valor, 0).toFixed(2)}</strong>
                              </div>
                              <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: '12px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Total de Insumos</span>
                                <strong style={{ fontSize: '1.4rem' }}>{insumos.length} itens</strong>
                              </div>
                              <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: '12px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Total de Receitas</span>
                                <strong style={{ fontSize: '1.4rem' }}>{receitas.length} ativas</strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ABA: LISTA DE COMPRAS (Otimizada para Mobile e Desktop) */}
                      {activeTab === 'compras' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                              <h2 style={{ fontWeight: 800 }}>Lista de Compras</h2>
                              <p style={{ fontSize: '0.9rem' }}>Busque ingredientes, atualize preços no mercado ou cadastre novos insumos.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>

                              <button
                                className="btn btn-secondary"
                                onClick={async () => {
                                  if (window.confirm("Deseja realmente apagar todos os insumos e embalagens da sua base de dados? Esta ação não pode ser desfeita e também afetará os ingredientes associados nas receitas.")) {
                                    try {
                                      await limparTodosInsumos();
                                      alert("Todos os insumos foram apagados com sucesso!");
                                      window.location.reload();
                                    } catch (err) {
                                      alert("Erro ao limpar insumos.");
                                      console.error(err);
                                    }
                                  }
                                }}
                                style={{ padding: '10px 20px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                              >
                                Limpar Insumos
                              </button>
                              <button
                                className="btn btn-secondary"
                                onClick={() => {
                                  setShowImportModal(true);
                                  setImportStep(1);
                                }}
                                style={{ padding: '10px 20px' }}
                              >
                                Importar Planilha
                              </button>
                              <button
                                className="btn btn-primary"
                                onClick={() => {
                                  setShowAddInsumoModal(true);
                                  setNewInsumoTipo(comprasSubTab);
                                }}
                                style={{ padding: '10px 20px' }}
                              >
                                <Plus size={18} /> Novo Insumo
                              </button>
                            </div>
                          </div>

                          {/* Sub-abas de Categorização de Insumos */}
                          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                            <button
                              type="button"
                              className={`btn ${comprasSubTab === 'ingrediente' ? 'btn-primary' : 'btn-secondary'}`}
                              onClick={() => setComprasSubTab('ingrediente')}
                              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                              Base de Insumos & Ingredientes
                            </button>
                            <button
                              type="button"
                              className={`btn ${comprasSubTab === 'embalagem' ? 'btn-primary' : 'btn-secondary'}`}
                              onClick={() => setComprasSubTab('embalagem')}
                              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                              Base de Embalagens e Componentes
                            </button>
                          </div>

                          {/* Barra de Busca */}
                          <div className="card" style={{ padding: '16px' }}>
                            <input
                              type="text"
                              className="input-field"
                              placeholder={comprasSubTab === 'ingrediente' ? "Buscar ingrediente por nome..." : "Buscar embalagem por nome..."}
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              style={{ margin: 0 }}
                            />
                          </div>

                          {filteredInsumos.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                              <p style={{ color: 'var(--text-muted)' }}>
                                {comprasSubTab === 'ingrediente'
                                  ? 'Nenhum insumo ou ingrediente encontrado. Cadastre um novo clicando no botão acima.'
                                  : 'Nenhuma embalagem ou componente encontrado. Cadastre um novo clicando no botão acima.'}
                              </p>
                            </div>
                          ) : (
                            <>
                              {/* VISÃO DESKTOP (Tabela Completa com Histórico de Preços) */}
                              <div className="card desktop-only" style={{ overflowX: 'auto', padding: '16px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                  <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                                      <th style={{ padding: '12px', textAlign: 'left' }}>Nome</th>
                                      <th style={{ padding: '12px', textAlign: 'left' }}>Embalagem</th>
                                      <th style={{ padding: '12px', textAlign: 'right' }}>Preço Anterior 2</th>
                                      <th style={{ padding: '12px', textAlign: 'right' }}>Preço Anterior 1</th>
                                      <th style={{ padding: '12px', textAlign: 'center' }}>Variação</th>
                                      <th style={{ padding: '12px', textAlign: 'right', width: '180px' }}>Preço Atual (R$)</th>
                                      <th style={{ padding: '12px', textAlign: 'center', width: '120px' }}>Ações</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {filteredInsumos.map(insumo => {
                                      const hist = getPrecosHistoricos(insumo.id);
                                      const precoAtual = insumo.preco_pago;
                                      const precoAnterior1 = hist.length > 1 ? hist[1] : null;
                                      const precoAnterior2 = hist.length > 2 ? hist[2] : null;

                                      let variacao = 0;
                                      if (precoAnterior1 && precoAnterior1 > 0) {
                                        variacao = ((precoAtual - precoAnterior1) / precoAnterior1) * 100;
                                      }

                                      return (
                                        <tr key={insumo.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                          <td style={{ padding: '12px', fontWeight: 600 }}>{insumo.nome}</td>
                                          <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{insumo.quantidade_embalagem} {insumo.unidade}</td>
                                          <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)' }}>
                                            {precoAnterior2 !== null ? `R$ ${precoAnterior2.toFixed(2)}` : '-'}
                                          </td>
                                          <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)' }}>
                                            {precoAnterior1 !== null ? `R$ ${precoAnterior1.toFixed(2)}` : '-'}
                                          </td>
                                          <td style={{ padding: '12px', textAlign: 'center' }}>
                                            {precoAnterior1 !== null ? (
                                              variacao > 0 ? (
                                                <span className="badge badge-danger">+{variacao.toFixed(1)}%</span>
                                              ) : variacao < 0 ? (
                                                <span className="badge badge-success">{variacao.toFixed(1)}%</span>
                                              ) : (
                                                <span className="badge badge-neutral">0.0%</span>
                                              )
                                            ) : (
                                              <span className="badge badge-neutral">Novo</span>
                                            )}
                                          </td>
                                          <td style={{ padding: '12px', textAlign: 'right' }}>
                                            <input
                                              type="number"
                                              step="0.01"
                                              className="input-field"
                                              defaultValue={insumo.preco_pago}
                                              onBlur={async (e) => {
                                                const val = parseFloat(e.target.value);
                                                if (!isNaN(val) && val > 0 && val !== insumo.preco_pago) {
                                                  await updateInsumo(insumo.id, val);
                                                }
                                              }}
                                              style={{ width: '120px', padding: '6px 10px', textAlign: 'right', display: 'inline-block' }}
                                            />
                                          </td>
                                          <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button
                                              className="btn btn-primary"
                                              onClick={() => {
                                                setCompraInsumoId(insumo.id);
                                                setCompraEmbalagens(1);
                                                setCompraPreco(insumo.preco_pago);
                                                setShowCompraModal(true);
                                              }}
                                              style={{ padding: '6px', borderRadius: '8px', background: 'var(--success)' }}
                                              title="Registrar Compra / Repor Estoque"
                                            >
                                              <Plus size={14} />
                                            </button>
                                            <button
                                              className="btn btn-danger"
                                              onClick={() => deleteInsumo(insumo.id)}
                                              style={{ padding: '6px', borderRadius: '8px' }}
                                              title="Excluir Insumo"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              {/* VISÃO MOBILE (Lista de Cartões Compactos Otimizados para Toque) */}
                              <div className="mobile-only">
                                {filteredInsumos.map(insumo => {
                                  const hist = getPrecosHistoricos(insumo.id);
                                  const precoAtual = insumo.preco_pago;
                                  const precoAnterior1 = hist.length > 1 ? hist[1] : null;

                                  let variacao = 0;
                                  if (precoAnterior1 && precoAnterior1 > 0) {
                                    variacao = ((precoAtual - precoAnterior1) / precoAnterior1) * 100;
                                  }

                                  const isExpanded = expandedHistoryInsumoId === insumo.id;

                                  return (
                                    <div key={insumo.id} className="mobile-insumo-card">
                                      <div className="mobile-insumo-header">
                                        <div>
                                          <strong style={{ fontSize: '1.05rem', color: 'var(--text)' }}>{insumo.nome}</strong>
                                          <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Embalagem: {insumo.quantidade_embalagem} {insumo.unidade}
                                          </span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                          {precoAnterior1 !== null ? (
                                            variacao > 0 ? (
                                              <span className="badge badge-danger">+{variacao.toFixed(1)}%</span>
                                            ) : variacao < 0 ? (
                                              <span className="badge badge-success">{variacao.toFixed(1)}%</span>
                                            ) : (
                                              <span className="badge badge-neutral">0.0%</span>
                                            )
                                          ) : (
                                            <span className="badge badge-neutral">Novo</span>
                                          )}
                                          <button
                                            className="btn btn-primary"
                                            onClick={() => {
                                              setCompraInsumoId(insumo.id);
                                              setCompraEmbalagens(1);
                                              setCompraPreco(insumo.preco_pago);
                                              setShowCompraModal(true);
                                            }}
                                            style={{ padding: '6px 12px', borderRadius: '8px', background: 'var(--success)', fontSize: '0.75rem' }}
                                          >
                                            <Plus size={14} style={{ marginRight: '4px' }} /> Novo Preço
                                          </button>
                                        </div>
                                      </div>

                                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <button
                                          type="button"
                                          className="btn btn-secondary btn-text"
                                          onClick={() => setExpandedHistoryInsumoId(isExpanded ? null : insumo.id)}
                                          style={{ padding: '4px 0', fontSize: '0.8rem', textDecoration: 'underline' }}
                                        >
                                          {isExpanded ? 'Ocultar Histórico' : 'Ver Histórico'}
                                        </button>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>R$</span>
                                          <input
                                            type="number"
                                            step="0.01"
                                            inputMode="decimal"
                                            className="input-field"
                                            defaultValue={insumo.preco_pago}
                                            onBlur={async (e) => {
                                              const val = parseFloat(e.target.value);
                                              if (!isNaN(val) && val > 0 && val !== insumo.preco_pago) {
                                                await updateInsumo(insumo.id, val);
                                              }
                                            }}
                                            style={{ width: '90px', padding: '8px 10px', textAlign: 'right', fontSize: '1rem', fontWeight: 700 }}
                                          />
                                          <button
                                            className="btn btn-danger"
                                            onClick={() => deleteInsumo(insumo.id)}
                                            style={{ padding: '8px', borderRadius: '8px' }}
                                            title="Excluir"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                      </div>

                                      {isExpanded && (
                                        <div className="mobile-insumo-history">
                                          <strong style={{ fontSize: '0.75rem', display: 'block', marginBottom: '4px', color: 'var(--text-muted)' }}>
                                            Preços Anteriores:
                                          </strong>
                                          {hist.length <= 1 ? (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nenhum preço registrado anteriormente.</span>
                                          ) : (
                                            hist.slice(0, 3).map((p, idx) => (
                                              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: idx < hist.slice(0, 3).length - 1 ? '1px solid var(--border)' : 'none', padding: '4px 0' }}>
                                                <span>{idx === 0 ? 'Preço Atual' : `Preço Anterior ${idx}`}</span>
                                                <strong>R$ {p.toFixed(2)}</strong>
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}

                          {/* Modal para Adicionar Novo Insumo (Otimizado para Mobile e Desktop) */}
                          {showAddInsumoModal && (
                            <div className="modal-overlay" onClick={() => setShowAddInsumoModal(false)}>
                              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Novo Insumo / Embalagem</h3>
                                  <button
                                    onClick={() => setShowAddInsumoModal(false)}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                  >
                                    <X size={20} />
                                  </button>
                                </div>
                                <form onSubmit={async (e) => {
                                  await handleCreateInsumo(e);
                                  setShowAddInsumoModal(false);
                                }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                  <div className="input-group">
                                    <label className="input-label" htmlFor="insumoNome">Nome do Insumo / Embalagem</label>
                                    <input
                                      id="insumoNome"
                                      type="text"
                                      className="input-field"
                                      placeholder="Ex: Leite Moça Lata"
                                      value={newInsumoNome}
                                      onChange={(e) => setNewInsumoNome(e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div className="input-group">
                                    <label className="input-label" htmlFor="insumoTipo">Tipo / Categoria</label>
                                    <select
                                      id="insumoTipo"
                                      className="input-field"
                                      value={newInsumoTipo}
                                      onChange={(e) => setNewInsumoTipo(e.target.value as 'ingrediente' | 'embalagem')}
                                      style={{ padding: '9px 12px' }}
                                    >
                                      <option value="ingrediente">Base de Insumos & Ingredientes</option>
                                      <option value="embalagem">Base de Embalagens e Componentes</option>
                                    </select>
                                  </div>
                                  <div className="input-group">
                                    <label className="input-label" htmlFor="insumoPreco">Preço Pago (R$)</label>
                                    <input
                                      id="insumoPreco"
                                      type="number"
                                      step="0.01"
                                      className="input-field"
                                      placeholder="0.00"
                                      value={newInsumoPreco || ''}
                                      onChange={(e) => setNewInsumoPreco(parseFloat(e.target.value) || 0)}
                                      required
                                    />
                                  </div>
                                  <div style={{ display: 'flex', gap: '12px' }}>
                                    <div className="input-group" style={{ flex: 2 }}>
                                      <label className="input-label" htmlFor="insumoQtd">Quantidade da Embalagem</label>
                                      <input
                                        id="insumoQtd"
                                        type="number"
                                        className="input-field"
                                        placeholder="Ex: 395"
                                        value={newInsumoQtd || ''}
                                        onChange={(e) => setNewInsumoQtd(parseInt(e.target.value) || 0)}
                                        required
                                      />
                                    </div>
                                    <div className="input-group" style={{ flex: 1 }}>
                                      <label className="input-label" htmlFor="insumoUnidade">Unidade</label>
                                      <select
                                        id="insumoUnidade"
                                        className="input-field"
                                        value={newInsumoUnidade}
                                        onChange={(e) => setNewInsumoUnidade(e.target.value)}
                                        style={{ padding: '9px 12px' }}
                                      >
                                        <option value="g">g</option>
                                        <option value="ml">ml</option>
                                        <option value="un">un</option>
                                      </select>
                                    </div>
                                  </div>
                                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
                                    Cadastrar Insumo
                                  </button>
                                </form>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Modal de Importação de Planilha de Insumos */}
                      {showImportModal && (
                        <div className="modal-overlay" onClick={() => !importing && setShowImportModal(false)}>
                          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '90%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Importar Planilha de Insumos</h3>
                              {!importing && (
                                <button
                                  onClick={() => setShowImportModal(false)}
                                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                >
                                  <X size={20} />
                                </button>
                              )}
                            </div>

                            {importStep === 1 && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                                  Importe seus insumos e embalagens a partir de uma planilha Excel ou arquivo CSV. O sistema tentará identificar as colunas automaticamente.
                                </p>

                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                                  <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleDownloadTemplate}
                                    style={{ padding: '8px 16px', fontSize: '0.8rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
                                  >
                                    Baixar Planilha Modelo (.xlsx)
                                  </button>
                                </div>
                                <div
                                  style={{
                                    border: '2px dashed var(--border)',
                                    borderRadius: '12px',
                                    padding: '40px 20px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: 'var(--bg)',
                                    transition: 'border-color 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px'
                                  }}
                                  onClick={() => document.getElementById('file-import-input')?.click()}
                                >
                                  <ClipboardList size={40} style={{ color: 'var(--primary)' }} />
                                  <div>
                                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>Clique para selecionar o arquivo</strong>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Formatos aceitos: .xlsx, .xls, .csv</span>
                                  </div>
                                  <input
                                    id="file-import-input"
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleImportFileUpload}
                                    style={{ display: 'none' }}
                                  />
                                </div>
                              </div>
                            )}

                            {importStep === 2 && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                  Relacione as colunas da sua planilha com os campos do sistema.
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  <div className="input-group">
                                    <label className="input-label" htmlFor="mapNome">Coluna de Nome do Insumo *</label>
                                    <select
                                      id="mapNome"
                                      className="input-field"
                                      value={mapping.nome}
                                      onChange={(e) => setMapping({ ...mapping, nome: e.target.value })}
                                      required
                                    >
                                      <option value="">Selecionar coluna...</option>
                                      {sheetColumns.map((col, idx) => (
                                        <option key={idx} value={col}>{col}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="input-group">
                                    <label className="input-label" htmlFor="mapPreco">Coluna de Preço Pago *</label>
                                    <select
                                      id="mapPreco"
                                      className="input-field"
                                      value={mapping.preco}
                                      onChange={(e) => setMapping({ ...mapping, preco: e.target.value })}
                                      required
                                    >
                                      <option value="">Selecionar coluna...</option>
                                      {sheetColumns.map((col, idx) => (
                                        <option key={idx} value={col}>{col}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div className="input-group">
                                    <label className="input-label" htmlFor="mapQtd">Coluna de Quantidade da Embalagem *</label>
                                    <select
                                      id="mapQtd"
                                      className="input-field"
                                      value={mapping.quantidade}
                                      onChange={(e) => setMapping({ ...mapping, quantidade: e.target.value })}
                                      required
                                    >
                                      <option value="">Selecionar coluna...</option>
                                      {sheetColumns.map((col, idx) => (
                                        <option key={idx} value={col}>{col}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="input-group">
                                      <label className="input-label" htmlFor="mapUnidade">Coluna de Unidade</label>
                                      <select
                                        id="mapUnidade"
                                        className="input-field"
                                        value={mapping.unidade}
                                        onChange={(e) => setMapping({ ...mapping, unidade: e.target.value })}
                                      >
                                        <option value="">Não mapear (usar padrão)</option>
                                        {sheetColumns.map((col, idx) => (
                                          <option key={idx} value={col}>{col}</option>
                                        ))}
                                      </select>
                                    </div>

                                    <div className="input-group">
                                      <label className="input-label" htmlFor="defaultUnidade">Unidade Padrão</label>
                                      <select
                                        id="defaultUnidade"
                                        className="input-field"
                                        value={defaultUnidade}
                                        onChange={(e) => setDefaultUnidade(e.target.value)}
                                      >
                                        <option value="g">g</option>
                                        <option value="ml">ml</option>
                                        <option value="un">un</option>
                                      </select>
                                    </div>
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div className="input-group">
                                      <label className="input-label" htmlFor="mapTipo">Coluna de Categoria / Tipo</label>
                                      <select
                                        id="mapTipo"
                                        className="input-field"
                                        value={mapping.tipo}
                                        onChange={(e) => setMapping({ ...mapping, tipo: e.target.value })}
                                      >
                                        <option value="">Não mapear (usar padrão)</option>
                                        {sheetColumns.map((col, idx) => (
                                          <option key={idx} value={col}>{col}</option>
                                        ))}
                                      </select>
                                    </div>

                                    <div className="input-group">
                                      <label className="input-label" htmlFor="defaultTipo">Categoria Padrão</label>
                                      <select
                                        id="defaultTipo"
                                        className="input-field"
                                        value={defaultTipo}
                                        onChange={(e) => setDefaultTipo(e.target.value)}
                                      >
                                        <option value="ingrediente">Ingrediente</option>
                                        <option value="embalagem">Embalagem</option>
                                      </select>
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                  <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                      setImportStep(1);
                                      setSheetColumns([]);
                                      setSheetData([]);
                                    }}
                                    style={{ flex: 1, padding: '12px' }}
                                  >
                                    Voltar
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={applyMappingAndPreview}
                                    style={{ flex: 1, padding: '12px' }}
                                  >
                                    Visualizar Dados
                                  </button>
                                </div>
                              </div>
                            )}

                            {importStep === 3 && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                  Verifique abaixo o preview dos dados a serem importados. Se o nome do insumo já existir, o preço atual será atualizado e um registro histórico será criado.
                                </p>

                                <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                                    <thead>
                                      <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                                        <th style={{ padding: '8px' }}>Nome</th>
                                        <th style={{ padding: '8px' }}>Preço</th>
                                        <th style={{ padding: '8px' }}>Qtd Embalagem</th>
                                        <th style={{ padding: '8px' }}>Unidade</th>
                                        <th style={{ padding: '8px' }}>Categoria</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {importPreview.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                          <td style={{ padding: '8px', fontWeight: 600 }}>{item.nome}</td>
                                          <td style={{ padding: '8px' }}>R$ {item.preco_pago.toFixed(2)}</td>
                                          <td style={{ padding: '8px' }}>{item.quantidade_embalagem}</td>
                                          <td style={{ padding: '8px' }}>{item.unidade}</td>
                                          <td style={{ padding: '8px' }}>
                                            <span className={`badge ${item.tipo === 'ingrediente' ? 'badge-success' : 'badge-neutral'}`}>
                                              {item.tipo === 'ingrediente' ? 'Ingrediente' : 'Embalagem'}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                  <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setImportStep(2)}
                                    disabled={importing}
                                    style={{ flex: 1, padding: '12px' }}
                                  >
                                    Voltar
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleExecuteImport}
                                    disabled={importing}
                                    style={{ flex: 1, padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                                  >
                                    {importing ? (
                                      <>
                                        <div style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                        <span>Importando...</span>
                                      </>
                                    ) : (
                                      <span>Confirmar Importação</span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ABA: RECEITAS & FICHA TÉCNICA */}
                      {activeTab === 'receitas' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', textAlign: 'left', alignItems: 'start' }}>
                          {/* Criar Receita */}
                          <div className="card">
                            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {editingReceitaId ? <Edit2 size={20} /> : <Plus size={20} />}
                              {editingReceitaId ? 'Editar Receita' : 'Nova Receita'}
                            </h3>
                            <form onSubmit={handleCreateReceita} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                              <div className="input-group">
                                <label className="input-label" htmlFor="recNome">Nome da Receita</label>
                                <input
                                  id="recNome"
                                  type="text"
                                  className="input-field"
                                  placeholder="Ex: Bolo de Cenoura com Chocolate"
                                  value={newReceitaNome}
                                  onChange={(e) => setNewReceitaNome(e.target.value)}
                                  required
                                />
                              </div>

                              <div style={{ display: 'flex', gap: '12px' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                  <label className="input-label" htmlFor="recRendimento">Rendimento</label>
                                  <input
                                    id="recRendimento"
                                    type="number"
                                    className="input-field"
                                    value={newReceitaRendimento || ''}
                                    onChange={(e) => setNewReceitaRendimento(parseInt(e.target.value) || 1)}
                                    min={1}
                                    required
                                  />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                  <label className="input-label" htmlFor="recPeso">Peso Total (g)</label>
                                  <input
                                    id="recPeso"
                                    type="number"
                                    className="input-field"
                                    placeholder="Opcional"
                                    value={newReceitaPeso || ''}
                                    onChange={(e) => setNewReceitaPeso(parseFloat(e.target.value) || 0)}
                                    min={0}
                                  />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                  <label className="input-label" htmlFor="recTempo">Preparo (Minutos)</label>
                                  <input
                                    id="recTempo"
                                    type="number"
                                    className="input-field"
                                    value={newReceitaTempo || ''}
                                    onChange={(e) => setNewReceitaTempo(parseInt(e.target.value) || 0)}
                                    min={0}
                                    required
                                  />
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '12px' }}>
                                <div className="input-group" style={{ flex: 1 }}>
                                  <label className="input-label" htmlFor="recMargem">Margem Alvo (%)</label>
                                  <input
                                    id="recMargem"
                                    type="number"
                                    className="input-field"
                                    value={newReceitaMargem || ''}
                                    onChange={(e) => setNewReceitaMargem(parseFloat(e.target.value) || 0)}
                                    min={0}
                                    max={99}
                                    required
                                  />
                                </div>
                                <div className="input-group" style={{ flex: 1 }}>
                                  <label className="input-label" htmlFor="recPerda">Fator de Perda (%)</label>
                                  <input
                                    id="recPerda"
                                    type="number"
                                    className="input-field"
                                    placeholder="0"
                                    value={newReceitaPerda || ''}
                                    onChange={(e) => setNewReceitaPerda(parseFloat(e.target.value) || 0)}
                                    min={0}
                                    max={100}
                                  />
                                </div>
                                <div className="input-group" style={{ flex: 1, position: 'relative' }}>
                                  <label className="input-label" htmlFor="recVenda" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Preço Sugerido (Editável)</span>
                                    {previewCalc.precoVendaIdeal > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => {

                                          setNewReceitaPrecoVenda(parseFloat(previewCalc.precoVendaIdeal.toFixed(2)));
                                        }}
                                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', padding: 0, margin: 0, lineHeight: 1 }}
                                      >
                                        Usar Ideal
                                      </button>
                                    )}
                                  </label>
                                  <input
                                    id="recVenda"
                                    type="number"
                                    step="0.01"
                                    className="input-field"
                                    placeholder="0.00"
                                    value={newReceitaPrecoVenda || ''}
                                    onChange={(e) => {
                                      setNewReceitaPrecoVenda(parseFloat(e.target.value) || 0);
                                      setIsPrecoVendaEdited(true);
                                    }}
                                    required
                                  />
                                </div>
                              </div>

                              {/* Seleção de ingredientes da receita */}
                              <div style={{ background: 'var(--bg)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>Ingredientes e Embalagens</h4>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                  <select
                                    className="input-field"
                                    value={selectedInsumoId}
                                    onChange={(e) => setSelectedInsumoId(e.target.value)}
                                    style={{ flex: 2, padding: '6px 8px', fontSize: '0.85rem' }}
                                  >
                                    <option value="">Selecionar Insumo...</option>
                                    {[...insumos]
                                      .sort((a, b) => a.nome.localeCompare(b.nome))
                                      .map(i => (
                                        <option key={i.id} value={i.id}>{i.nome} ({i.unidade})</option>
                                      ))}
                                  </select>
                                  <input
                                    type="number"
                                    className="input-field"
                                    placeholder="Qtd"
                                    value={selectedInsumoQtd || ''}
                                    onChange={(e) => setSelectedInsumoQtd(parseFloat(e.target.value) || 0)}
                                    style={{ flex: 1, padding: '6px 8px', fontSize: '0.85rem' }}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={addIngredienteToDraft}
                                    style={{ padding: '6px 12px' }}
                                  >
                                    +
                                  </button>
                                </div>

                                {newReceitaIngredientes.length === 0 ? (
                                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>Nenhum ingrediente adicionado ainda.</p>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {newReceitaIngredientes.map((draft, idx) => {
                                      const insumo = insumos.find(i => i.id === draft.insumo_id);
                                      return (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', background: 'var(--bg-card)', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                                          <span>{insumo?.nome} - {draft.quantidade} {insumo?.unidade}</span>
                                          <button
                                            type="button"
                                            onClick={() => removeIngredienteFromDraft(idx)}
                                            style={{ border: 'none', background: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                                          >
                                            <X size={14} />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Preview Financeiro */}
                              {newReceitaIngredientes.length > 0 && (
                                <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>Pré-visualização Financeira</h4>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Custo Total</span>
                                      <strong style={{ fontSize: '1.1rem' }}>R$ {previewCalc.custoTotal.toFixed(2)}</strong>
                                    </div>
                                    <div>
                                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Preço Ideal Sugerido</span>
                                      <strong style={{ fontSize: '1.1rem' }}>R$ {previewCalc.precoVendaIdeal.toFixed(2)}</strong>
                                    </div>
                                  </div>
                                  <div style={{
                                    marginTop: '8px', padding: '10px', borderRadius: '8px', borderLeft: '4px solid',
                                    borderColor: previewCalc.margemRealProjetada >= newReceitaMargem ? 'var(--success)' : (previewCalc.custoTotal < newReceitaPrecoVenda ? 'var(--warning)' : 'var(--danger)'),
                                    backgroundColor: previewCalc.margemRealProjetada >= newReceitaMargem ? 'rgba(34, 197, 94, 0.1)' : (previewCalc.custoTotal < newReceitaPrecoVenda ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)')
                                  }}>
                                    {previewCalc.margemRealProjetada >= newReceitaMargem ? (
                                      <>
                                        <strong style={{ display: 'block', color: 'var(--success)', fontSize: '0.85rem' }}>Margem Segura</strong>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lucro Projetado: {previewCalc.margemRealProjetada.toFixed(1)}%</span>
                                      </>
                                    ) : previewCalc.custoTotal < newReceitaPrecoVenda ? (
                                      <>
                                        <strong style={{ display: 'block', color: 'var(--warning)', fontSize: '0.85rem' }}>Requer Ajustes</strong>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Margem de {previewCalc.margemRealProjetada.toFixed(1)}% (Abaixo do alvo de {newReceitaMargem}%)</span>
                                      </>
                                    ) : (
                                      <>
                                        <strong style={{ display: 'block', color: 'var(--danger)', fontSize: '0.85rem' }}>Alerta de Prejuízo</strong>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>O preço praticado não cobre nem os custos da receita.</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}

                              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
                                {editingReceitaId ? 'Salvar Alterações' : 'Salvar Receita'}
                              </button>
                              {editingReceitaId && (
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={() => {
                                    setEditingReceitaId(null);
                                    setNewReceitaNome('');
                                    setNewReceitaRendimento(1);
                                    setNewReceitaTempo(30);
                                    setNewReceitaMargem(30);
                                    setNewReceitaPrecoVenda(0);
                                    setIsPrecoVendaEdited(false);

                                    setNewReceitaPerda(0);
                                    setNewReceitaPeso(0);
                                    setNewReceitaIngredientes([]);
                                  }}
                                  style={{ width: '100%', padding: '12px', marginTop: '8px', color: 'var(--text-muted)' }}
                                >
                                  Cancelar Edição
                                </button>
                              )}
                            </form>
                          </div>

                          {/* Listagem de Receitas */}
                          <div className="card">
                            <h3 style={{ marginBottom: '16px' }}>Minhas Receitas & Fichas Técnicas</h3>
                            {receitas.length === 0 ? (
                              <p style={{ color: 'var(--text-muted)' }}>Nenhuma receita salva.</p>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {receitas.map(rec => {
                                  const calc = getCalculosReceita(rec);
                                  return (
                                    <div key={rec.id} style={{ padding: '18px', background: 'var(--bg)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div>
                                          <h4 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{rec.nome}</h4>
                                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Rendimento: {rec.rendimento} porções {rec.rendimento_peso && rec.rendimento_peso > 0 ? `(${rec.rendimento_peso} g)` : ''} | Tempo de preparo: {rec.tempo_preparo} min
                                          </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>

                                          <button
                                            className="btn btn-secondary"
                                            onClick={() => {
                                              setEditingReceitaId(rec.id);
                                              setNewReceitaNome(rec.nome);
                                              setNewReceitaRendimento(rec.rendimento);
                                              setNewReceitaTempo(rec.tempo_preparo);
                                              setNewReceitaMargem(rec.margem_alvo);
                                              setNewReceitaPrecoVenda(rec.preco_venda_praticado);
                                              setIsPrecoVendaEdited(true);

                                              setNewReceitaPerda(rec.fator_perda || 0);
                                              setNewReceitaPeso(rec.rendimento_peso || 0);
                                              setNewReceitaIngredientes(rec.ingredientes.map(ing => ({
                                                insumo_id: ing.insumo_id,
                                                quantidade: ing.quantidade
                                              })));
                                              window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            style={{ padding: '6px', borderRadius: '8px', color: 'var(--primary)', borderColor: 'rgba(168, 85, 247, 0.2)' }}
                                            title="Editar Receita"
                                          >
                                            <Edit2 size={16} />
                                          </button>
                                          <button
                                            className="btn btn-danger"
                                            onClick={() => {
                                              if (editingReceitaId === rec.id) {
                                                setEditingReceitaId(null);
                                                setNewReceitaNome('');
                                                setNewReceitaRendimento(1);
                                                setNewReceitaTempo(30);
                                                setNewReceitaMargem(30);
                                                setNewReceitaPrecoVenda(0);
                                                setIsPrecoVendaEdited(false);

                                                setNewReceitaPerda(0);
                                                setNewReceitaPeso(0);
                                                setNewReceitaIngredientes([]);
                                              }
                                              deleteReceita(rec.id);
                                            }}
                                            style={{ padding: '6px', borderRadius: '8px' }}
                                            title="Excluir Receita"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                      </div>

                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', padding: '12px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', alignItems: 'start' }}>
                                        <div>
                                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Custo Total Receita</span>
                                          <strong style={{ fontSize: '0.95rem' }}>R$ {calc.custoTotal.toFixed(2)}</strong>
                                        </div>
                                        <div>
                                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Custo Unitário / Peso</span>
                                          <strong style={{ fontSize: '0.95rem', display: 'block' }}>R$ {calc.custoUnitario.toFixed(2)} / un</strong>
                                          {rec.rendimento_peso && rec.rendimento_peso > 0 ? (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                              R$ {calc.custoPorCemGramas.toFixed(2)} / 100g <br /> (R$ {calc.custoPorQuilo.toFixed(2)} / kg)
                                            </span>
                                          ) : null}
                                        </div>
                                        <div>
                                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Preço Venda Ideal</span>
                                          <strong style={{ fontSize: '0.95rem', color: 'var(--primary)', display: 'block' }}>R$ {calc.precoVendaIdealUnitario.toFixed(2)} / un</strong>
                                          {rec.rendimento_peso && rec.rendimento_peso > 0 ? (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'block', opacity: 0.8, marginTop: '4px' }}>
                                              R$ {calc.precoVendaIdealPorCemGramas.toFixed(2)} / 100g <br /> (R$ {calc.precoVendaIdealPorQuilo.toFixed(2)} / kg)
                                            </span>
                                          ) : null}
                                        </div>
                                        <div>
                                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Margem Real</span>
                                          <strong style={{ fontSize: '0.95rem', color: calc.margemRealProjetada >= rec.margem_alvo ? 'var(--success)' : 'var(--danger)', display: 'block' }}>
                                            {calc.margemRealProjetada.toFixed(1)}%
                                          </strong>
                                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                                            Total Sugerido: R$ {calc.precoVendaIdeal.toFixed(2)}
                                          </span>
                                        </div>
                                      </div>

                                      <details style={{ marginTop: '12px', fontSize: '0.8rem' }}>
                                        <summary style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}>Ver Ficha Técnica Detalhada</summary>
                                        <div style={{ padding: '8px 4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                          {calc.percentualImpacto !== 0 && (
                                            <div style={{
                                              padding: '10px 14px',
                                              borderRadius: '12px',
                                              fontSize: '0.825rem',
                                              fontWeight: 600,
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '8px',
                                              background: calc.percentualImpacto > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                              border: calc.percentualImpacto > 0 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(34, 197, 94, 0.2)',
                                              color: calc.percentualImpacto > 0 ? 'var(--danger)' : 'var(--success)'
                                            }}>
                                              <TrendingUp size={16} />
                                              <span>
                                                {calc.percentualImpacto > 0
                                                  ? `Atenção: Os novos preços dos insumos aumentaram o custo total desta receita em ${calc.percentualImpacto.toFixed(1)}% desde a última compra.`
                                                  : `Excelente: A redução nos preços dos insumos diminuiu o custo total desta receita em ${Math.abs(calc.percentualImpacto).toFixed(1)}% desde a última compra.`
                                                }
                                              </span>
                                            </div>
                                          )}
                                          <div>
                                            <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--text)' }}>
                                              Ingredientes Utilizados {rec.fator_perda && rec.fator_perda > 0 ? `(com ${rec.fator_perda}% de perda)` : ''}
                                            </strong>
                                            <ul style={{ paddingLeft: '16px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', margin: 0 }}>
                                              {rec.ingredientes
                                                .filter(ing => {
                                                  const insumo = insumos.find(ins => ins.id === ing.insumo_id);
                                                  return !insumo || insumo.tipo === 'ingrediente';
                                                })
                                                .map((ing, i) => {
                                                  const insumo = insumos.find(ins => ins.id === ing.insumo_id);
                                                  const custoIng = insumo ? (insumo.preco_pago / insumo.quantidade_embalagem) * ing.quantidade * (1 + (rec.fator_perda || 0) / 100) : 0;
                                                  return (
                                                    <li key={i}>
                                                      {insumo?.nome}: {ing.quantidade} {insumo?.unidade} (Custo: R$ {custoIng.toFixed(2)})
                                                    </li>
                                                  );
                                                })}
                                              {rec.ingredientes.filter(ing => {
                                                const insumo = insumos.find(ins => ins.id === ing.insumo_id);
                                                return !insumo || insumo.tipo === 'ingrediente';
                                              }).length === 0 && (
                                                  <li style={{ listStyleType: 'none', marginLeft: '-16px', color: 'var(--text-muted)' }}>Nenhum ingrediente utilizado.</li>
                                                )}
                                            </ul>
                                            {calc.custoIngredientes > 0 && (
                                              <div style={{ marginTop: '6px', fontWeight: 600, color: 'var(--text)' }}>
                                                Subtotal Ingredientes: R$ {calc.custoIngredientes.toFixed(2)}
                                              </div>
                                            )}
                                          </div>

                                          <div>
                                            <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--text)' }}>Embalagens & Componentes</strong>
                                            <ul style={{ paddingLeft: '16px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', margin: 0 }}>
                                              {rec.ingredientes
                                                .filter(ing => {
                                                  const insumo = insumos.find(ins => ins.id === ing.insumo_id);
                                                  return insumo && insumo.tipo === 'embalagem';
                                                })
                                                .map((ing, i) => {
                                                  const insumo = insumos.find(ins => ins.id === ing.insumo_id);
                                                  const custoIng = insumo ? (insumo.preco_pago / insumo.quantidade_embalagem) * ing.quantidade : 0;
                                                  return (
                                                    <li key={i}>
                                                      {insumo?.nome}: {ing.quantidade} {insumo?.unidade} (Custo: R$ {custoIng.toFixed(2)})
                                                    </li>
                                                  );
                                                })}
                                              {rec.ingredientes.filter(ing => {
                                                const insumo = insumos.find(ins => ins.id === ing.insumo_id);
                                                return insumo && insumo.tipo === 'embalagem';
                                              }).length === 0 && (
                                                  <li style={{ listStyleType: 'none', marginLeft: '-16px', color: 'var(--text-muted)' }}>Nenhuma embalagem ou componente utilizado.</li>
                                                )}
                                            </ul>
                                            {calc.custoEmbalagens > 0 && (
                                              <div style={{ marginTop: '6px', fontWeight: 600, color: 'var(--text)' }}>
                                                Subtotal Embalagens: R$ {calc.custoEmbalagens.toFixed(2)}
                                              </div>
                                            )}
                                          </div>

                                          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                                            <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--text)' }}>Custos Operacionais Rateados</strong>
                                            <ul style={{ paddingLeft: '16px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', margin: 0 }}>
                                              <li>Mão de obra rateada (tempo): R$ {calc.custoTempoMaoDeObra.toFixed(2)}</li>
                                              <li>Custos fixos rateados (tempo): R$ {calc.custoTempoCustoFixo.toFixed(2)}</li>
                                            </ul>
                                            <div style={{ marginTop: '6px', fontWeight: 600, color: 'var(--text)' }}>
                                              Subtotal Operacional: R$ {(calc.custoTempoMaoDeObra + calc.custoTempoCustoFixo).toFixed(2)}
                                            </div>
                                          </div>

                                          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                                            <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--text)' }}>Simulador de Ganhos e Metas Mensais</strong>

                                            {/* Ponto de equilíbrio */}
                                            <div style={{ background: 'var(--bg)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '10px', fontSize: '0.775rem' }}>
                                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span>Meta Faturamento Mensal Mínimo (Salário + Custos Fixos):</span>
                                                <strong style={{ color: 'var(--primary)' }}>R$ {calc.metaMensal.toFixed(2)}</strong>
                                              </div>

                                              {calc.margemContribuicaoUnitaria > 0 ? (
                                                <>
                                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <span>Margem de Contribuição por unidade:</span>
                                                    <strong>R$ {calc.margemContribuicaoUnitaria.toFixed(2)} / un</strong>
                                                  </div>
                                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>Vendas necessárias para atingir a meta:</span>
                                                    <strong style={{ color: 'var(--success)' }}>
                                                      {Math.ceil(calc.pontoEquilibrioUnidades)} un ({Math.ceil(calc.pontoEquilibrioReceitas)} receitas completas)
                                                    </strong>
                                                  </div>
                                                </>
                                              ) : (
                                                <div style={{ color: 'var(--danger)', fontWeight: 600, marginTop: '4px' }}>
                                                  Atenção: O preço praticado não cobre nem o custo variável dos insumos (ingredientes + embalagens). Aumente o preço para conseguir pagar suas contas.
                                                </div>
                                              )}
                                            </div>

                                            {/* Simulador Interativo */}
                                            {calc.margemContribuicaoUnitaria > 0 && (
                                              <div style={{ padding: '4px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Simular Vendas Mensais:</span>
                                                  <input
                                                    type="number"
                                                    className="input-field"
                                                    style={{ width: '90px', padding: '4px 8px', fontSize: '0.85rem' }}
                                                    min={1}
                                                    value={simulacaoQuantidades[rec.id] !== undefined ? simulacaoQuantidades[rec.id] : Math.ceil(calc.pontoEquilibrioUnidades)}
                                                    onChange={(e) => setSimulacaoQuantidades({
                                                      ...simulacaoQuantidades,
                                                      [rec.id]: Math.max(0, parseInt(e.target.value) || 0)
                                                    })}
                                                  />
                                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>unidades</span>
                                                </div>

                                                {/* Resultados da simulação */}
                                                {(() => {
                                                  const qtd = simulacaoQuantidades[rec.id] !== undefined ? simulacaoQuantidades[rec.id] : Math.ceil(calc.pontoEquilibrioUnidades);
                                                  const faturamentoEstimado = qtd * calc.precoPraticadoUnitario;
                                                  const custoInsumosEstimado = qtd * calc.custoVariavelUnitario;
                                                  const lucroRealEstimado = (qtd * calc.margemContribuicaoUnitaria) - calc.metaMensal;

                                                  return (
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px', background: 'var(--bg)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                      <div>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Faturamento Estimado</span>
                                                        <strong style={{ fontSize: '0.85rem' }}>R$ {faturamentoEstimado.toFixed(2)}</strong>
                                                      </div>
                                                      <div>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Custo Variável Total</span>
                                                        <strong style={{ fontSize: '0.85rem' }}>R$ {custoInsumosEstimado.toFixed(2)}</strong>
                                                      </div>
                                                      <div>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Resultado Operacional</span>
                                                        <strong style={{ fontSize: '0.85rem', color: lucroRealEstimado >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                                          {lucroRealEstimado >= 0 ? 'Lucro: ' : 'Prejuízo: '} R$ {Math.abs(lucroRealEstimado).toFixed(2)}
                                                        </strong>
                                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                                                          {lucroRealEstimado >= 0 ? '(além de pagar o pró-labore)' : '(déficit para pagar pro-labore + custos)'}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  );
                                                })()}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </details>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {/* ABA: KITS E COMBOS */}
                      {activeTab === 'kits' && (
                        <Kits
                          userId={user.id}
                          kits={kits}
                          receitas={receitas}
                          insumos={insumos}
                          addKit={addKit}
                          updateKit={updateKit}
                          deleteKit={deleteKit}
                          getCalculosKit={getCalculosKit}
                        />
                      )}

                      {/* ABA: CUSTOS E OPERAÇÃO (Diferencial de Custos Detalhados) */}
                      {activeTab === 'config' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '32px', textAlign: 'left', alignItems: 'start' }}>

                          {/* Coluna Esquerda: Parâmetros do Trabalho e LGPD */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                            {/* Configurações Financeiras */}
                            <div className="card">
                              <h3 style={{ marginBottom: '16px' }}>Configurações Operacionais</h3>
                              <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div className="input-group">
                                  <label className="input-label" htmlFor="cfgSalario">Pró-labore (Salário Desejado R$)</label>
                                  <div style={{ position: 'relative' }}>
                                    <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                                    <input
                                      id="cfgSalario"
                                      type="number"
                                      className="input-field"
                                      value={profile?.salario_desejado || 0}
                                      onChange={(e) => profile && updateProfile(parseFloat(e.target.value) || 0, profile.dias_trabalhados, profile.horas_trabalhadas, profile.custos_fixos)}
                                      style={{ paddingLeft: '32px' }}
                                      required
                                    />
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                  <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label" htmlFor="cfgDias">Dias Trab. / Mês</label>
                                    <div style={{ position: 'relative' }}>
                                      <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                                      <input
                                        id="cfgDias"
                                        type="number"
                                        className="input-field"
                                        value={profile?.dias_trabalhados || 0}
                                        onChange={(e) => profile && updateProfile(profile.salario_desejado, parseInt(e.target.value) || 0, profile.horas_trabalhadas, profile.custos_fixos)}
                                        style={{ paddingLeft: '32px' }}
                                        required
                                      />
                                    </div>
                                  </div>
                                  <div className="input-group" style={{ flex: 1 }}>
                                    <label className="input-label" htmlFor="cfgHoras">Horas Trab. / Dia</label>
                                    <div style={{ position: 'relative' }}>
                                      <Clock size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                                      <input
                                        id="cfgHoras"
                                        type="number"
                                        className="input-field"
                                        value={profile?.horas_trabalhadas || 0}
                                        onChange={(e) => profile && updateProfile(profile.salario_desejado, profile.dias_trabalhados, parseInt(e.target.value) || 0, profile.custos_fixos)}
                                        style={{ paddingLeft: '32px' }}
                                        required
                                      />
                                    </div>
                                  </div>
                                </div>
                              </form>
                            </div>

                            {/* GDPR Dashboard (LGPD) */}
                            <GDPRDashboard userId={user.id} onAccountDeleted={handleAccountDeleted} />
                          </div>

                          {/* Coluna Direita: Detalhamento de Custos Fixos */}
                          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Custos Fixos Mensais</h3>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowAddCustoModal(true)}
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              >
                                <Plus size={14} /> Adicionar Custo
                              </button>
                            </div>

                            {/* Lista de Itens de Custo Fixo */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                              {custosItens.map(item => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '8px' }}>
                                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.nome}</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>R$</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      className="input-field"
                                      defaultValue={item.valor}
                                      onBlur={async (e) => {
                                        const val = parseFloat(e.target.value);
                                        if (!isNaN(val) && val >= 0 && val !== item.valor) {
                                          await updateCustoItem(item.id, val);
                                        }
                                      }}
                                      style={{ width: '80px', padding: '6px 8px', textAlign: 'right', display: 'inline-block', fontSize: '0.9rem', fontWeight: 600 }}
                                    />
                                    <button
                                      type="button"
                                      className="btn btn-secondary"
                                      onClick={() => deleteCustoItem(item.id)}
                                      style={{ padding: '6px', border: 'none', background: 'transparent', color: 'var(--danger)', display: 'flex' }}
                                      title="Remover custo"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Card Totalizador consolidado */}
                            <div style={{ background: 'var(--primary-light)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.2)', textAlign: 'center' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Soma dos Custos Fixos Mensais</span>
                              <strong style={{ fontSize: '1.6rem', color: 'var(--primary)' }}>
                                R$ {custosItens.reduce((sum, item) => sum + item.valor, 0).toFixed(2)}
                              </strong>
                              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Custo Fixo por Hora: R$ {
                                  (
                                    ((profile?.dias_trabalhados || 22) * (profile?.horas_trabalhadas || 8)) > 0
                                      ? custosItens.reduce((sum, item) => sum + item.valor, 0) / ((profile?.dias_trabalhados || 22) * (profile?.horas_trabalhadas || 8))
                                      : 0
                                  ).toFixed(2)
                                }/hora
                              </div>
                            </div>
                          </div>

                          {/* Modal para Adicionar Novo Item de Custo Fixo */}
                          {showAddCustoModal && (
                            <div className="modal-overlay" onClick={() => setShowAddCustoModal(false)}>
                              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Novo Item de Custo Fixo</h3>
                                  <button
                                    onClick={() => setShowAddCustoModal(false)}
                                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                  >
                                    <X size={20} />
                                  </button>
                                </div>
                                <form onSubmit={async (e) => {
                                  e.preventDefault();
                                  if (newCustoNome.trim() && newCustoValor >= 0) {
                                    await addCustoItem(newCustoNome.trim(), newCustoValor);
                                    setNewCustoNome('');
                                    setNewCustoValor(0);
                                    setShowAddCustoModal(false);
                                  }
                                }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                  <div className="input-group">
                                    <label className="input-label" htmlFor="custoNome">Nome do Custo</label>
                                    <input
                                      id="custoNome"
                                      type="text"
                                      className="input-field"
                                      placeholder="Ex: Taxa do MEI"
                                      value={newCustoNome}
                                      onChange={(e) => setNewCustoNome(e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div className="input-group">
                                    <label className="input-label" htmlFor="custoValor">Valor Mensal (R$)</label>
                                    <input
                                      id="custoValor"
                                      type="number"
                                      step="0.01"
                                      className="input-field"
                                      placeholder="0.00"
                                      value={newCustoValor || ''}
                                      onChange={(e) => setNewCustoValor(parseFloat(e.target.value) || 0)}
                                      required
                                    />
                                  </div>
                                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
                                    Adicionar Custo
                                  </button>
                                </form>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )) : (
              <LandingPage />
            )
          } />
        </Routes>

        {/* Modal de Registro de Compra / Adicionar Preço */}
        {showCompraModal && (
          <div className="modal-overlay" onClick={() => setShowCompraModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Adicionar Preço</h3>
                <button
                  onClick={() => setShowCompraModal(false)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                await registrarCompraInsumo(compraInsumoId, compraEmbalagens, compraPreco);
                setShowCompraModal(false);
              }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="input-group">
                  <label className="input-label" htmlFor="compraQtd">Quantidade de Embalagens Compradas</label>
                  <input
                    id="compraQtd"
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={compraEmbalagens}
                    onChange={(e) => setCompraEmbalagens(parseFloat(e.target.value) || 1)}
                    min={0.01}
                    required
                  />
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="compraPreco">Preço Pago (Total) R$</label>
                  <input
                    id="compraPreco"
                    type="number"
                    step="0.01"
                    className="input-field"
                    value={compraPreco}
                    onChange={(e) => setCompraPreco(parseFloat(e.target.value) || 0)}
                    required
                  />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Se o preço for diferente do atual, o sistema registrará no histórico e atualizará os custos.
                  </p>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
                  Salvar Preço
                </button>
              </form>
            </div>
          </div>
        )}



      </main>

      {(user || window.location.pathname !== '/') && (
        <footer style={{
          borderTop: '1px solid var(--border)',
          padding: '24px 0',
          background: 'var(--bg-card)',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginTop: 'auto'
        }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <span>© {new Date().getFullYear()} Precifica+. Todos os direitos reservados.</span>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link to="/privacidade" style={{ textDecoration: 'underline' }}>Política de Privacidade</Link>
              <Link to="/termos" style={{ textDecoration: 'underline' }}>Termos de Serviço</Link>
            </div>
          </div>
        </footer>
      )}

      {/* Banner de consentimento da LGPD */}
      <PrivacyBanner />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
