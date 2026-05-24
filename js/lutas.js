// ==================== CONTROLE DE LUTAS E PONTUAÇÃO ====================

const TABELA_PONTUACAO_CBJJ = {
  'Branca': { vantagem: 1, derrubada: 2, passagem: 3, montada: 4, costas: 4, submissao: 'vencimento' },
  'Azul': { vantagem: 1, derrubada: 2, passagem: 3, montada: 4, costas: 4, submissao: 'vencimento' },
  'Roxa': { vantagem: 1, derrubada: 2, passagem: 3, montada: 4, costas: 4, submissao: 'vencimento' },
  'Marrom': { vantagem: 1, derrubada: 2, passagem: 3, montada: 4, costas: 4, submissao: 'vencimento' },
  'Preta': { vantagem: 1, derrubada: 2, passagem: 3, montada: 4, costas: 4, submissao: 'vencimento' }
};

function iniciarLuta(chaveCategoria, lutaId) {
  const categoria = torneioAtual.categorias.find(c => c.chave === chaveCategoria);
  if (!categoria) return;
  
  const luta = categoria.lutas.find(l => l.id === lutaId);
  if (!luta) return;
  
  luta.status = 'em_andamento';
  luta.horaInicio = new Date().toISOString();
  
  salvarEstadoTorneio();
  mostrarToast('⏱️ Luta iniciada!', 'sucesso');
}

function pausarLuta(chaveCategoria, lutaId) {
  const categoria = torneioAtual.categorias.find(c => c.chave === chaveCategoria);
  if (!categoria) return;
  
  const luta = categoria.lutas.find(l => l.id === lutaId);
  if (!luta) return;
  
  luta.status = 'pausada';
  salvarEstadoTorneio();
  mostrarToast('⏸️ Luta pausada!', 'info');
}

function retomarLuta(chaveCategoria, lutaId) {
  const categoria = torneioAtual.categorias.find(c => c.chave === chaveCategoria);
  if (!categoria) return;
  
  const luta = categoria.lutas.find(l => l.id === lutaId);
  if (!luta) return;
  
  luta.status = 'em_andamento';
  salvarEstadoTorneio();
  mostrarToast('▶️ Luta retomada!', 'sucesso');
}

function registrarPonto(chaveCategoria, lutaId, atletaLado, tipoPonto) {
  const categoria = torneioAtual.categorias.find(c => c.chave === chaveCategoria);
  if (!categoria) return false;
  
  const luta = categoria.lutas.find(l => l.id === lutaId);
  if (!luta) return false;
  
  const faixa = atletaLado === 'A' ? luta.atletaA.faixa : luta.atletaB.faixa;
  const pontos = TABELA_PONTUACAO_CBJJ[faixa][tipoPonto] || 0;
  
  luta.pontos[atletaLado] += pontos;
  salvarEstadoTorneio();
  
  mostrarToast(`+${pontos} pontos para ${atletaLado === 'A' ? luta.atletaA.nome : luta.atletaB.nome}`, 'info');
  return true;
}

function finalizarLutaComVencedor(chaveCategoria, lutaId, vencedorLado, motivo = 'pontos') {
  const categoria = torneioAtual.categorias.find(c => c.chave === chaveCategoria);
  if (!categoria) return false;
  
  const luta = categoria.lutas.find(l => l.id === lutaId);
  if (!luta) return false;
  
  const vencedor = vencedorLado === 'A' ? luta.atletaA : luta.atletaB;
  const pontuacao = luta.pontos[vencedorLado];
  
  luta.vencedor = vencedor;
  luta.status = 'finalizada';
  luta.finalizada = true;
  luta.motivo = motivo;
  luta.horaFim = new Date().toISOString();
  
  if (luta.horaInicio) {
    const duracao = Math.round((new Date(luta.horaFim) - new Date(luta.horaInicio)) / 60000);
    luta.duracaoReal = duracao;
    registrarDuracaoReal(luta, duracao);
  }
  
  const academia = vencedor.academia;
  const pontuacaoAtual = torneioAtual.pontuacaoEquipes.get(academia) || 0;
  torneioAtual.pontuacaoEquipes.set(academia, pontuacaoAtual + 1);
  
  salvarEstadoTorneio();
  mostrarToast(`🏆 ${vencedor.nome} venceu por ${motivo}!`, 'sucesso');
  
  return true;
}

function atualizarAreaCategoria(chaveCategoria, novaArea) {
  const categoria = torneioAtual.categorias.find(c => c.chave === chaveCategoria);
  if (!categoria) return;
  
  categoria.area = novaArea;
  salvarEstadoTorneio();
  mostrarToast(`📍 Área atualizada para ${novaArea}`, 'sucesso');
}

function obterLutasPorStatus(chaveCategoria, status) {
  const categoria = torneioAtual.categorias.find(c => c.chave === chaveCategoria);
  if (!categoria) return [];
  
  return categoria.lutas.filter(l => l.status === status);
}

function obterLutasAoVivo() {
  const lutas = [];
  for (const categoria of torneioAtual.categorias) {
    lutas.push(...categoria.lutas.filter(l => l.status === 'em_andamento'));
  }
  return lutas;
}

function obterProximasLutas(limite = 5) {
  const lutas = [];
  for (const categoria of torneioAtual.categorias) {
    lutas.push(...categoria.lutas.filter(l => l.status === 'pendente'));
  }
  return lutas.slice(0, limite);
}

window.iniciarLuta = iniciarLuta;
window.pausarLuta = pausarLuta;
window.retomarLuta = retomarLuta;
window.registrarPonto = registrarPonto;
window.finalizarLutaComVencedor = finalizarLutaComVencedor;
window.atualizarAreaCategoria = atualizarAreaCategoria;
window.obterLutasPorStatus = obterLutasPorStatus;
window.obterLutasAoVivo = obterLutasAoVivo;
window.obterProximasLutas = obterProximasLutas;

console.log('✅ lutas.js carregado');