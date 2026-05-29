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
  { nome: "Leve",          pesoMax: 70.0 },
  { nome: "Médio",         pesoMax: 76.0 },
  { nome: "Meio-Pesado",   pesoMax: 82.3 },
  { nome: "Pesado",        pesoMax: 88.3 },
  { nome: "Super Pesado",  pesoMax: 94.3 },
  { nome: "Pesadíssimo",   pesoMax: 100.5 },
  { nome: "Absoluto",      pesoMax: 999 }
];

// Categorias de Peso - Feminino Adulto/Master (GI) — tabela oficial CBJJ/IBJJF
const CATEGORIAS_PESO_FEM = [
  { nome: "Galo",          pesoMax: 48.5 },
  { nome: "Pluma",         pesoMax: 53.5 },
  { nome: "Leve",          pesoMax: 58.5 },
  { nome: "Médio",         pesoMax: 64.0 },
  { nome: "Meio-Pesado",   pesoMax: 69.0 },
  { nome: "Pesado",        pesoMax: 74.0 },
  { nome: "Super Pesado",  pesoMax: 79.3 },
  { nome: "Pesadíssimo",   pesoMax: 84.3 },
  { nome: "Absoluto",      pesoMax: 999 }
];

// Categorias de Peso para Infantil/Juvenil — limites CBJJ por faixa etária
// Pré-Mirim a Infanto-Juvenil usam faixas leves; Juvenil se aproxima do adulto
const CATEGORIAS_PESO_INFANTIL = [
  { nome: "Pluma",         pesoMax: 30 },
  { nome: "Leve",          pesoMax: 40 },
  { nome: "Médio",         pesoMax: 50 },
  { nome: "Pesado",        pesoMax: 65 },
  { nome: "Super Pesado",  pesoMax: 999 }
];

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