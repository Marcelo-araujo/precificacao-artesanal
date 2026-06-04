const INSUMOS_TESTE = [
  { nome: 'Água', tipo: 'ingrediente' },
  { nome: 'Glacê Real Mix', tipo: 'ingrediente' },
  { nome: 'Fita de Natal 22MM', tipo: 'embalagem' },
  { nome: 'Fecho Prático', tipo: 'embalagem' }
];

// Dados simulados do localStorage antigo
const rawInsumos = [
  { id: 'insumo-teste-0-1717500000000', nome: 'Água', tipo: 'ingrediente' },
  { id: 'insumo-teste-2-1717500000000', nome: 'Fita de Natal 22MM', tipo: 'embalagem' },
  { id: 'insumo-manual-1', nome: 'Pote personalizado', tipo: 'embalagem' }
];

const rawReceitas = [
  {
    id: 'receita-1',
    nome: 'Bolo de Teste',
    ingredientes: [
      { insumo_id: 'insumo-teste-0-1717500000000', quantidade: 200 },
      { insumo_id: 'insumo-teste-2-1717500000000', quantidade: 50 },
      { insumo_id: 'insumo-manual-1', quantidade: 1 }
    ]
  }
];

// Processo de migração idêntico ao do useData.ts
const idMap = {};
let migrouInsumos = false;

const migratedInsumos = rawInsumos.map((ins) => {
  const idxTeste = INSUMOS_TESTE.findIndex(t => t.nome.toLowerCase() === ins.nome.toLowerCase());
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

console.log('--- Insumos Migrados ---');
console.log(JSON.stringify(migratedInsumos, null, 2));
console.log('--- idMap ---');
console.log(idMap);

let parsedReceitas = rawReceitas.map((r) => ({
  ...r,
  fator_perda: r.fator_perda !== undefined ? r.fator_perda : 0,
  rendimento_peso: r.rendimento_peso !== undefined ? r.rendimento_peso : 0
}));

if (Object.keys(idMap).length > 0) {
  let migrouReceitas = false;
  parsedReceitas = parsedReceitas.map((r) => {
    let alterado = false;
    const novosIngredientes = r.ingredientes.map((ing) => {
      if (idMap[ing.insumo_id]) {
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
}

console.log('--- Receitas Migradas ---');
console.log(JSON.stringify(parsedReceitas, null, 2));
