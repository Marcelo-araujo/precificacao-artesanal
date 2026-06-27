import { useState } from 'react';
import type { Kit, KitItem, Receita, Insumo } from '../hooks/useData';
import { ArrowLeft, Save, Plus, Trash2, Calculator, Info, Package, AlertCircle } from 'lucide-react';

interface KitFormProps {
  userId: string | null;
  receitas: Receita[];
  insumos: Insumo[];
  initialKit?: Kit | null;
  onSave: (nome: string, itens: KitItem[], preco_venda_praticado: number) => Promise<void>;
  onCancel: () => void;
  getCalculosKit: (kit: Kit) => { custoTotal: number; precoSugerido: number; lucro: number; margemReal: number };
}

export function KitForm({ userId, receitas, insumos, initialKit, onSave, onCancel, getCalculosKit }: KitFormProps) {
  const [nome, setNome] = useState(initialKit?.nome || '');
  const [precoVenda, setPrecoVenda] = useState(initialKit?.preco_venda_praticado || 0);
  const [itens, setItens] = useState<KitItem[]>(initialKit?.itens || []);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Dropdown states for adding new items
  const [selectedItemType, setSelectedItemType] = useState<'receita' | 'insumo'>('receita');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItemQtd, setSelectedItemQtd] = useState(1);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleAddItem = () => {
    if (!selectedItemId) {
      setError('Selecione um item para adicionar ao kit.');
      return;
    }
    if (selectedItemQtd <= 0) {
      setError('A quantidade deve ser maior que zero.');
      return;
    }

    setItens([...itens, { tipo: selectedItemType, item_id: selectedItemId, quantidade: selectedItemQtd }]);
    setSelectedItemId('');
    setSelectedItemQtd(1);
    setError('');
  };

  const handleRemoveItem = (index: number) => {
    const newItens = [...itens];
    newItens.splice(index, 1);
    setItens(newItens);
  };

  const handleUpdateItemQtd = (index: number, qtd: number) => {
    if (qtd <= 0) return;
    const newItens = [...itens];
    newItens[index].quantidade = qtd;
    setItens(newItens);
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      setError('Dê um nome para o seu kit.');
      return;
    }
    if (itens.length === 0) {
      setError('Adicione pelo menos um item ao kit.');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(nome, itens, precoVenda);
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar kit.');
    } finally {
      setIsSaving(false);
    }
  };

  // Real-time calculation object for the preview sidebar
  const tempKit: Kit = {
    id: initialKit?.id || 'temp',
    user_id: userId || 'temp',
    nome,
    itens,
    preco_venda_praticado: precoVenda
  };
  
  const calculos = getCalculosKit(tempKit);
  const isLucro = calculos.lucro > 0;

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onCancel}
          className="p-2 hover:bg-white rounded-xl transition-colors text-slate-500 hover:text-slate-800 hover:shadow-sm"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {initialKit ? 'Editar Kit' : 'Novo Kit'}
          </h2>
          <p className="text-slate-500 text-sm mt-1">Monte seu combo de produtos</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 border border-red-100">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Package size={20} className="text-indigo-600" />
              Informações Gerais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nome do Kit</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Combo Festa 100 Pessoas"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Preço de Venda Praticado (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={precoVenda}
                  onChange={(e) => setPrecoVenda(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-medium text-indigo-700"
                />
              </div>
            </div>
          </div>

          {/* Adicionar Itens */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-indigo-600" />
              Itens do Kit
            </h3>

            <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
              <div className="w-full md:w-1/4">
                <label className="block text-xs font-medium text-slate-500 mb-1">Tipo de Item</label>
                <select
                  value={selectedItemType}
                  onChange={(e) => {
                    setSelectedItemType(e.target.value as 'receita' | 'insumo');
                    setSelectedItemId('');
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none"
                >
                  <option value="receita">Receita Pronta</option>
                  <option value="insumo">Insumo / Embalagem</option>
                </select>
              </div>

              <div className="w-full md:w-2/4">
                <label className="block text-xs font-medium text-slate-500 mb-1">Item</label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none"
                >
                  <option value="">Selecione um item...</option>
                  {selectedItemType === 'receita'
                    ? receitas.map(r => (
                        <option key={r.id} value={r.id}>{r.nome}</option>
                      ))
                    : insumos.map(i => (
                        <option key={i.id} value={i.id}>{i.nome}</option>
                      ))
                  }
                </select>
              </div>

              <div className="w-full md:w-1/4">
                <label className="block text-xs font-medium text-slate-500 mb-1">Quantidade</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={selectedItemQtd}
                    onChange={(e) => setSelectedItemQtd(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de Itens Adicionados */}
            {itens.length > 0 ? (
              <div className="space-y-3">
                {itens.map((item, index) => {
                  const nome = item.tipo === 'receita' 
                    ? receitas.find(r => r.id === item.item_id)?.nome 
                    : insumos.find(i => i.id === item.item_id)?.nome;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${item.tipo === 'receita' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{nome || 'Item não encontrado'}</p>
                          <p className="text-xs text-slate-500 uppercase">{item.tipo}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-600">Qtd:</span>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={item.quantidade}
                            onChange={(e) => handleUpdateItemQtd(index, parseFloat(e.target.value) || 1)}
                            className="w-20 px-2 py-1 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 outline-none text-center"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <Package className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-slate-500 text-sm">Nenhum item adicionado ao kit ainda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 rounded-2xl p-6 text-white sticky top-6 shadow-xl">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <Calculator size={20} className="text-indigo-400" />
              Resumo do Kit
            </h3>

            <div className="space-y-6">
              <div>
                <p className="text-slate-400 text-sm mb-1">Custo Total</p>
                <p className="text-2xl font-bold">{formatCurrency(calculos.custoTotal)}</p>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <p className="text-slate-400 text-sm mb-1 flex items-center gap-1" title="Soma do preço ideal de cada receita + custo das embalagens avulsas.">
                  Preço Sugerido (Soma Ideal)
                  <Info size={14} className="text-slate-500 cursor-help" />
                </p>
                <p className="text-xl font-medium text-slate-200">{formatCurrency(calculos.precoSugerido)}</p>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <p className="text-slate-400 text-sm mb-1">Preço Praticado</p>
                <p className="text-2xl font-bold text-indigo-400">{formatCurrency(precoVenda)}</p>
              </div>

              <div className={`p-4 rounded-xl ${isLucro ? 'bg-emerald-900/40 border border-emerald-800/50' : 'bg-red-900/40 border border-red-800/50'}`}>
                <p className={`text-sm mb-1 ${isLucro ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isLucro ? 'Lucro Estimado' : 'Prejuízo Estimado'}
                </p>
                <p className={`text-xl font-bold ${isLucro ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(calculos.lucro)}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Margem: <span className="font-semibold text-white">{calculos.margemReal.toFixed(1)}%</span>
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-900/20"
              >
                <Save size={20} />
                {isSaving ? 'Salvando...' : 'Salvar Kit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
