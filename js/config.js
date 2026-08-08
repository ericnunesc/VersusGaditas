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

// ── Tabelas de peso por grupo de idade (Gi com kimono) ────────
// Valores EXATOS da tabela oficial CBJJ masculino (imagem de referência)
// Feminino: aproximado proporcional (CBJJ não publica tabela fem infantil unificada)
const CATEGORIAS_PESO_KIDS = {

  // ── Pré-Mirim (até 5 anos) ───────────────────────────────────
  // M: Pluma 14 | Leve 18 | Meio-Pesado 22 | Super-Pesado 26
  //    Pes 30 | A 32 | B 34 | C 36 | D 38 | E 40 | F 42 | G 44 | H >44
  'Pré-Mirim': {
    M: [
      { nome: "Pluma",           pesoMax: 14   },
      { nome: "Leve",            pesoMax: 18   },
      { nome: "Meio-Pesado",     pesoMax: 22   },
      { nome: "Super-Pesado",    pesoMax: 26   },
      { nome: "Pesadíssimo",     pesoMax: 30   },
      { nome: "Pesadíssimo A",   pesoMax: 32   },
      { nome: "Pesadíssimo B",   pesoMax: 34   },
      { nome: "Pesadíssimo C",   pesoMax: 36   },
      { nome: "Pesadíssimo D",   pesoMax: 38   },
      { nome: "Pesadíssimo E",   pesoMax: 40   },
      { nome: "Pesadíssimo F",   pesoMax: 42   },
      { nome: "Pesadíssimo G",   pesoMax: 44   },
      { nome: "Pesadíssimo H",   pesoMax: 999  }
    ],
    F: [
      { nome: "Pluma",           pesoMax: 14   },
      { nome: "Leve",            pesoMax: 18   },
      { nome: "Meio-Pesado",     pesoMax: 22   },
      { nome: "Super-Pesado",    pesoMax: 26   },
      { nome: "Pesadíssimo",     pesoMax: 30   },
      { nome: "Pesadíssimo A",   pesoMax: 32   },
      { nome: "Pesadíssimo B",   pesoMax: 34   },
      { nome: "Pesadíssimo C",   pesoMax: 36   },
      { nome: "Pesadíssimo D",   pesoMax: 38   },
      { nome: "Pesadíssimo E",   pesoMax: 40   },
      { nome: "Pesadíssimo F",   pesoMax: 42   },
      { nome: "Pesadíssimo G",   pesoMax: 44   },
      { nome: "Pesadíssimo H",   pesoMax: 999  }
    ]
  },

  // ── Mirim (6-7 anos) ─────────────────────────────────────────
  // M: Pluma 22 | Pena 24 | Leve 26 | Médio 28.5 | Meio-Pesado 30
  //    Pesado 32.5 | Super-Pesado 34 | Pes 38 | A 42 | B 46 | C 50
  //    D 54 | E 58 | F 62 | G 66 | H >66
  'Mirim': {
    M: [
      { nome: "Pluma",           pesoMax: 22   },
      { nome: "Pena",            pesoMax: 24   },
      { nome: "Leve",            pesoMax: 26   },
      { nome: "Médio",           pesoMax: 28.5 },
      { nome: "Meio-Pesado",     pesoMax: 30   },
      { nome: "Pesado",          pesoMax: 32.5 },
      { nome: "Super-Pesado",    pesoMax: 34   },
      { nome: "Pesadíssimo",     pesoMax: 38   },
      { nome: "Pesadíssimo A",   pesoMax: 42   },
      { nome: "Pesadíssimo B",   pesoMax: 46   },
      { nome: "Pesadíssimo C",   pesoMax: 50   },
      { nome: "Pesadíssimo D",   pesoMax: 54   },
      { nome: "Pesadíssimo E",   pesoMax: 58   },
      { nome: "Pesadíssimo F",   pesoMax: 62   },
      { nome: "Pesadíssimo G",   pesoMax: 66   },
      { nome: "Pesadíssimo H",   pesoMax: 999  }
    ],
    F: [
      { nome: "Pluma",           pesoMax: 20   },
      { nome: "Leve",            pesoMax: 24   },
      { nome: "Meio-Pesado",     pesoMax: 28   },
      { nome: "Super-Pesado",    pesoMax: 32   },
      { nome: "Pesadíssimo",     pesoMax: 36   },
      { nome: "Pesadíssimo A",   pesoMax: 40   },
      { nome: "Pesadíssimo B",   pesoMax: 44   },
      { nome: "Pesadíssimo C",   pesoMax: 48   },
      { nome: "Pesadíssimo D",   pesoMax: 52   },
      { nome: "Pesadíssimo E",   pesoMax: 56   },
      { nome: "Pesadíssimo F",   pesoMax: 60   },
      { nome: "Pesadíssimo G",   pesoMax: 64   },
      { nome: "Pesadíssimo H",   pesoMax: 999  }
    ]
  },

  // ── Infantil 1 (8-9 anos) — "Infantil A" na tabela CBJJ ─────
  // M: Pluma 28 | Pena 30.5 | Leve 33 | Médio 35.5 | Meio-Pesado 38
  //    Pesado 41.5 | Super-Pesado 43 | Pes 48 | A 53 | B 58 | C 63
  //    D 68 | E 73 | F 78 | G 83 | H >83
  'Infantil 1': {
    M: [
      { nome: "Pluma",           pesoMax: 28   },
      { nome: "Pena",            pesoMax: 30.5 },
      { nome: "Leve",            pesoMax: 33   },
      { nome: "Médio",           pesoMax: 35.5 },
      { nome: "Meio-Pesado",     pesoMax: 38   },
      { nome: "Pesado",          pesoMax: 41.5 },
      { nome: "Super-Pesado",    pesoMax: 43   },
      { nome: "Pesadíssimo",     pesoMax: 48   },
      { nome: "Pesadíssimo A",   pesoMax: 53   },
      { nome: "Pesadíssimo B",   pesoMax: 58   },
      { nome: "Pesadíssimo C",   pesoMax: 63   },
      { nome: "Pesadíssimo D",   pesoMax: 68   },
      { nome: "Pesadíssimo E",   pesoMax: 73   },
      { nome: "Pesadíssimo F",   pesoMax: 78   },
      { nome: "Pesadíssimo G",   pesoMax: 83   },
      { nome: "Pesadíssimo H",   pesoMax: 999  }
    ],
    F: [
      { nome: "Pluma",           pesoMax: 24   },
      { nome: "Leve",            pesoMax: 29   },
      { nome: "Meio-Pesado",     pesoMax: 33   },
      { nome: "Super-Pesado",    pesoMax: 38   },
      { nome: "Pesadíssimo",     pesoMax: 43   },
      { nome: "Pesadíssimo A",   pesoMax: 48   },
      { nome: "Pesadíssimo B",   pesoMax: 53   },
      { nome: "Pesadíssimo C",   pesoMax: 58   },
      { nome: "Pesadíssimo D",   pesoMax: 62   },
      { nome: "Pesadíssimo E",   pesoMax: 66   },
      { nome: "Pesadíssimo F",   pesoMax: 70   },
      { nome: "Pesadíssimo G",   pesoMax: 74   },
      { nome: "Pesadíssimo H",   pesoMax: 999  }
    ]
  },

  // ── Infantil 2 (10-11 anos) — "Infantil B" na tabela CBJJ ───
  // M: Pluma 34 | Pena 37 | Leve 39 | Médio 41.5 | Meio-Pesado 44
  //    Pesado 46.5 | Super-Pesado 49 | Pes 54 | A 59 | B 64 | C 69
  //    D 74 | E 79 | F 84 | G 89 | H >89
  'Infantil 2': {
    M: [
      { nome: "Pluma",           pesoMax: 34   },
      { nome: "Pena",            pesoMax: 37   },
      { nome: "Leve",            pesoMax: 39   },
      { nome: "Médio",           pesoMax: 41.5 },
      { nome: "Meio-Pesado",     pesoMax: 44   },
      { nome: "Pesado",          pesoMax: 46.5 },
      { nome: "Super-Pesado",    pesoMax: 49   },
      { nome: "Pesadíssimo",     pesoMax: 54   },
      { nome: "Pesadíssimo A",   pesoMax: 59   },
      { nome: "Pesadíssimo B",   pesoMax: 64   },
      { nome: "Pesadíssimo C",   pesoMax: 69   },
      { nome: "Pesadíssimo D",   pesoMax: 74   },
      { nome: "Pesadíssimo E",   pesoMax: 79   },
      { nome: "Pesadíssimo F",   pesoMax: 84   },
      { nome: "Pesadíssimo G",   pesoMax: 89   },
      { nome: "Pesadíssimo H",   pesoMax: 999  }
    ],
    F: [
      { nome: "Pluma",           pesoMax: 28   },
      { nome: "Leve",            pesoMax: 33   },
      { nome: "Meio-Pesado",     pesoMax: 38   },
      { nome: "Super-Pesado",    pesoMax: 43   },
      { nome: "Pesadíssimo",     pesoMax: 48   },
      { nome: "Pesadíssimo A",   pesoMax: 53   },
      { nome: "Pesadíssimo B",   pesoMax: 58   },
      { nome: "Pesadíssimo C",   pesoMax: 63   },
      { nome: "Pesadíssimo D",   pesoMax: 68   },
      { nome: "Pesadíssimo E",   pesoMax: 73   },
      { nome: "Pesadíssimo F",   pesoMax: 78   },
      { nome: "Pesadíssimo G",   pesoMax: 83   },
      { nome: "Pesadíssimo H",   pesoMax: 999  }
    ]
  },

  // ── Infanto Juvenil 1 (12-13 anos) — "Infanto Juvenil A" ────
  // M: Pluma 40 | Pena 42.5 | Leve 45 | Médio 47.5 | Meio-Pesado 50
  //    Pesado 52.5 | Super-Pesado 55 | Pes 60 | A 65 | B 70 | C 75
  //    D 80 | E 85 | F 90 | G 95 | H >95
  'Infanto Juvenil 1': {
    M: [
      { nome: "Pluma",           pesoMax: 40   },
      { nome: "Pena",            pesoMax: 42.5 },
      { nome: "Leve",            pesoMax: 45   },
      { nome: "Médio",           pesoMax: 47.5 },
      { nome: "Meio-Pesado",     pesoMax: 50   },
      { nome: "Pesado",          pesoMax: 52.5 },
      { nome: "Super-Pesado",    pesoMax: 55   },
      { nome: "Pesadíssimo",     pesoMax: 60   },
      { nome: "Pesadíssimo A",   pesoMax: 65   },
      { nome: "Pesadíssimo B",   pesoMax: 70   },
      { nome: "Pesadíssimo C",   pesoMax: 75   },
      { nome: "Pesadíssimo D",   pesoMax: 80   },
      { nome: "Pesadíssimo E",   pesoMax: 85   },
      { nome: "Pesadíssimo F",   pesoMax: 90   },
      { nome: "Pesadíssimo G",   pesoMax: 95   },
      { nome: "Pesadíssimo H",   pesoMax: 999  }
    ],
    F: [
      { nome: "Pluma",           pesoMax: 33   },
      { nome: "Leve",            pesoMax: 38   },
      { nome: "Meio-Pesado",     pesoMax: 43   },
      { nome: "Super-Pesado",    pesoMax: 48   },
      { nome: "Pesadíssimo",     pesoMax: 53   },
      { nome: "Pesadíssimo A",   pesoMax: 58   },
      { nome: "Pesadíssimo B",   pesoMax: 63   },
      { nome: "Pesadíssimo C",   pesoMax: 68   },
      { nome: "Pesadíssimo D",   pesoMax: 73   },
      { nome: "Pesadíssimo E",   pesoMax: 78   },
      { nome: "Pesadíssimo F",   pesoMax: 83   },
      { nome: "Pesadíssimo G",   pesoMax: 88   },
      { nome: "Pesadíssimo H",   pesoMax: 999  }
    ]
  },

  // ── Infanto Juvenil 2 (14-15 anos) ──────────────────────────
  'Infanto Juvenil 2': {
    M: [
      { nome: "Galo",            pesoMax: 44   },
      { nome: "Pluma",           pesoMax: 48   },
      { nome: "Pena",            pesoMax: 52   },
      { nome: "Leve",            pesoMax: 56   },
      { nome: "Médio",           pesoMax: 60   },
      { nome: "Meio-Pesado",     pesoMax: 64   },
      { nome: "Pesado",          pesoMax: 68   },
      { nome: "Super-Pesado",    pesoMax: 72.5 },
      { nome: "Pesadíssimo",     pesoMax: 999  }
    ],
    F: [
      { nome: "Galo",            pesoMax: 35   },
      { nome: "Pluma",           pesoMax: 39   },
      { nome: "Pena",            pesoMax: 43   },
      { nome: "Leve",            pesoMax: 47   },
      { nome: "Médio",           pesoMax: 51   },
      { nome: "Meio-Pesado",     pesoMax: 55   },
      { nome: "Pesado",          pesoMax: 59   },
      { nome: "Super-Pesado",    pesoMax: 63.5 },
      { nome: "Pesadíssimo",     pesoMax: 999  }
    ]
  },

  // ── Juvenil (16-17 anos) — com kimono ───────────────────────
  'Juvenil': {
    M: [
      { nome: "Galo",            pesoMax:  53.5 },
      { nome: "Pluma",           pesoMax:  59.0 },
      { nome: "Pena",            pesoMax:  64.0 },
      { nome: "Leve",            pesoMax:  69.0 },
      { nome: "Médio",           pesoMax:  74.3 },
      { nome: "Meio-Pesado",     pesoMax:  79.3 },
      { nome: "Pesado",          pesoMax:  84.3 },
      { nome: "Super-Pesado",    pesoMax:  89.5 },
      { nome: "Pesadíssimo",     pesoMax: 999   }
    ],
    F: [
      { nome: "Galo",            pesoMax:  44.0 },
      { nome: "Pluma",           pesoMax:  48.0 },
      { nome: "Pena",            pesoMax:  52.0 },
      { nome: "Leve",            pesoMax:  56.0 },
      { nome: "Médio",           pesoMax:  60.0 },
      { nome: "Meio-Pesado",     pesoMax:  64.0 },
      { nome: "Pesado",          pesoMax:  68.0 },
      { nome: "Super-Pesado",    pesoMax:  72.5 },
      { nome: "Pesadíssimo",     pesoMax: 999   }
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
