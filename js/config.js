// ==================== CONFIGURAÇÕES GLOBAIS ====================
const CONFIG = {
  VERSAO: '3.3.1',
  NOME_APP: 'Competição BJJ - CBJJ/IBJJF',
  ANO_ATUAL: new Date().getFullYear()
};

// ==================== TABELAS OFICIAIS CBJJ/IBJJF ====================
// Referência: tabelas oficiais com kimono (Gi)

// Categorias por Idade — nomes e faixas conforme tabela CBJJ
const CATEGORIAS_IDADE = [
  { nome: "Pré-Mirim",        idadeMin:  4, idadeMax:  5, faixas: ["Branca", "Cinza"] },
  { nome: "Mirim",            idadeMin:  6, idadeMax:  7, faixas: ["Branca", "Cinza"] },
  { nome: "Infantil 1",       idadeMin:  8, idadeMax:  9, faixas: ["Branca", "Cinza", "Amarela", "Laranja", "Verde"] },
  { nome: "Infantil 2",       idadeMin: 10, idadeMax: 11, faixas: ["Branca", "Cinza", "Amarela", "Laranja", "Verde"] },
  { nome: "Infanto Juvenil 1",idadeMin: 12, idadeMax: 13, faixas: ["Branca", "Cinza", "Amarela", "Laranja", "Verde"] },
  { nome: "Infanto Juvenil 2",idadeMin: 14, idadeMax: 15, faixas: ["Branca", "Cinza", "Amarela", "Laranja", "Verde"] },
  { nome: "Juvenil",          idadeMin: 16, idadeMax: 17, faixas: ["Branca", "Azul", "Roxa"] },
  { nome: "Adulto",           idadeMin: 18, idadeMax: 29, faixas: ["Branca", "Azul", "Roxa", "Marrom", "Preta"] },
  { nome: "Master 1",         idadeMin: 30, idadeMax: 35, faixas: ["Branca", "Azul", "Roxa", "Marrom", "Preta"] },
  { nome: "Master 2",         idadeMin: 36, idadeMax: 40, faixas: ["Branca", "Azul", "Roxa", "Marrom", "Preta"] },
  { nome: "Master 3",         idadeMin: 41, idadeMax: 45, faixas: ["Branca", "Azul", "Roxa", "Marrom", "Preta"] },
  { nome: "Master 4",         idadeMin: 46, idadeMax: 50, faixas: ["Branca", "Azul", "Roxa", "Marrom", "Preta"] },
  { nome: "Master 5",         idadeMin: 51, idadeMax: 55, faixas: ["Branca", "Azul", "Roxa", "Marrom", "Preta"] },
  { nome: "Master 6",         idadeMin: 56, idadeMax: 99, faixas: ["Branca", "Azul", "Roxa", "Marrom", "Preta"] }
];

// ── Adulto / Master (GI com kimono) ──────────────────────────
const CATEGORIAS_PESO_MASC = [
  { nome: "Galo",          pesoMax:  57.5 },
  { nome: "Pluma",         pesoMax:  64.0 },
  { nome: "Pena",          pesoMax:  70.0 },
  { nome: "Leve",          pesoMax:  76.0 },
  { nome: "Médio",         pesoMax:  82.3 },
  { nome: "Meio-Pesado",   pesoMax:  88.3 },
  { nome: "Pesado",        pesoMax:  94.3 },
  { nome: "Super-Pesado",  pesoMax: 100.5 },
  { nome: "Pesadíssimo",   pesoMax: 999   }
];

const CATEGORIAS_PESO_FEM = [
  { nome: "Galo",          pesoMax:  48.5 },
  { nome: "Pluma",         pesoMax:  53.5 },
  { nome: "Pena",          pesoMax:  58.5 },
  { nome: "Leve",          pesoMax:  64.0 },
  { nome: "Médio",         pesoMax:  69.0 },
  { nome: "Meio-Pesado",   pesoMax:  74.0 },
  { nome: "Pesado",        pesoMax:  79.3 },
  { nome: "Super-Pesado",  pesoMax:  84.3 },
  { nome: "Pesadíssimo",   pesoMax: 999   }
];

// ── Tabelas de peso — TABELA OFICIAL CBJJ ────────────────────
// Fonte: Tabela de Pesos CBJJ (campeonato.jj.com.br)
// Obs.: pesos referem-se ao MÁXIMO da categoria (com ou sem kimono+faixa)
// Faixas 4/5 a 12/13 anos: mesma tabela para M e F
// A partir de 14/15 anos: tabelas separadas por sexo
const CATEGORIAS_PESO_KIDS = {

  // ── Pré-Mirim (4/5 anos) — M e F iguais ─────────────────────
  // Galo 14,7 | Pluma 17,9 | Pena 20,0 | Leve 23,0 | Médio 26,0
  // Meio-Pesado 29,0 | Pesado 32,0 | Super-Pesado 35,0 | Pes +35,0
  'Pré-Mirim': {
    M: [
      { nome: "Galo",         pesoMax:  14.7 },
      { nome: "Pluma",        pesoMax:  17.9 },
      { nome: "Pena",         pesoMax:  20.0 },
      { nome: "Leve",         pesoMax:  23.0 },
      { nome: "Médio",        pesoMax:  26.0 },
      { nome: "Meio-Pesado",  pesoMax:  29.0 },
      { nome: "Pesado",       pesoMax:  32.0 },
      { nome: "Super-Pesado", pesoMax:  35.0 },
      { nome: "Pesadíssimo",  pesoMax: 999   }
    ],
    F: [
      { nome: "Galo",         pesoMax:  14.7 },
      { nome: "Pluma",        pesoMax:  17.9 },
      { nome: "Pena",         pesoMax:  20.0 },
      { nome: "Leve",         pesoMax:  23.0 },
      { nome: "Médio",        pesoMax:  26.0 },
      { nome: "Meio-Pesado",  pesoMax:  29.0 },
      { nome: "Pesado",       pesoMax:  32.0 },
      { nome: "Super-Pesado", pesoMax:  35.0 },
      { nome: "Pesadíssimo",  pesoMax: 999   }
    ]
  },

  // ── Mirim (6/7 anos) — M e F iguais ─────────────────────────
  // Galo 18,2 | Pluma 21,0 | Pena 24,0 | Leve 27,2 | Médio 30,2
  // Meio-Pesado 33,2 | Pesado 36,2 | Super-Pesado 39,3 | Pes +39,3
  'Mirim': {
    M: [
      { nome: "Galo",         pesoMax:  18.2 },
      { nome: "Pluma",        pesoMax:  21.0 },
      { nome: "Pena",         pesoMax:  24.0 },
      { nome: "Leve",         pesoMax:  27.2 },
      { nome: "Médio",        pesoMax:  30.2 },
      { nome: "Meio-Pesado",  pesoMax:  33.2 },
      { nome: "Pesado",       pesoMax:  36.2 },
      { nome: "Super-Pesado", pesoMax:  39.3 },
      { nome: "Pesadíssimo",  pesoMax: 999   }
    ],
    F: [
      { nome: "Galo",         pesoMax:  18.2 },
      { nome: "Pluma",        pesoMax:  21.0 },
      { nome: "Pena",         pesoMax:  24.0 },
      { nome: "Leve",         pesoMax:  27.2 },
      { nome: "Médio",        pesoMax:  30.2 },
      { nome: "Meio-Pesado",  pesoMax:  33.2 },
      { nome: "Pesado",       pesoMax:  36.2 },
      { nome: "Super-Pesado", pesoMax:  39.3 },
      { nome: "Pesadíssimo",  pesoMax: 999   }
    ]
  },

  // ── Infantil 1 (8/9 anos) — M e F iguais ────────────────────
  // Galo 24,0 | Pluma 27,0 | Pena 30,2 | Leve 33,2 | Médio 36,2
  // Meio-Pesado 39,2 | Pesado 42,3 | Super-Pesado 45,3 | Pes +45,3
  'Infantil 1': {
    M: [
      { nome: "Galo",         pesoMax:  24.0 },
      { nome: "Pluma",        pesoMax:  27.0 },
      { nome: "Pena",         pesoMax:  30.2 },
      { nome: "Leve",         pesoMax:  33.2 },
      { nome: "Médio",        pesoMax:  36.2 },
      { nome: "Meio-Pesado",  pesoMax:  39.2 },
      { nome: "Pesado",       pesoMax:  42.3 },
      { nome: "Super-Pesado", pesoMax:  45.3 },
      { nome: "Pesadíssimo",  pesoMax: 999   }
    ],
    F: [
      { nome: "Galo",         pesoMax:  24.0 },
      { nome: "Pluma",        pesoMax:  27.0 },
      { nome: "Pena",         pesoMax:  30.2 },
      { nome: "Leve",         pesoMax:  33.2 },
      { nome: "Médio",        pesoMax:  36.2 },
      { nome: "Meio-Pesado",  pesoMax:  39.2 },
      { nome: "Pesado",       pesoMax:  42.3 },
      { nome: "Super-Pesado", pesoMax:  45.3 },
      { nome: "Pesadíssimo",  pesoMax: 999   }
    ]
  },

  // ── Infantil 2 (10/11 anos) — M e F iguais ──────────────────
  // Galo 32,2 | Pluma 36,2 | Pena 40,3 | Leve 44,3 | Médio 48,3
  // Meio-Pesado 52,5 | Pesado 56,5 | Super-Pesado 60,5 | Pes +60,5
  'Infantil 2': {
    M: [
      { nome: "Galo",         pesoMax:  32.2 },
      { nome: "Pluma",        pesoMax:  36.2 },
      { nome: "Pena",         pesoMax:  40.3 },
      { nome: "Leve",         pesoMax:  44.3 },
      { nome: "Médio",        pesoMax:  48.3 },
      { nome: "Meio-Pesado",  pesoMax:  52.5 },
      { nome: "Pesado",       pesoMax:  56.5 },
      { nome: "Super-Pesado", pesoMax:  60.5 },
      { nome: "Pesadíssimo",  pesoMax: 999   }
    ],
    F: [
      { nome: "Galo",         pesoMax:  32.2 },
      { nome: "Pluma",        pesoMax:  36.2 },
      { nome: "Pena",         pesoMax:  40.3 },
      { nome: "Leve",         pesoMax:  44.3 },
      { nome: "Médio",        pesoMax:  48.3 },
      { nome: "Meio-Pesado",  pesoMax:  52.5 },
      { nome: "Pesado",       pesoMax:  56.5 },
      { nome: "Super-Pesado", pesoMax:  60.5 },
      { nome: "Pesadíssimo",  pesoMax: 999   }
    ]
  },

  // ── Infanto Juvenil 1 (12/13 anos) — M e F iguais ───────────
  // Galo 36,2 | Pluma 40,3 | Pena 44,3 | Leve 48,3 | Médio 52,3
  // Meio-Pesado 56,5 | Pesado 60,5 | Super-Pesado 65,0 | Pes +65,0
  'Infanto Juvenil 1': {
    M: [
      { nome: "Galo",         pesoMax:  36.2 },
      { nome: "Pluma",        pesoMax:  40.3 },
      { nome: "Pena",         pesoMax:  44.3 },
      { nome: "Leve",         pesoMax:  48.3 },
      { nome: "Médio",        pesoMax:  52.3 },
      { nome: "Meio-Pesado",  pesoMax:  56.5 },
      { nome: "Pesado",       pesoMax:  60.5 },
      { nome: "Super-Pesado", pesoMax:  65.0 },
      { nome: "Pesadíssimo",  pesoMax: 999   }
    ],
    F: [
      { nome: "Galo",         pesoMax:  36.2 },
      { nome: "Pluma",        pesoMax:  40.3 },
      { nome: "Pena",         pesoMax:  44.3 },
      { nome: "Leve",         pesoMax:  48.3 },
      { nome: "Médio",        pesoMax:  52.3 },
      { nome: "Meio-Pesado",  pesoMax:  56.5 },
      { nome: "Pesado",       pesoMax:  60.5 },
      { nome: "Super-Pesado", pesoMax:  65.0 },
      { nome: "Pesadíssimo",  pesoMax: 999   }
    ]
  },

  // ── Infanto Juvenil 2 (14/15 anos) — M e F DIFERENTES ───────
  // M: Galo 44,3 | Pluma 48,3 | Pena 52,5 | Leve 56,5 | Médio 60,5
  //    Meio-Pesado 65,0 | Pesado 69,0 | Super-Pesado 73,0 | Pes +73,0
  // F: Galo 40,3 | Pluma 44,3 | Pena 48,3 | Leve 52,5 | Médio 56,5
  //    Meio-Pesado 60,5 | Pesado 65,0 | Super-Pesado 69,0 | Pes +69,0
  'Infanto Juvenil 2': {
    M: [
      { nome: "Galo",         pesoMax:  44.3 },
      { nome: "Pluma",        pesoMax:  48.3 },
      { nome: "Pena",         pesoMax:  52.5 },
      { nome: "Leve",         pesoMax:  56.5 },
      { nome: "Médio",        pesoMax:  60.5 },
      { nome: "Meio-Pesado",  pesoMax:  65.0 },
      { nome: "Pesado",       pesoMax:  69.0 },
      { nome: "Super-Pesado", pesoMax:  73.0 },
      { nome: "Pesadíssimo",  pesoMax: 999   }
    ],
    F: [
      { nome: "Galo",         pesoMax:  40.3 },
      { nome: "Pluma",        pesoMax:  44.3 },
      { nome: "Pena",         pesoMax:  48.3 },
      { nome: "Leve",         pesoMax:  52.5 },
      { nome: "Médio",        pesoMax:  56.5 },
      { nome: "Meio-Pesado",  pesoMax:  60.5 },
      { nome: "Pesado",       pesoMax:  65.0 },
      { nome: "Super-Pesado", pesoMax:  69.0 },
      { nome: "Pesadíssimo",  pesoMax: 999   }
    ]
  },

  // ── Juvenil (16/17 anos) — M e F DIFERENTES ─────────────────
  // M: Galo 53,5 | Pluma 58,5 | Pena 64,0 | Leve 69,0 | Médio 74,0
  //    Meio-Pesado 79,3 | Pesado 84,3 | Super-Pesado 89,3 | Pes +89,3
  // F: Galo 44,3 | Pluma 48,3 | Pena 52,5 | Leve 56,5 | Médio 60,5
  //    Meio-Pesado 65,0 | Pesado 69,0 | Super-Pesado 73,0 | Pes +73,0
  'Juvenil': {
    M: [
      { nome: "Galo",         pesoMax:  53.5 },
      { nome: "Pluma",        pesoMax:  58.5 },
      { nome: "Pena",         pesoMax:  64.0 },
      { nome: "Leve",         pesoMax:  69.0 },
      { nome: "Médio",        pesoMax:  74.0 },
      { nome: "Meio-Pesado",  pesoMax:  79.3 },
      { nome: "Pesado",       pesoMax:  84.3 },
      { nome: "Super-Pesado", pesoMax:  89.3 },
      { nome: "Pesadíssimo",  pesoMax: 999   }
    ],
    F: [
      { nome: "Galo",         pesoMax:  44.3 },
      { nome: "Pluma",        pesoMax:  48.3 },
      { nome: "Pena",         pesoMax:  52.5 },
      { nome: "Leve",         pesoMax:  56.5 },
      { nome: "Médio",        pesoMax:  60.5 },
      { nome: "Meio-Pesado",  pesoMax:  65.0 },
      { nome: "Pesado",       pesoMax:  69.0 },
      { nome: "Super-Pesado", pesoMax:  73.0 },
      { nome: "Pesadíssimo",  pesoMax: 999   }
    ]
  }
};

// Retorna a tabela de pesos correta para a categoria de idade e sexo informados
function getTabKids(nomeCategoria, sexo) {
  const s = (sexo || '').toUpperCase().startsWith('F') ? 'F' : 'M';
  const grp = CATEGORIAS_PESO_KIDS[nomeCategoria];
  if (grp) return grp[s] || grp['M'];
  // Adulto / Master — usa tabela padrão
  return s === 'F' ? CATEGORIAS_PESO_FEM : CATEGORIAS_PESO_MASC;
}

// Retorna todos os pesos disponíveis para a categoria de idade + sexo
function getPesosPorCategoria(nomeCategoria, sexo) {
  return getTabKids(nomeCategoria, sexo);
}

// Determina a categoria de peso pelo peso do atleta, categoria de idade e sexo
function categorizarPeso(pesoKg, nomeCategoria, sexo) {
  const tabela = getTabKids(nomeCategoria, sexo);
  const cat = tabela.find(c => pesoKg <= c.pesoMax);
  return cat ? cat.nome : tabela[tabela.length - 1].nome;
}

// Alias para compatibilidade com código legado
const CATEGORIAS_PESO_INFANTIL = CATEGORIAS_PESO_KIDS['Infantil 1']['M'];

// ==================== ESTADO GLOBAL ====================
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
