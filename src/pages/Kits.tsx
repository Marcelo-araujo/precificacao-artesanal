import { useState } from 'react';
import { Package, Plus, Edit2, Trash2, Calculator, DollarSign, PackageSearch, HelpCircle, X, Gift, PartyPopper, Utensils } from 'lucide-react';
import type { Kit, KitItem, Receita, Insumo } from '../hooks/useData';
import { KitForm } from './KitForm';

interface KitsProps {
  userId: string | null;
  kits: Kit[];
  receitas: Receita[];
  insumos: Insumo[];
  addKit: (nome: string, itens: KitItem[], preco_venda_praticado: number) => Promise<void>;
  updateKit: (id: string, nome: string, itens: KitItem[], preco_venda_praticado: number) => Promise<void>;
  deleteKit: (id: string) => Promise<void>;
  getCalculosKit: (kit: Kit) => { custoTotal: number; precoSugerido: number; lucro: number; margemReal: number };
}

export function Kits({ userId, kits, receitas, insumos, addKit, updateKit, deleteKit, getCalculosKit }: KitsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<Kit | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const handleOpenForm = (kit?: Kit) => {
    setEditingKit(kit || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingKit(null);
    setIsFormOpen(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const openExampleKit = (nome: string, type: 'festa' | 'degustacao' | 'presente') => {
    const exampleItem: KitItem[] = receitas.length > 0 
      ? [{ item_id: receitas[0].id, quantidade: type === 'festa' ? 5 : 1, tipo: 'receita' }] 
      : [];
    
    handleOpenForm({
      id: 'example',
      user_id: userId || '',
      nome,
      itens: exampleItem,
      preco_venda_praticado: type === 'festa' ? 250 : type === 'degustacao' ? 45 : 85
    });
  };

  if (isFormOpen) {
    return (
      <KitForm
        userId={userId}
        receitas={receitas}
        insumos={insumos}
        initialKit={editingKit}
        onSave={async (nome, itens, preco) => {
          if (editingKit && editingKit.id !== 'example') {
            await updateKit(editingKit.id, nome, itens, preco);
          } else {
            await addKit(nome, itens, preco);
          }
          handleCloseForm();
        }}
        onCancel={handleCloseForm}
        getCalculosKit={getCalculosKit}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="text-indigo-600" size={28} />
            Kits e Combos
          </h2>
          <p className="text-slate-500 mt-1">Crie e gerencie pacotes de produtos para venda</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-100 transition-all flex items-center gap-2"
          >
            <HelpCircle size={20} />
            Como funciona?
          </button>
          <button
            onClick={() => handleOpenForm()}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <Plus size={20} />
            Novo Kit
          </button>
        </div>
      </div>

      {kits.length === 0 ? (
        <div className="space-y-8 mt-4">
          <div className="text-center max-w-2xl mx-auto py-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Nenhum kit criado</h3>
            <p className="text-slate-600 text-lg">
              Oferecer combos é a melhor forma de aumentar seu faturamento médio. Que tal começar se inspirando nas ideias abaixo?
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card Kit Festa */}
            <div 
              onClick={() => openExampleKit('Kit Festa 50 Pessoas', 'festa')}
              className="bg-white border-2 border-indigo-100 rounded-2xl p-6 cursor-pointer hover:border-indigo-400 hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <PartyPopper className="text-indigo-500 w-12 h-12 mb-4 relative z-10" />
              <h4 className="text-xl font-bold text-slate-800 mb-2 relative z-10">Kit Festa</h4>
              <p className="text-slate-500 text-sm mb-4 relative z-10">Ideal para aniversários. Junte bolos, docinhos e salgados em um pacote atraente.</p>
              <span className="text-indigo-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Criar este kit &rarr;
              </span>
            </div>

            {/* Card Combo Degustação */}
            <div 
              onClick={() => openExampleKit('Combo Degustação', 'degustacao')}
              className="bg-white border-2 border-emerald-100 rounded-2xl p-6 cursor-pointer hover:border-emerald-400 hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <Utensils className="text-emerald-500 w-12 h-12 mb-4 relative z-10" />
              <h4 className="text-xl font-bold text-slate-800 mb-2 relative z-10">Combo Degustação</h4>
              <p className="text-slate-500 text-sm mb-4 relative z-10">Perfeito para noivas ou novos clientes. Várias pequenas porções para provarem seu cardápio.</p>
              <span className="text-emerald-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Criar este kit &rarr;
              </span>
            </div>

            {/* Card Kit Presente */}
            <div 
              onClick={() => openExampleKit('Kit Presente Especial', 'presente')}
              className="bg-white border-2 border-rose-100 rounded-2xl p-6 cursor-pointer hover:border-rose-400 hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
              <Gift className="text-rose-500 w-12 h-12 mb-4 relative z-10" />
              <h4 className="text-xl font-bold text-slate-800 mb-2 relative z-10">Kit Presente</h4>
              <p className="text-slate-500 text-sm mb-4 relative z-10">Datas comemorativas vendem muito. Monte uma caixa bonita com seus melhores produtos.</p>
              <span className="text-rose-600 font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                Criar este kit &rarr;
              </span>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <button
              onClick={() => handleOpenForm()}
              className="text-slate-500 font-medium hover:text-indigo-600 hover:underline"
            >
              Ou comece um kit do zero
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kits.map((kit) => {
            const calculos = getCalculosKit(kit);
            const isLucro = calculos.lucro > 0;
            
            return (
              <div key={kit.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-slate-800 line-clamp-1">{kit.nome}</h3>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenForm(kit)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Editar Kit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => {
                          if(window.confirm('Tem certeza que deseja excluir este kit?')) {
                            deleteKit(kit.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir Kit"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                          <Calculator size={14} className="text-slate-400"/>
                          Custo Total
                        </span>
                        <span className="font-semibold text-slate-800">
                          {formatCurrency(calculos.custoTotal)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                          <DollarSign size={14} className="text-slate-400"/>
                          Preço Praticado
                        </span>
                        <span className="font-bold text-indigo-600 text-lg">
                          {formatCurrency(kit.preco_venda_praticado)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-3 rounded-xl border ${isLucro ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                        <div className={`text-xs font-medium mb-1 ${isLucro ? 'text-emerald-600' : 'text-red-600'}`}>
                          {isLucro ? 'Lucro' : 'Prejuízo'}
                        </div>
                        <div className={`font-bold ${isLucro ? 'text-emerald-700' : 'text-red-700'}`}>
                          {formatCurrency(calculos.lucro)}
                        </div>
                      </div>
                      
                      <div className={`p-3 rounded-xl border ${calculos.margemReal >= 20 ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                        <div className="text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                          Margem Real
                        </div>
                        <div className={`font-bold ${calculos.margemReal >= 20 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {calculos.margemReal.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Composição do Kit</h4>
                    <ul className="space-y-2">
                      {kit.itens.slice(0, 3).map((item, idx) => {
                        const nome = item.tipo === 'receita' 
                          ? receitas.find(r => r.id === item.item_id)?.nome 
                          : insumos.find(i => i.id === item.item_id)?.nome;
                        return (
                          <li key={idx} className="text-sm text-slate-600 flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                            <span className="truncate pr-2">
                              {item.unidade_medida === 'peso' ? `${item.quantidade}g ` : 
                               item.unidade_medida === 'porcao' ? `${item.quantidade}un ` : 
                               `${item.quantidade}x `}
                              {nome || 'Item não encontrado'}
                            </span>
                          </li>
                        );
                      })}
                      {kit.itens.length > 3 && (
                        <li className="text-xs font-medium text-indigo-600 text-center py-1">
                          + {kit.itens.length - 3} itens
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Explicação */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[60] backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
              <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                <HelpCircle className="text-indigo-600" size={20} />
                Como calculamos o seu Kit?
              </h3>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 text-slate-700">
              <p className="text-lg">
                A precificação do Kit é simplesmente a soma do trabalho que você já fez!
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="bg-rose-100 text-rose-600 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <strong className="text-slate-800 block mb-1">Custos reais</strong>
                    <p className="text-sm">Somamos o custo total (ingredientes + embalagens + mão de obra + custos fixos) de cada receita que você adiciona no pacote.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="bg-amber-100 text-amber-600 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <strong className="text-slate-800 block mb-1">Preço Sugerido</strong>
                    <p className="text-sm">Somamos o "Preço de Venda Ideal" de cada item, mostrando o valor que você cobraria se vendesse tudo separado.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="bg-emerald-100 text-emerald-600 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <strong className="text-slate-800 block mb-1">Seu Lucro</strong>
                    <p className="text-sm">Como em um combo você costuma dar um descontinho, basta digitar o preço que deseja cobrar pelo Kit. Nós mostramos na hora qual será o seu lucro real e a sua margem, para você criar combos atrativos sem ter prejuízo!</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Entendi, vamos lá!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
