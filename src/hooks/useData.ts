import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Insumo {
  id: string;
  user_id: string;
  nome: string;
  preco_pago: number;
  quantidade_embalagem: number;
  unidade: string; // g, ml, un
  tipo: 'ingrediente' | 'embalagem';
  created_at?: string;
}

export interface HistoricoPreco {
  id: string;
  insumo_id: string;
  preco_pago: number;
  created_at: string;
}

export interface ItemCustoFixo {
  id: string;
  user_id: string;
  nome: string;
  valor: number;
  created_at?: string;
}

export interface ReceitaIngrediente {
  insumo_id: string;
  quantidade: number;
}

export interface Receita {
  id: string;
  user_id: string;
  nome: string;
  rendimento: number; // Porções/Unidades
  rendimento_peso?: number; // Peso total em gramas (opcional)
  ingredientes: ReceitaIngrediente[];
  tempo_preparo: number; // Minutos
  margem_alvo: number; // Porcentagem, ex: 30%
  preco_venda_praticado: number;
  fator_perda?: number; // Porcentagem, ex: 10%
  created_at?: string;
}

export interface PerfilFinanceiro {
  id: string;
  nome: string;
  email: string;
  salario_desejado: number;
  dias_trabalhados: number;
  horas_trabalhadas: number;
  custos_fixos: number;
  consent_date?: string;
}

const ITENS_CUSTO_PADRAO = [
  'Gás', 'Água', 'Luz', 'Telefone', 'Internet', 
  'Aluguel', 'Gasolina', 'Mangas', 'Papel Toalha', 'MEI'
];

const INSUMOS_TESTE = [
  // Ingredientes
  { nome: 'Água', preco_pago: 0.00, quantidade_embalagem: 1000, unidade: 'ml', tipo: 'ingrediente' },
  { nome: 'Glacê Real Mix', preco_pago: 18.44, quantidade_embalagem: 1000, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Glacê Real Iceberg', preco_pago: 10.60, quantidade_embalagem: 500, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Glucose de Milho Xarope', preco_pago: 7.60, quantidade_embalagem: 250, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Glucose de Milho Pó', preco_pago: 8.80, quantidade_embalagem: 50, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Ácido Cítrico', preco_pago: 7.49, quantidade_embalagem: 50, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Açúcar Refinado', preco_pago: 3.19, quantidade_embalagem: 1000, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Açúcar Mascavo', preco_pago: 8.49, quantidade_embalagem: 500, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Farinha de Trigo', preco_pago: 3.99, quantidade_embalagem: 1000, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Ovos', preco_pago: 14.98, quantidade_embalagem: 20, unidade: 'un', tipo: 'ingrediente' },
  { nome: 'Manteiga Frizzo Com Sal', preco_pago: 20.80, quantidade_embalagem: 500, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Fubá mimoso', preco_pago: 4.39, quantidade_embalagem: 500, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Essência de Baunilha', preco_pago: 3.19, quantidade_embalagem: 30, unidade: 'ml', tipo: 'ingrediente' },
  { nome: 'Leite Ninho', preco_pago: 19.00, quantidade_embalagem: 380, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Pasta Saborizante de Morango', preco_pago: 26.90, quantidade_embalagem: 90, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Pasta Saborizante de Frutas d', preco_pago: 29.90, quantidade_embalagem: 90, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Fermento Químico em pó', preco_pago: 4.89, quantidade_embalagem: 100, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Saborizante de Coco Selecta', preco_pago: 12.00, quantidade_embalagem: 100, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Saborizante de Chocolate Brar', preco_pago: 19.00, quantidade_embalagem: 200, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Cacau em pó 50%', preco_pago: 35.50, quantidade_embalagem: 1010, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Cacau em pó 100%', preco_pago: 46.36, quantidade_embalagem: 1000, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Cacau Black', preco_pago: 37.00, quantidade_embalagem: 100, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Corante em Gel', preco_pago: 6.00, quantidade_embalagem: 25, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Leite Condensado', preco_pago: 5.89, quantidade_embalagem: 395, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Goiabada', preco_pago: 7.69, quantidade_embalagem: 500, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Amido de Milho', preco_pago: 8.90, quantidade_embalagem: 500, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Nata', preco_pago: 10.00, quantidade_embalagem: 300, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Açúcar Santa Isabel Demerara', preco_pago: 4.99, quantidade_embalagem: 1000, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Açúcar Glaçucar União', preco_pago: 3.99, quantidade_embalagem: 500, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Frutas Cristalizadas', preco_pago: 5.99, quantidade_embalagem: 150, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Melado de Cana', preco_pago: 9.89, quantidade_embalagem: 250, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Cream cheese Scala', preco_pago: 10.65, quantidade_embalagem: 150, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Cremor de Tártaro', preco_pago: 7.06, quantidade_embalagem: 40, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Laranja', preco_pago: 3.99, quantidade_embalagem: 1000, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Óleo', preco_pago: 7.39, quantidade_embalagem: 900, unidade: 'ml', tipo: 'ingrediente' },
  { nome: 'sal', preco_pago: 4.89, quantidade_embalagem: 1000, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Cenoura', preco_pago: 5.39, quantidade_embalagem: 1000, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Gotas de chocolate chips', preco_pago: 43.90, quantidade_embalagem: 1000, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Leite', preco_pago: 3.99, quantidade_embalagem: 1000, unidade: 'ml', tipo: 'ingrediente' },
  { nome: 'Toddy', preco_pago: 35.90, quantidade_embalagem: 1000, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Creme de Avelã', preco_pago: 9.95, quantidade_embalagem: 140, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Açúcar Demerara', preco_pago: 4.99, quantidade_embalagem: 1000, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Limão Taiti', preco_pago: 5.59, quantidade_embalagem: 1000, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Café Pilão Solúvel', preco_pago: 5.99, quantidade_embalagem: 40, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Essência de Laranja', preco_pago: 6.99, quantidade_embalagem: 30, unidade: 'ml', tipo: 'ingrediente' },
  { nome: 'Iogurte Batavo Natural', preco_pago: 2.89, quantidade_embalagem: 170, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Pasta Saborizante Pistache', preco_pago: 29.95, quantidade_embalagem: 90, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Recheio de Pistache Junco', preco_pago: 32.90, quantidade_embalagem: 1000, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Manteiga B nata sem sal', preco_pago: 8.90, quantidade_embalagem: 200, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Pasta de Amendoim Fit', preco_pago: 12.99, quantidade_embalagem: 450, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Flocos Ovomaltine', preco_pago: 27.90, quantidade_embalagem: 750, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Leite em pó Ninho', preco_pago: 16.97, quantidade_embalagem: 380, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Creme Crocante Ovomaltine', preco_pago: 49.90, quantidade_embalagem: 900, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Cobertura Sicao Mais Meio An', preco_pago: 33.90, quantidade_embalagem: 1010, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Nesquik', preco_pago: 16.48, quantidade_embalagem: 380, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Canela em pó', preco_pago: 6.49, quantidade_embalagem: 50, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Manteiga Itambé com Sal', preco_pago: 23.90, quantidade_embalagem: 500, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Doce de Leite Itambé', preco_pago: 10.90, quantidade_embalagem: 350, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Nozes triturada', preco_pago: 12.90, quantidade_embalagem: 100, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Paçoca rolha', preco_pago: 24.59, quantidade_embalagem: 50, unidade: 'un', tipo: 'ingrediente' },
  { nome: 'Chopp de Vinho Stempel', preco_pago: 9.49, quantidade_embalagem: 1, unidade: 'un', tipo: 'ingrediente' },
  { nome: 'Cerveja Black Princess', preco_pago: 14.98, quantidade_embalagem: 1, unidade: 'un', tipo: 'ingrediente' },
  { nome: 'Geléia Só fruta morango', preco_pago: 9.29, quantidade_embalagem: 230, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Kit kat cremoso', preco_pago: 29.90, quantidade_embalagem: 330, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Laranja Bahia', preco_pago: 13.00, quantidade_embalagem: 1000, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Pasta saborizante Laranja bah', preco_pago: 34.50, quantidade_embalagem: 90, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Manteiga Paulista', preco_pago: 24.90, quantidade_embalagem: 500, unidade: 'g', tipo: 'ingrediente' },
  { nome: 'Cobertura Harald Top Cau Chc', preco_pago: 54.90, quantidade_embalagem: 1000, unidade: 'g', tipo: 'ingrediente' },

  // Embalagens
  { nome: 'Fecho Prático', preco_pago: 4.00, quantidade_embalagem: 100, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Fita de Natal 22MM', preco_pago: 14.19, quantidade_embalagem: 1000, unidade: 'cm', tipo: 'embalagem' },
  { nome: 'Saco Polipropileno 7X25', preco_pago: 3.95, quantidade_embalagem: 50, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Saco Polipropileno 13X20', preco_pago: 5.95, quantidade_embalagem: 50, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Caixa de Transporte 30X30X6', preco_pago: 5.09, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Caixa Acetato GG', preco_pago: 3.40, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Saco PP Autoadesivo 9X9', preco_pago: 10.30, quantidade_embalagem: 100, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Adesivo logo 3,5cm', preco_pago: 0.10, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Tag', preco_pago: 0.17, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Adesivo logo 5,5cm (sacolas/caixas)', preco_pago: 0.15, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Saco PP Autoadesivo 7,5X10', preco_pago: 10.69, quantidade_embalagem: 100, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Saco PP Autoadesivo 10X10', preco_pago: 9.64, quantidade_embalagem: 100, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Saco Polipropileno 15X22', preco_pago: 6.35, quantidade_embalagem: 50, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Caixa de Sedex', preco_pago: 3.80, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Saco PP Autoadesivo 12X12', preco_pago: 11.91, quantidade_embalagem: 100, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Saco Polipropileno 10X14', preco_pago: 3.08, quantidade_embalagem: 50, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Saco Polipropileno 8X25', preco_pago: 3.75, quantidade_embalagem: 50, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Sacola de Papel Kraft 18X10X27', preco_pago: 0.95, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Sacola de Papel Kraft 14X14X6', preco_pago: 15.14, quantidade_embalagem: 10, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Sacola de Papel Kraft 15X19,5X8', preco_pago: 18.49, quantidade_embalagem: 10, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Sacola de Papel Kraft 18X10,5X33', preco_pago: 16.66, quantidade_embalagem: 10, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Sacola de Papel Kraft 23X13X30', preco_pago: 1.19, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Papel Seda Branco', preco_pago: 0.60, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Papel Seda Vermelho', preco_pago: 0.65, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Caixa Mini Panetone', preco_pago: 3.90, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Caixa Branca tampa acetato', preco_pago: 15.47, quantidade_embalagem: 10, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Maleta para Caixa de bombom', preco_pago: 3.49, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Palha de madeira', preco_pago: 3.95, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Caixa coração lapidado 200g', preco_pago: 4.00, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Etiqueta Ingredientes', preco_pago: 0.10, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Correntinha Tags', preco_pago: 28.49, quantidade_embalagem: 100, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Elástico Metalizado Dourado 1mm', preco_pago: 24.90, quantidade_embalagem: 5000, unidade: 'cm', tipo: 'embalagem' },
  { nome: 'Marmitinha 220ml', preco_pago: 78.11, quantidade_embalagem: 100, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Garfinho descartável', preco_pago: 4.90, quantidade_embalagem: 50, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Pavio vela', preco_pago: 14.50, quantidade_embalagem: 50, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Palito plástico', preco_pago: 6.67, quantidade_embalagem: 100, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Plástico bolha', preco_pago: 14.90, quantidade_embalagem: 2000, unidade: 'cm', tipo: 'embalagem' },
  { nome: 'Sacola de Papel Kraft 15X8', preco_pago: 18.49, quantidade_embalagem: 10, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Sacola de Papel Kraft pink', preco_pago: 20.23, quantidade_embalagem: 10, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Caixa kraft c/ visor 0,95X0,70x0,35', preco_pago: 1.81, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Fita de Cetim Amarelo ouro/Champanhe/', preco_pago: 8.60, quantidade_embalagem: 1000, unidade: 'cm', tipo: 'embalagem' },
  { nome: 'Caixa Kraft c/ visor 0,100X10,0X04,5', preco_pago: 2.89, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Caixa Kraft 160X220X0,40', preco_pago: 2.75, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Caixa Kraft 0,35X17,0X05,5', preco_pago: 5.74, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Caixa Kraft 0,15X20,0x04,8', preco_pago: 3.21, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Cestinha', preco_pago: 60.65, quantidade_embalagem: 30, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Molheira', preco_pago: 39.69, quantidade_embalagem: 200, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Caixa acetato 15X11', preco_pago: 37.12, quantidade_embalagem: 25, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Tirinha', preco_pago: 0.50, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Caixa acetato Tirinhas', preco_pago: 57.90, quantidade_embalagem: 25, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Caixa de ovos', preco_pago: 26.66, quantidade_embalagem: 20, unidade: 'un', tipo: 'embalagem' },
  { nome: 'pincel', preco_pago: 22.92, quantidade_embalagem: 50, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Papel de Arroz', preco_pago: 13.50, quantidade_embalagem: 16, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Saco Sanfonado 10X19', preco_pago: 55.00, quantidade_embalagem: 300, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Baleiro 1000ml', preco_pago: 5.99, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Pote Gira e Trava Plasutil', preco_pago: 2.85, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' },
  { nome: 'Card Tirinhas', preco_pago: 0.50, quantidade_embalagem: 1, unidade: 'un', tipo: 'embalagem' }
];

const normalizarNome = (str: string): string => {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
};

export function useData(userId: string | null) {
  // Wrapper para o localStorage que isola os dados por userId
  const localDb = {
    getItem: (key: string): string | null => {
      const actualKey = (key.startsWith('precificaalim_') && userId) ? `${key}_${userId}` : key;
      return localStorage.getItem(actualKey);
    },
    setItem: (key: string, value: string): void => {
      const actualKey = (key.startsWith('precificaalim_') && userId) ? `${key}_${userId}` : key;
      localStorage.setItem(actualKey, value);
    },
    removeItem: (key: string): void => {
      const actualKey = (key.startsWith('precificaalim_') && userId) ? `${key}_${userId}` : key;
      localStorage.removeItem(actualKey);
    }
  };

  const [profile, setProfile] = useState<PerfilFinanceiro | null>(null);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [historicoPrecos, setHistoricoPrecos] = useState<HistoricoPreco[]>([]);
  const [custosItens, setCustosItens] = useState<ItemCustoFixo[]>([]);
  const [loading, setLoading] = useState(true);

  const isPlaceholder = import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

  // 1. Carregar dados do banco ou do localStorage
  useEffect(() => {
    if (!userId) {
      // Limpeza de memória no logout: zera os estados do React
      setProfile(null);
      setInsumos([]);
      setReceitas([]);
      setHistoricoPrecos([]);
      setCustosItens([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        if (isPlaceholder) {
          // Migração de dados antigos globais para as chaves individualizadas por usuário
          const chavesParaMigrar = [
            'precificaalim_profiles',
            'precificaalim_insumos',
            'precificaalim_receitas',
            'precificaalim_historico',
            'precificaalim_custos_itens',
            'precificaalim_insumos_limpos'
          ];
          
          chavesParaMigrar.forEach(chave => {
            const dadoGlobal = localStorage.getItem(chave);
            const chaveUsuario = `${chave}_${userId}`;
            if (dadoGlobal !== null && localStorage.getItem(chaveUsuario) === null) {
              localStorage.setItem(chaveUsuario, dadoGlobal);
            }
          });

          // Limpa chaves globais antigas para evitar exposição de dados entre usuários
          chavesParaMigrar.forEach(chave => {
            localStorage.removeItem(chave);
          });

          // Lógica de mock no localStorage usando localDb
          const savedProfile = localDb.getItem('precificaalim_profiles');
          const savedInsumos = localDb.getItem('precificaalim_insumos');
          const savedReceitas = localDb.getItem('precificaalim_receitas');
          const savedHistorico = localDb.getItem('precificaalim_historico');
          const savedCustosItens = localDb.getItem('precificaalim_custos_itens');

          if (savedProfile) {
            setProfile(JSON.parse(savedProfile));
          } else {
            const newProfile = {
              id: userId,
              nome: 'Artesão Confeiteiro',
              email: 'artesao@email.com',
              salario_desejado: 2500,
              dias_trabalhados: 22,
              horas_trabalhadas: 8,
              custos_fixos: 500
            };
            setProfile(newProfile);
            localDb.setItem('precificaalim_profiles', JSON.stringify(newProfile));
          }

          // Fallback para mapear "tipo" em insumos antigos do mock e migrar IDs de teste
          const rawInsumos = savedInsumos ? JSON.parse(savedInsumos) : [];
          const rawReceitas = savedReceitas ? JSON.parse(savedReceitas) : [];
          const rawHistorico = savedHistorico ? JSON.parse(savedHistorico) : [];

          const idMap: { [oldId: string]: string } = {};
          let migrouInsumos = false;

          const migratedInsumos: Insumo[] = rawInsumos.map((ins: any) => {
            if (!ins) return ins;
            const nomeInsumo = ins.nome || '';
            const idxTeste = nomeInsumo ? INSUMOS_TESTE.findIndex(t => t.nome.toLowerCase() === nomeInsumo.toLowerCase()) : -1;
            if (idxTeste !== -1) {
              const staticId = 'insumo-teste-' + idxTeste;
              if (ins.id !== staticId) {
                idMap[ins.id] = staticId;
                migrouInsumos = true;
                return { ...ins, id: staticId, tipo: ins.tipo || INSUMOS_TESTE[idxTeste].tipo };
              }
            }
            return { ...ins, tipo: ins.tipo || 'ingrediente' };
          });

          let parsedInsumos = migratedInsumos;
          const isCleaned = localDb.getItem('precificaalim_insumos_limpos') === 'true';

          // Se estiver vazio ou com poucos itens, popula automaticamente com os dados de teste para agilizar a validacao
          if (parsedInsumos.length < 10 && !isCleaned) {
            const insumosComId: Insumo[] = INSUMOS_TESTE.map((ins, idx) => ({
              user_id: userId,
              nome: ins.nome,
              preco_pago: ins.preco_pago,
              quantidade_embalagem: ins.quantidade_embalagem,
              unidade: ins.unidade,
              tipo: ins.tipo as 'ingrediente' | 'embalagem',
              id: 'insumo-teste-' + idx
            }));
            parsedInsumos = insumosComId;
            localDb.setItem('precificaalim_insumos', JSON.stringify(insumosComId));

            const novosHist: HistoricoPreco[] = insumosComId.map((ins) => ({
              id: 'hist-' + ins.id + '-' + Date.now(),
              insumo_id: ins.id,
              preco_pago: ins.preco_pago,
              created_at: new Date().toISOString()
            }));
            localDb.setItem('precificaalim_historico', JSON.stringify(novosHist));
          } else if (migrouInsumos) {
            localDb.setItem('precificaalim_insumos', JSON.stringify(parsedInsumos));
          }
          
          setInsumos(parsedInsumos);
          
          // Migração de receitas
          let parsedReceitas = rawReceitas.map((r: any) => {
            if (!r) return r;
            return {
              ...r,
              fator_perda: r.fator_perda !== undefined ? r.fator_perda : 0,
              rendimento_peso: r.rendimento_peso !== undefined ? r.rendimento_peso : 0
            };
          });

          if (Object.keys(idMap).length > 0) {
            let migrouReceitas = false;
            parsedReceitas = parsedReceitas.map((r: any) => {
              if (!r || !r.ingredientes) return r;
              let alterado = false;
              const novosIngredientes = r.ingredientes.map((ing: any) => {
                if (ing && idMap[ing.insumo_id]) {
                  alterado = true;
                  return { ...ing, insumo_id: idMap[ing.insumo_id] };
                }
                return ing;
              });
              if (alterado) {
                migrouReceitas = true;
                return { ...r, ingredientes: novosIngredientes };
              }
              return r;
            });

            if (migrouReceitas) {
              localDb.setItem('precificaalim_receitas', JSON.stringify(parsedReceitas));
            }
          }
          setReceitas(parsedReceitas);

          // Migração de histórico de preços
          let parsedHistorico = rawHistorico;
          if (Object.keys(idMap).length > 0) {
            let migrouHistorico = false;
            parsedHistorico = parsedHistorico.map((h: any) => {
              if (idMap[h.insumo_id]) {
                migrouHistorico = true;
                return { ...h, insumo_id: idMap[h.insumo_id], id: 'hist-' + idMap[h.insumo_id] + '-' + Date.now() };
              }
              return h;
            });
            if (migrouHistorico) {
              localDb.setItem('precificaalim_historico', JSON.stringify(parsedHistorico));
            }
          }

          if (parsedHistorico.length === 0 && parsedInsumos.length > 0) {
            parsedHistorico = parsedInsumos.map(insumo => ({
              id: 'hist-' + insumo.id + '-' + Date.now(),
              insumo_id: insumo.id,
              preco_pago: insumo.preco_pago,
              created_at: new Date().toISOString()
            }));
            localDb.setItem('precificaalim_historico', JSON.stringify(parsedHistorico));
          }
          setHistoricoPrecos(parsedHistorico);

          // Inicializa itens de custo fixo mock se não houver
          let parsedCustosItens: ItemCustoFixo[] = savedCustosItens ? JSON.parse(savedCustosItens) : [];
          if (parsedCustosItens.length === 0) {
            parsedCustosItens = ITENS_CUSTO_PADRAO.map((nome, idx) => ({
              id: 'custo-' + idx + '-' + Date.now(),
              user_id: userId,
              nome,
              valor: 0
            }));
            localDb.setItem('precificaalim_custos_itens', JSON.stringify(parsedCustosItens));
          }
          setCustosItens(parsedCustosItens);
        } else {
          // Dados reais do Supabase
          const { data: pData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          setProfile(pData);

          const { data: iData } = await supabase
            .from('insumos')
            .select('*')
            .eq('user_id', userId);
          
          // Fallback para mapear "tipo" em registros antigos do Supabase
          let loadedInsumos: Insumo[] = (iData || []).map((i: any) => ({
            ...i,
            tipo: i.tipo || 'ingrediente'
          }));

          // Se estiver vazio ou com poucos itens no Supabase, popula automaticamente com os dados de teste para agilizar a validacao
          const isCleaned = localDb.getItem('precificaalim_insumos_limpos') === 'true';

          if (loadedInsumos.length < 10 && !isCleaned) {
            const insumosNovos = INSUMOS_TESTE.map((ins) => ({
              user_id: userId,
              nome: ins.nome,
              preco_pago: ins.preco_pago,
              quantidade_embalagem: ins.quantidade_embalagem,
              unidade: ins.unidade,
              tipo: ins.tipo as 'ingrediente' | 'embalagem'
            }));

            const { data: insertedInsumos, error: insertError } = await supabase
              .from('insumos')
              .insert(insumosNovos)
              .select();

            if (!insertError && insertedInsumos) {
              loadedInsumos = insertedInsumos;
              
              const historicoNovos = insertedInsumos.map(ins => ({
                insumo_id: ins.id,
                preco_pago: ins.preco_pago,
                created_at: new Date().toISOString()
              }));

              await supabase.from('historico_precos').insert(historicoNovos);
            }
          }

          setInsumos(loadedInsumos);

          const { data: rData } = await supabase
            .from('receitas')
            .select('*')
            .eq('user_id', userId);
          setReceitas((rData || []).map((r: any) => ({
            ...r,
            fator_perda: r.fator_perda !== undefined ? r.fator_perda : 0,
            rendimento_peso: r.rendimento_peso !== undefined ? r.rendimento_peso : 0
          })));

          if (loadedInsumos.length > 0) {
            const insumoIds = loadedInsumos.map(i => i.id);
            const { data: hData } = await supabase
              .from('historico_precos')
              .select('*')
              .in('insumo_id', insumoIds);
            setHistoricoPrecos(hData || []);
          } else {
            setHistoricoPrecos([]);
          }

          // Carrega itens de custo fixo do Supabase
          const { data: cData } = await supabase
            .from('custos_fixos_itens')
            .select('*')
            .eq('user_id', userId);
          let loadedCustos = cData || [];

          if (loadedCustos.length === 0) {
            const defaultCustos = ITENS_CUSTO_PADRAO.map(nome => ({
              user_id: userId,
              nome,
              valor: 0
            }));
            
            const { data: insertedData, error: insertError } = await supabase
              .from('custos_fixos_itens')
              .insert(defaultCustos)
              .select();
            
            if (!insertError && insertedData) {
              loadedCustos = insertedData;
            }
          }
          setCustosItens(loadedCustos);
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, isPlaceholder]);

  // Retorna os preços históricos ordenados (mais recente primeiro)
  const getPrecosHistoricos = (insumoId: string): number[] => {
    return historicoPrecos
      .filter(h => h.insumo_id === insumoId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(h => h.preco_pago);
  };

  // 2. Ações de Insumos
  const addInsumo = async (
    nome: string, 
    preco_pago: number, 
    quantidade_embalagem: number, 
    unidade: string,
    tipo: 'ingrediente' | 'embalagem'
  ) => {
    if (!userId) return;
    
    // Verifica se já existe um insumo com o mesmo nome normalizado
    const existente = insumos.find(i => normalizarNome(i.nome) === normalizarNome(nome));

    if (existente) {
      // Se existir, atualiza o registro existente
      const updatedInsumos = insumos.map(ins => {
        if (ins.id === existente.id) {
          return { ...ins, preco_pago, quantidade_embalagem, unidade, tipo };
        }
        return ins;
      });

      setInsumos(updatedInsumos);

      if (isPlaceholder) {
        localDb.setItem('precificaalim_insumos', JSON.stringify(updatedInsumos));
        
        const novoHist: HistoricoPreco = {
          id: 'hist-' + existente.id + '-' + Date.now(),
          insumo_id: existente.id,
          preco_pago,
          created_at: new Date().toISOString()
        };
        const updatedHist = [...historicoPrecos, novoHist];
        setHistoricoPrecos(updatedHist);
        localDb.setItem('precificaalim_historico', JSON.stringify(updatedHist));
      } else {
        const { error: insumoError } = await supabase
          .from('insumos')
          .update({ preco_pago, quantidade_embalagem, unidade, tipo })
          .eq('id', existente.id);
        if (insumoError) throw insumoError;

        const { data: histData, error: histError } = await supabase
          .from('historico_precos')
          .insert([{
            insumo_id: existente.id,
            preco_pago,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (!histError && histData) {
          setHistoricoPrecos([...historicoPrecos, histData]);
        }
      }
      return;
    }

    const newInsumo: Omit<Insumo, 'id'> = {
      user_id: userId,
      nome,
      preco_pago,
      quantidade_embalagem,
      unidade,
      tipo
    };

    if (isPlaceholder) {
      const insumoComId: Insumo = { ...newInsumo, id: 'insumo-' + Date.now() };
      const updatedInsumos = [...insumos, insumoComId];
      setInsumos(updatedInsumos);
      localDb.setItem('precificaalim_insumos', JSON.stringify(updatedInsumos));

      // Cria a entrada de histórico inicial
      const historicoComId: HistoricoPreco = {
        id: 'hist-' + insumoComId.id + '-' + Date.now(),
        insumo_id: insumoComId.id,
        preco_pago,
        created_at: new Date().toISOString()
      };
      const updatedHist = [...historicoPrecos, historicoComId];
      setHistoricoPrecos(updatedHist);
      localDb.setItem('precificaalim_historico', JSON.stringify(updatedHist));
    } else {
      const { data: insumoData, error: insumoError } = await supabase
        .from('insumos')
        .insert([newInsumo])
        .select()
        .single();
      
      if (insumoError) throw insumoError;
      
      if (insumoData) {
        setInsumos([...insumos, insumoData]);
        
        const { data: histData, error: histError } = await supabase
          .from('historico_precos')
          .insert([{
            insumo_id: insumoData.id,
            preco_pago,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (!histError && histData) {
          setHistoricoPrecos([...historicoPrecos, histData]);
        }
      }
    }
  };

  const updateInsumo = async (id: string, preco_pago: number) => {
    const updatedInsumos = insumos.map(insumo => {
      if (insumo.id === id) {
        return { ...insumo, preco_pago };
      }
      return insumo;
    });

    setInsumos(updatedInsumos);

    if (isPlaceholder) {
      localDb.setItem('precificaalim_insumos', JSON.stringify(updatedInsumos));
      
      const novoHist: HistoricoPreco = {
        id: 'hist-' + id + '-' + Date.now(),
        insumo_id: id,
        preco_pago,
        created_at: new Date().toISOString()
      };
      const updatedHist = [...historicoPrecos, novoHist];
      setHistoricoPrecos(updatedHist);
      localDb.setItem('precificaalim_historico', JSON.stringify(updatedHist));
    } else {
      const { error: insumoError } = await supabase
          .from('insumos')
          .update({ preco_pago })
          .eq('id', id);
      if (insumoError) throw insumoError;

      const { data: histData, error: histError } = await supabase
        .from('historico_precos')
        .insert([{
          insumo_id: id,
          preco_pago,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (!histError && histData) {
        setHistoricoPrecos([...historicoPrecos, histData]);
      }
    }
  };

  const deleteInsumo = async (id: string) => {
    const updatedInsumos = insumos.filter(insumo => insumo.id !== id);
    setInsumos(updatedInsumos);

    const updatedHist = historicoPrecos.filter(h => h.insumo_id !== id);
    setHistoricoPrecos(updatedHist);

    if (isPlaceholder) {
      localDb.setItem('precificaalim_insumos', JSON.stringify(updatedInsumos));
      localDb.setItem('precificaalim_historico', JSON.stringify(updatedHist));
      
      const updatedReceitas = receitas.map(rec => ({
        ...rec,
        ingredientes: rec.ingredientes.filter(ing => ing.insumo_id !== id)
      }));
      setReceitas(updatedReceitas);
      localDb.setItem('precificaalim_receitas', JSON.stringify(updatedReceitas));
    } else {
      const { error } = await supabase.from('insumos').delete().eq('id', id);
      if (error) throw error;
      setReceitas(receitas.map(rec => ({
        ...rec,
        ingredientes: rec.ingredientes.filter(ing => ing.insumo_id !== id)
      })));
    }
  };

  const carregarInsumosTeste = async () => {
    if (!userId) return;
    localDb.removeItem('precificaalim_insumos_limpos');
    
    const insumosNovos = INSUMOS_TESTE.map((ins) => ({
      user_id: userId,
      nome: ins.nome,
      preco_pago: ins.preco_pago,
      quantidade_embalagem: ins.quantidade_embalagem,
      unidade: ins.unidade,
      tipo: ins.tipo as 'ingrediente' | 'embalagem'
    }));

    if (isPlaceholder) {
      const savedInsumos = localDb.getItem('precificaalim_insumos');
      const insumosAtuais: Insumo[] = savedInsumos ? JSON.parse(savedInsumos) : [];
      
      const novosInsumos = [...insumosAtuais];
      const novosHist: HistoricoPreco[] = [];

      insumosNovos.forEach((novo, idx) => {
        const indiceExistente = novosInsumos.findIndex(atual => 
          normalizarNome(atual.nome) === normalizarNome(novo.nome) && atual.user_id === userId
        );

        if (indiceExistente !== -1) {
          novosInsumos[indiceExistente] = {
            ...novosInsumos[indiceExistente],

            preco_pago: novo.preco_pago,
            quantidade_embalagem: novo.quantidade_embalagem,
            unidade: novo.unidade,
            tipo: novo.tipo
          };
          novosHist.push({
            id: 'hist-' + novosInsumos[indiceExistente].id + '-' + Date.now(),
            insumo_id: novosInsumos[indiceExistente].id,
            preco_pago: novo.preco_pago,
            created_at: new Date().toISOString()
          });
        } else {
          const insumoComId: Insumo = {
            ...novo,
            id: 'insumo-teste-' + idx
          };
          novosInsumos.push(insumoComId);
          novosHist.push({
            id: 'hist-' + insumoComId.id + '-' + Date.now(),
            insumo_id: insumoComId.id,
            preco_pago: insumoComId.preco_pago,
            created_at: new Date().toISOString()
          });
        }
      });

      setInsumos(novosInsumos);
      localDb.setItem('precificaalim_insumos', JSON.stringify(novosInsumos));

      const savedHistorico = localDb.getItem('precificaalim_historico');
      const histAtuais: HistoricoPreco[] = savedHistorico ? JSON.parse(savedHistorico) : [];
      const novosHistLista = [...histAtuais, ...novosHist];
      setHistoricoPrecos(novosHistLista);
      localDb.setItem('precificaalim_historico', JSON.stringify(novosHistLista));
    } else {
      const novosInsumosLista = [];
      const historicoNovos = [];

      for (const novo of insumosNovos) {
        const { data: existente } = await supabase
          .from('insumos')
          .select('*')
          .eq('user_id', userId)
          .eq('nome', novo.nome)
          .maybeSingle();

        if (existente) {
          const { data: updated, error: updateErr } = await supabase
            .from('insumos')
            .update({
              preco_pago: novo.preco_pago,
              quantidade_embalagem: novo.quantidade_embalagem,
              unidade: novo.unidade,
              tipo: novo.tipo
            })
            .eq('id', existente.id)
            .select()
            .single();

          if (!updateErr && updated) {
            novosInsumosLista.push(updated);
            historicoNovos.push({
              insumo_id: updated.id,
              preco_pago: novo.preco_pago,
              created_at: new Date().toISOString()
            });
          }
        } else {
          const { data: inserted, error: insertErr } = await supabase
            .from('insumos')
            .insert([novo])
            .select()
            .single();

          if (!insertErr && inserted) {
            novosInsumosLista.push(inserted);
            historicoNovos.push({
              insumo_id: inserted.id,
              preco_pago: novo.preco_pago,
              created_at: new Date().toISOString()
            });
          }
        }
      }

      const { data: todosInsumos } = await supabase
        .from('insumos')
        .select('*')
        .eq('user_id', userId);

      if (todosInsumos) {
        setInsumos(todosInsumos.map((i: any) => ({
          ...i,
          tipo: i.tipo || 'ingrediente'
        })));
      }

      if (historicoNovos.length > 0) {
        const { data: insertedHist } = await supabase
          .from('historico_precos')
          .insert(historicoNovos)
          .select();

        if (insertedHist) {
          setHistoricoPrecos([...historicoPrecos, ...insertedHist]);
        }
      }
    }
  };

  const limparECarregarInsumosTeste = async () => {
    if (!userId) return;
    localDb.removeItem('precificaalim_insumos_limpos');

    if (isPlaceholder) {
      localDb.removeItem('precificaalim_insumos');
      localDb.removeItem('precificaalim_historico');
      
      const insumosComId: Insumo[] = INSUMOS_TESTE.map((ins, idx) => ({
        user_id: userId,
        nome: ins.nome,
        preco_pago: ins.preco_pago,
        quantidade_embalagem: ins.quantidade_embalagem,
        unidade: ins.unidade,
        tipo: ins.tipo as 'ingrediente' | 'embalagem',
        id: 'insumo-teste-' + idx
      }));

      setInsumos(insumosComId);
      localDb.setItem('precificaalim_insumos', JSON.stringify(insumosComId));

      const novosHist: HistoricoPreco[] = insumosComId.map((ins) => ({
        id: 'hist-' + ins.id + '-' + Date.now(),
        insumo_id: ins.id,
        preco_pago: ins.preco_pago,
        created_at: new Date().toISOString()
      }));
      setHistoricoPrecos(novosHist);
      localDb.setItem('precificaalim_historico', JSON.stringify(novosHist));
    } else {
      await supabase.from('historico_precos').delete().filter('insumo_id', 'in', insumos.map(i => i.id));
      await supabase.from('insumos').delete().eq('user_id', userId);

      const insumosNovos = INSUMOS_TESTE.map((ins) => ({
        user_id: userId,
        nome: ins.nome,
        preco_pago: ins.preco_pago,
        quantidade_embalagem: ins.quantidade_embalagem,
        unidade: ins.unidade,
        tipo: ins.tipo as 'ingrediente' | 'embalagem'
      }));

      const { data: insertedInsumos, error: insertError } = await supabase
        .from('insumos')
        .insert(insumosNovos)
        .select();

      if (!insertError && insertedInsumos) {
        setInsumos(insertedInsumos);

        const historicoNovos = insertedInsumos.map(ins => ({
          insumo_id: ins.id,
          preco_pago: ins.preco_pago,
          created_at: new Date().toISOString()
        }));

        const { data: insertedHist } = await supabase
          .from('historico_precos')
          .insert(historicoNovos)
          .select();

        if (insertedHist) {
          setHistoricoPrecos(insertedHist);
        }
      }
    }
  };

  const limparTodosInsumos = async () => {
    if (!userId) return;

    localDb.setItem('precificaalim_insumos_limpos', 'true');

    if (isPlaceholder) {
      localDb.setItem('precificaalim_insumos', JSON.stringify([]));
      localDb.setItem('precificaalim_historico', JSON.stringify([]));
      setInsumos([]);
      setHistoricoPrecos([]);
    } else {
      if (insumos.length > 0) {
        await supabase.from('historico_precos').delete().filter('insumo_id', 'in', insumos.map(i => i.id));
      }
      await supabase.from('insumos').delete().eq('user_id', userId);
      setInsumos([]);
      setHistoricoPrecos([]);
    }
  };

  const importarInsumosLote = async (lote: Omit<Insumo, 'id' | 'user_id'>[]) => {
    if (!userId) return;
    localStorage.removeItem('precificaalim_insumos_limpos');

    if (isPlaceholder) {
      let currentInsumos = [...insumos];
      let currentHist = [...historicoPrecos];

      lote.forEach((novo, index) => {
        const existIdx = currentInsumos.findIndex(i => normalizarNome(i.nome) === normalizarNome(novo.nome));
        
        if (existIdx !== -1) {
          const oldInsumo = currentInsumos[existIdx];
          currentInsumos[existIdx] = {
            ...oldInsumo,
            preco_pago: novo.preco_pago,
            quantidade_embalagem: novo.quantidade_embalagem,
            unidade: novo.unidade,
            tipo: novo.tipo
          };

          currentHist.push({
            id: 'hist-' + oldInsumo.id + '-' + (Date.now() + index),
            insumo_id: oldInsumo.id,
            preco_pago: novo.preco_pago,
            created_at: new Date().toISOString()
          });
        } else {
          const insumoId = 'insumo-' + (Date.now() + index);
          const insumoComId: Insumo = {
            user_id: userId,
            nome: novo.nome,
            preco_pago: novo.preco_pago,
            quantidade_embalagem: novo.quantidade_embalagem,
            unidade: novo.unidade,
            tipo: novo.tipo,
            id: insumoId
          };
          currentInsumos.push(insumoComId);

          currentHist.push({
            id: 'hist-' + insumoId + '-' + (Date.now() + index),
            insumo_id: insumoId,
            preco_pago: novo.preco_pago,
            created_at: new Date().toISOString()
          });
        }
      });

      setInsumos(currentInsumos);
      localDb.setItem('precificaalim_insumos', JSON.stringify(currentInsumos));
      setHistoricoPrecos(currentHist);
      localDb.setItem('precificaalim_historico', JSON.stringify(currentHist));
    } else {
      let currentInsumos = [...insumos];
      let currentHist = [...historicoPrecos];
      const novosHistLista = [];

      for (const novo of lote) {
        const existInsumo = currentInsumos.find(i => normalizarNome(i.nome) === normalizarNome(novo.nome));

        if (existInsumo) {
          const { error: updateError } = await supabase
            .from('insumos')
            .update({
              preco_pago: novo.preco_pago,
              quantidade_embalagem: novo.quantidade_embalagem,
              unidade: novo.unidade,
              tipo: novo.tipo
            })
            .eq('id', existInsumo.id);

          if (!updateError) {
            currentInsumos = currentInsumos.map(item => 
              item.id === existInsumo.id 
                ? { ...item, preco_pago: novo.preco_pago, quantidade_embalagem: novo.quantidade_embalagem, unidade: novo.unidade, tipo: novo.tipo } 
                : item
            );
            novosHistLista.push({
              insumo_id: existInsumo.id,
              preco_pago: novo.preco_pago,
              created_at: new Date().toISOString()
            });
          }
        } else {
          const newInsumoReal = {
            user_id: userId,
            nome: novo.nome,
            preco_pago: novo.preco_pago,
            quantidade_embalagem: novo.quantidade_embalagem,
            unidade: novo.unidade,
            tipo: novo.tipo
          };

          const { data: insertedData, error: insertError } = await supabase
            .from('insumos')
            .insert([newInsumoReal])
            .select()
            .single();

          if (!insertError && insertedData) {
            currentInsumos.push(insertedData);
            novosHistLista.push({
              insumo_id: insertedData.id,
              preco_pago: novo.preco_pago,
              created_at: new Date().toISOString()
            });
          }
        }
      }

      setInsumos(currentInsumos);

      if (novosHistLista.length > 0) {
        const { data: insertedHist, error: histError } = await supabase
          .from('historico_precos')
          .insert(novosHistLista)
          .select();
        
        if (!histError && insertedHist) {
          setHistoricoPrecos([...currentHist, ...insertedHist]);
        }
      }
    }
  };

  // 3. Ações de Receitas
  const addReceita = async (
    nome: string, 
    rendimento: number, 
    ingredientes: ReceitaIngrediente[], 
    tempo_preparo: number, 
    margem_alvo: number, 
    preco_venda_praticado: number,
    fator_perda: number,
    rendimento_peso: number
  ) => {
    if (!userId) return;
    const newReceita: Omit<Receita, 'id'> = {
      user_id: userId,
      nome,
      rendimento,
      rendimento_peso,
      ingredientes,
      tempo_preparo,
      margem_alvo,
      preco_venda_praticado,
      fator_perda
    };

    if (isPlaceholder) {
      const receitaComId: Receita = { ...newReceita, id: 'receita-' + Date.now() };
      const updatedList = [...receitas, receitaComId];
      setReceitas(updatedList);
      localDb.setItem('precificaalim_receitas', JSON.stringify(updatedList));
    } else {
      try {
        const { data, error } = await supabase
          .from('receitas')
          .insert([newReceita])
          .select()
          .single();
        if (error) throw error;
        if (data) setReceitas([...receitas, data]);
      } catch (err: any) {
        if (err.code === '42703' || (err.message && err.message.includes('rendimento_peso'))) {
          console.warn('Coluna rendimento_peso inexistente no Supabase. Salvando sem ela.');
          const { rendimento_peso: _, ...newReceitaSemPeso } = newReceita;
          const { data, error } = await supabase
            .from('receitas')
            .insert([newReceitaSemPeso])
            .select()
            .single();
          if (error) throw error;
          if (data) {
            const dataComPeso = { ...data, rendimento_peso };
            setReceitas([...receitas, dataComPeso]);
          }
        } else {
          throw err;
        }
      }
    }
  };

  const deleteReceita = async (id: string) => {
    const updatedList = receitas.filter(receita => receita.id !== id);
    setReceitas(updatedList);

    if (isPlaceholder) {
      localDb.setItem('precificaalim_receitas', JSON.stringify(updatedList));
    } else {
      const { error } = await supabase.from('receitas').delete().eq('id', id);
      if (error) throw error;
    }
  };

  const updateReceita = async (
    id: string,
    nome: string, 
    rendimento: number, 
    ingredientes: ReceitaIngrediente[], 
    tempo_preparo: number, 
    margem_alvo: number, 
    preco_venda_praticado: number,
    fator_perda: number,
    rendimento_peso: number
  ) => {
    const updatedList = receitas.map(rec => {
      if (rec.id === id) {
        return {
          ...rec,
          nome,
          rendimento,
          rendimento_peso,
          ingredientes,
          tempo_preparo,
          margem_alvo,
          preco_venda_praticado,
          fator_perda
        };
      }
      return rec;
    });
    setReceitas(updatedList);

    if (isPlaceholder) {
      localDb.setItem('precificaalim_receitas', JSON.stringify(updatedList));
    } else {
      try {
        const { error } = await supabase
          .from('receitas')
          .update({
            nome,
            rendimento,
            rendimento_peso,
            ingredientes,
            tempo_preparo,
            margem_alvo,
            preco_venda_praticado,
            fator_perda
          })
          .eq('id', id);
        if (error) throw error;
      } catch (err: any) {
        if (err.code === '42703' || (err.message && err.message.includes('rendimento_peso'))) {
          console.warn('Coluna rendimento_peso inexistente no Supabase. Atualizando sem ela.');
          const { error } = await supabase
            .from('receitas')
            .update({
              nome,
              rendimento,
              ingredientes,
              tempo_preparo,
              margem_alvo,
              preco_venda_praticado,
              fator_perda
            })
            .eq('id', id);
          if (error) throw error;
        } else {
          throw err;
        }
      }
    }
  };

  // 4. Ações de Configurações Financeiras (Mão de obra e perfil)
  const updateProfile = async (
    salario_desejado: number,
    dias_trabalhados: number,
    horas_trabalhadas: number,
    custos_fixos: number
  ) => {
    if (!profile) return;
    const updated = {
      ...profile,
      salario_desejado,
      dias_trabalhados,
      horas_trabalhadas,
      custos_fixos
    };
    setProfile(updated);

    if (isPlaceholder) {
      localDb.setItem('precificaalim_profiles', JSON.stringify(updated));
    } else {
      const { error } = await supabase
        .from('profiles')
        .update({
          salario_desejado,
          dias_trabalhados,
          horas_trabalhadas,
          custos_fixos
        })
        .eq('id', profile.id);
      if (error) throw error;
    }
  };

  // 5. Ações de Itens de Custo Fixo
  const addCustoItem = async (nome: string, valor: number) => {
    if (!userId) return;
    const newCusto: Omit<ItemCustoFixo, 'id'> = {
      user_id: userId,
      nome,
      valor
    };

    if (isPlaceholder) {
      const custoComId: ItemCustoFixo = { ...newCusto, id: 'custo-' + Date.now() };
      const updated = [...custosItens, custoComId];
      setCustosItens(updated);
      localDb.setItem('precificaalim_custos_itens', JSON.stringify(updated));
    } else {
      const { data, error } = await supabase
        .from('custos_fixos_itens')
        .insert([newCusto])
        .select()
        .single();
      if (error) throw error;
      if (data) setCustosItens([...custosItens, data]);
    }
  };

  const updateCustoItem = async (id: string, valor: number) => {
    const updated = custosItens.map(item => {
      if (item.id === id) {
        return { ...item, valor };
      }
      return item;
    });

    setCustosItens(updated);

    if (isPlaceholder) {
      localDb.setItem('precificaalim_custos_itens', JSON.stringify(updated));
    } else {
      const { error } = await supabase
        .from('custos_fixos_itens')
        .update({ valor })
        .eq('id', id);
      if (error) throw error;
    }
  };

  const deleteCustoItem = async (id: string) => {
    const updated = custosItens.filter(item => item.id !== id);
    setCustosItens(updated);

    if (isPlaceholder) {
      localDb.setItem('precificaalim_custos_itens', JSON.stringify(updated));
    } else {
      const { error } = await supabase
        .from('custos_fixos_itens')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  };

  // 6. Motor Matemático de Precificação
  const getCalculosReceita = (receita: Receita) => {
    const totalCustosFixos = custosItens.reduce((sum, item) => sum + item.valor, 0);
    const fatorPerda = receita.fator_perda || 0;

    // Valor hora da mão de obra
    const totalHorasMes = (profile?.dias_trabalhados || 22) * (profile?.horas_trabalhadas || 8);
    const valorHoraMaoDeObra = totalHorasMes > 0 ? (profile?.salario_desejado || 0) / totalHorasMes : 0;
    
    // Custo fixo por hora baseado na soma
    const valorHoraCustoFixo = totalHorasMes > 0 ? totalCustosFixos / totalHorasMes : 0;

    // Custos da receita baseada no tempo de preparo
    const custoTempoMaoDeObra = valorHoraMaoDeObra * (receita.tempo_preparo / 60);
    const custoTempoCustoFixo = valorHoraCustoFixo * (receita.tempo_preparo / 60);

    // Custo dos ingredientes e embalagens
    let custoIngredientesBruto = 0;
    let custoIngredientesHistoricoBruto = 0;
    let custoEmbalagens = 0;
    let custoEmbalagensHistorico = 0;

    receita.ingredientes.forEach(ing => {
      const insumo = insumos.find(i => i.id === ing.insumo_id);
      if (insumo && insumo.quantidade_embalagem > 0) {
        const custoUnitario = insumo.preco_pago / insumo.quantidade_embalagem;
        const custoItem = custoUnitario * ing.quantidade;

        const histPrecos = getPrecosHistoricos(ing.insumo_id);
        const precoAnterior = histPrecos.length > 1 ? histPrecos[1] : insumo.preco_pago;
        const custoUnitarioHistorico = precoAnterior / insumo.quantidade_embalagem;
        const custoItemHistorico = custoUnitarioHistorico * ing.quantidade;

        if (insumo.tipo === 'embalagem') {
          custoEmbalagens += custoItem;
          custoEmbalagensHistorico += custoItemHistorico;
        } else {
          custoIngredientesBruto += custoItem;
          custoIngredientesHistoricoBruto += custoItemHistorico;
        }
      }
    });

    // Aplica o fator de perda somente sobre os ingredientes da massa
    const multiplicadorPerda = 1 + (fatorPerda / 100);
    const custoIngredientes = custoIngredientesBruto * multiplicadorPerda;
    const custoIngredientesHistorico = custoIngredientesHistoricoBruto * multiplicadorPerda;

    const custoTotal = custoIngredientes + custoEmbalagens + custoTempoMaoDeObra + custoTempoCustoFixo;
    const custoTotalHistorico = custoIngredientesHistorico + custoEmbalagensHistorico + custoTempoMaoDeObra + custoTempoCustoFixo;

    const percentualImpacto = custoTotalHistorico > 0
      ? ((custoTotal - custoTotalHistorico) / custoTotalHistorico) * 100
      : 0;

    // Custo unitário por rendimento da receita
    const custoUnitario = receita.rendimento > 0 ? custoTotal / receita.rendimento : custoTotal;

    // Custo unitário por peso (em gramas)
    const rendimentoPeso = receita.rendimento_peso || 0;
    const custoPorGrama = rendimentoPeso > 0 ? custoTotal / rendimentoPeso : 0;
    const custoPorCemGramas = custoPorGrama * 100;
    const custoPorQuilo = custoPorGrama * 1000;

    // Preço de venda ideal para atingir a margem de lucro alvo desejada usando markup multiplicativo da planilha (por fora)
    const precoVendaIdeal = custoTotal * (1 + (receita.margem_alvo / 100));

    // Preço de venda ideal unitário (por porção)
    const precoVendaIdealUnitario = receita.rendimento > 0 ? precoVendaIdeal / receita.rendimento : precoVendaIdeal;

    // Preço de venda ideal por peso (100g e kg)
    const precoVendaIdealPorGrama = rendimentoPeso > 0 ? precoVendaIdeal / rendimentoPeso : 0;
    const precoVendaIdealPorCemGramas = precoVendaIdealPorGrama * 100;
    const precoVendaIdealPorQuilo = precoVendaIdealPorGrama * 1000;

    // Margem projetada real com base no preço de venda praticado (sobre o faturamento)
    const margemRealProjetada = receita.preco_venda_praticado > 0 
      ? ((receita.preco_venda_praticado - custoTotal) / receita.preco_venda_praticado) * 100
      : 0;

    const margemRealHistorica = receita.preco_venda_praticado > 0
      ? ((receita.preco_venda_praticado - custoTotalHistorico) / receita.preco_venda_praticado) * 100
      : 0;

    const metaMensal = (profile?.salario_desejado || 0) + totalCustosFixos;
    const precoPraticadoUnitario = receita.preco_venda_praticado / (receita.rendimento || 1);
    const custoVariavelUnitario = (custoIngredientes + custoEmbalagens) / (receita.rendimento || 1);
    const margemContribuicaoUnitaria = precoPraticadoUnitario - custoVariavelUnitario;
    const margemContribuicaoLote = receita.preco_venda_praticado - (custoIngredientes + custoEmbalagens);
    const pontoEquilibrioUnidades = margemContribuicaoUnitaria > 0 ? metaMensal / margemContribuicaoUnitaria : Infinity;
    const pontoEquilibrioReceitas = margemContribuicaoLote > 0 ? metaMensal / margemContribuicaoLote : Infinity;

    return {
      custoIngredientes,
      custoEmbalagens,
      custoTempoMaoDeObra,
      custoTempoCustoFixo,
      custoTotal,
      custoTotalHistorico,
      custoUnitario,
      custoPorGrama,
      custoPorCemGramas,
      custoPorQuilo,
      precoVendaIdeal,
      precoVendaIdealUnitario,
      precoVendaIdealPorCemGramas,
      precoVendaIdealPorQuilo,
      margemRealProjetada,
      margemRealHistorica,
      diferencaCusto: custoTotal - custoTotalHistorico,
      percentualImpacto,
      metaMensal,
      precoPraticadoUnitario,
      custoVariavelUnitario,
      margemContribuicaoUnitaria,
      margemContribuicaoLote,
      pontoEquilibrioUnidades,
      pontoEquilibrioReceitas
    };
  };

  return {
    profile,
    insumos,
    receitas,
    historicoPrecos,
    custosItens,
    loading,
    addInsumo,
    updateInsumo,
    deleteInsumo,
    addReceita,
    deleteReceita,
    updateReceita,
    updateProfile,
    addCustoItem,
    updateCustoItem,
    deleteCustoItem,
    getCalculosReceita,
    getPrecosHistoricos,
    carregarInsumosTeste,
    limparECarregarInsumosTeste,
    limparTodosInsumos,
    importarInsumosLote
  };
}
