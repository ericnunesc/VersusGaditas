// ==================== CONFIGURAÇÕES GLOBAIS ====================
const CONFIG = {
  VERSAO: '3.3.0',
  NOME_APP: 'Competição BJJ - CBJJ/IBJJF',
  ANO_ATUAL: new Date().getFullYear()
};

// ==================== TABELAS OFICIAIS CBJJ/IBJJF ====================

// Categorias por Idade
const CATEGORIAS_IDADE = [
  { nome: "Pré-Mirim", idadeMin: 4, idadeMax: 5, faixas: ["Branca"] },
  { nome: "Mirim 1", idadeMin: 6, idadeMax: 7, faixas: ["Branca", "Cinza", "Amarela"] },
  { nome: "Mirim 2", idadeMin: 8, idadeMax: 9, faixas: ["Branca", "Cinza", "Amarela"] },
  { nome: "Infantil 1", idadeMin: 10, idadeMax: 11, faixas: ["Branca", "Cinza", "Amarela", "Laranja"] },
  { nome: "Infantil 2", idadeMin: 12, idadeMax: 13, faixas: ["Branca", "Cinza", "Amarela", "Laranja"] },
  { nome: "Infanto-Juvenil", idadeMin: 14, idadeMax: 15, faixas: ["Branca", "Cinza", "Amarela", "Laranja", "Verde"] },
  { nome: "Juvenil", idadeMin: 16, idadeMax: 17, faixas: ["Branca", "Azul", "Roxa"] },
  { nome: "Adulto", idadeMin: 18, idadeMax: 29, faixas: ["Branca", "Azul", "Roxa", "Marrom", "Preta"] },
  { nome: "Master 1", idadeMin: 30, idadeMax: 35, faixas: ["Branca", "Azul", "Roxa", "Marrom", "Preta"] },
  { nome: "Master 2", idadeMin: 36, idadeMax: 40, faixas: ["Branca", "Azul", "Roxa", "Marrom", "Preta"] },
  { nome: "Master 3", idadeMin: 41, idadeMax: 45, faixas: ["Branca", "Azul", "Roxa", "Marrom", "Preta"] },
  { nome: "Master 4", idadeMin: 46, idadeMax: 50, faixas: ["Branca", "Azul", "Roxa", "Marrom", "Preta"] },
  { nome: "Master 5", idadeMin: 51, idadeMax: 55, faixas: ["Branca", "Azul", "Roxa", "Marrom", "Preta"] },
  { nome: "Master 6", idadeMin: 56, idadeMax: 99, faixas: ["Branca", "Azul", "Roxa", "Marrom", "Preta"] }
];

// Categorias de Peso - Masculino Adulto/Master (GI) — tabela oficial CBJJ/IBJJF
const CATEGORIAS_PESO_MASC = [
  { nome: "Galo",          pesoMax: 57.5 },
  { nome: "Pluma",         pesoMax: 64.0 },
  { nome: "Pena",          pesoMax: 70.0 },
  { nome: "Leve",          pesoMax: 76.0 },
  { nome: "Médio",         pesoMax: 82.3 },
  { nome: "Meio-Pesado",   pesoMax: 88.3 },
  { nome: "Pesado",        pesoMax: 94.3 },
  { nome: "Super-Pesado",  pesoMax: 100.5 },
  { nome: "Pesadíssimo",   pesoMax: 999 }
];

// Categorias de Peso - Feminino Adulto/Master (GI) — tabela oficial CBJJ/IBJJF
const CATEGORIAS_PESO_FEM = [
  { nome: "Galo",          pesoMax: 48.5 },
  { nome: "Pluma",         pesoMax: 53.5 },
  { nome: "Pena",          pesoMax: 58.5 },
  { nome: "Leve",          pesoMax: 64.0 },
  { nome: "Médio",         pesoMax: 69.0 },
  { nome: "Meio-Pesado",   pesoMax: 74.0 },
  { nome: "Pesado",        pesoMax: 79.3 },
  { nome: "Super-Pesado",  pesoMax: 999 }
];

// Tabelas de peso por grupo de idade — CBJJ/IBJJF (Gi)
// Cada chave = nome da categoria de idade; cada valor = { M: [...], F: [...] }
const CATEGORIAS_PESO_KIDS = {
  'Pré-Mirim': {
    M: [
      { nome: "Pluma",        pesoMax: 16 },
      { nome: "Leve",         pesoMax: 19 },
      { nome: "Médio",        pesoMax: 22 },
      { nome: "Pesado",       pesoMax: 25 },
      { nome: "Super Pesado", pesoMax: 999 }
    ],
    F: [
      { nome: "Pluma",        pesoMax: 16 },
      { nome: "Leve",         pesoMax: 19 },
      { nome: "Médio",        pesoMax: 22 },
      { nome: "Pesado",       pesoMax: 25 },
      { nome: "Super Pesado", pesoMax: 999 }
    ]
  },
  'Mirim 1': {
    M: [
      { nome: "Pluma",        pesoMax: 20 },
      { nome: "Leve",         pesoMax: 24 },
      { nome: "Médio",        pesoMax: 28 },
      { nome: "Pesado",       pesoMax: 33 },
      { nome: "Super Pesado", pesoMax: 999 }
    ],
    F: [
      { nome: "Pluma",        pesoMax: 18 },
      { nome: "Leve",         pesoMax: 22 },
      { nome: "Médio",        pesoMax: 26 },
      { nome: "Pesado",       pesoMax: 30 },
      { nome: "Super Pesado", pesoMax: 999 }
    ]
  },
  'Mirim 2': {
    M: [
      { nome: "Pluma",        pesoMax: 25 },
      { nome: "Leve",         pesoMax: 30 },
      { nome: "Médio",        pesoMax: 35 },
      { nome: "Pesado",       pesoMax: 40 },
      { nome: "Super Pesado", pesoMax: 999 }
    ],
    F: [
      { nome: "Pluma",        pesoMax: 23 },
      { nome: "Leve",         pesoMax: 27 },
      { nome: "Médio",        pesoMax: 31 },
      { nome: "Pesado",       pesoMax: 36 },
      { nome: "Super Pesado", pesoMax: 999 }
    ]
  },
  'Infantil 1': {
    M: [
      { nome: "Pluma",        pesoMax: 30 },
      { nome: "Leve",         pesoMax: 36 },
      { nome: "Médio",        pesoMax: 42 },
      { nome: "Pesado",       pesoMax: 49 },
      { nome: "Super Pesado", pesoMax: 999 }
    ],
    F: [
      { nome: "Pluma",        pesoMax: 28 },
      { nome: "Leve",         pesoMax: 33 },
      { nome: "Médio",        pesoMax: 38 },
      { nome: "Pesado",       pesoMax: 44 },
      { nome: "Super Pesado", pesoMax: 999 }
    ]
  },
  'Infantil 2': {
    M: [
      { nome: "Pluma",        pesoMax: 36 },
      { nome: "Leve",         pesoMax: 43 },
      { nome: "Médio",        pesoMax: 50 },
      { nome: "Pesado",       pesoMax: 58 },
      { nome: "Super Pesado", pesoMax: 999 }
    ],
    F: [
      { nome: "Pluma",        pesoMax: 32 },
      { nome: "Leve",         pesoMax: 38 },
      { nome: "Médio",        pesoMax: 44 },
      { nome: "Pesado",       pesoMax: 51 },
      { nome: "Super Pesado", pesoMax: 999 }
    ]
  },
  'Infanto-Juvenil': {
    M: [
      { nome: "Galo",         pesoMax: 43 },
      { nome: "Pluma",        pesoMax: 50 },
      { nome: "Leve",         pesoMax: 57 },
      { nome: "Médio",        pesoMax: 64 },
      { nome: "Meio-Pesado",  pesoMax: 71 },
      { nome: "Pesado",       pesoMax: 79 },
      { nome: "Super Pesado", pesoMax: 88 },
      { nome: "Pesadíssimo",  pesoMax: 999 }
    ],
    F: [
      { nome: "Galo",         pesoMax: 39 },
      { nome: "Pluma",        pesoMax: 44 },
      { nome: "Leve",         pesoMax: 50 },
      { nome: "Médio",        pesoMax: 57 },
      { nome: "Meio-Pesado",  pesoMax: 64 },
      { nome: "Pesado",       pesoMax: 72 },
      { nome: "Super Pesado", pesoMax: 999 }
    ]
  },
  'Juvenil': {
    M: [
      { nome: "Galo",         pesoMax: 52.5 },
      { nome: "Pluma",        pesoMax: 57.5 },
      { nome: "Pena",         pesoMax: 63.5 },
      { nome: "Leve",         pesoMax: 69.5 },
      { nome: "Médio",        pesoMax: 76.5 },
      { nome: "Meio-Pesado",  pesoMax: 82.3 },
      { nome: "Pesado",       pesoMax: 88.3 },
      { nome: "Super-Pesado", pesoMax: 94.3 },
      { nome: "Pesadíssimo",  pesoMax: 999 }
    ],
    F: [
      { nome: "Galo",         pesoMax: 44.3 },
      { nome: "Pluma",        pesoMax: 48.5 },
      { nome: "Pena",         pesoMax: 52.5 },
      { nome: "Leve",         pesoMax: 57.5 },
      { nome: "Médio",        pesoMax: 62.5 },
      { nome: "Meio-Pesado",  pesoMax: 67.5 },
      { nome: "Pesado",       pesoMax: 72.5 },
      { nome: "Super-Pesado", pesoMax: 999 }
    ]
  }
};

// Retorna a tabela de pesos correta para categorias infantis/juvenis
function getTabKids(nomeCategoria, sexo) {
  const s = (sexo || '').toUpperCase().startsWith('F') ? 'F' : 'M';
  const grp = CATEGORIAS_PESO_KIDS[nomeCategoria];
  if (grp) return grp[s] || grp['M'];
  return s === 'F' ? CATEGORIAS_PESO_FEM : CATEGORIAS_PESO_MASC;
}

// Alias para compatibilidade com código legado
const CATEGORIAS_PESO_INFANTIL = CATEGORIAS_PESO_KIDS['Infantil 1']['M'];

// Estado global do app
let appState = {
  atletas: [],
  historico: [],
  competicaoAtual: {
    id: null,
    nome: "",
    data: "",
    pontuacaoEquipes: new Map(),
    categoriasFinalizadas: [],
    status: "em_andamento"
  },
  rankingAnual: new Map(),
  competicoesFinalizadas: [],
  configs: {
    anoAtual: CONFIG.ANO_ATUAL
  }
};

let proximoId = 1;
let competicaoId = 1;