// ==================== SINCRONIZAÇÃO EM TEMPO REAL ====================

const SYNC_CHANNEL = 'gaditas_torneios_sync';
let broadcastChannel = null;

function inicializarSincronizacao() {
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      broadcastChannel = new BroadcastChannel(SYNC_CHANNEL);
      broadcastChannel.onmessage = (event) => {
        console.log('📡 Mensagem recebida:', event.data);
        processarMensagemSync(event.data);
      };
      console.log('✅ BroadcastChannel inicializado');
    } catch (e) {
      console.warn('⚠️ BroadcastChannel não disponível');
    }
  }
  
  window.addEventListener('storage', (event) => {
    if (event.key === 'gaditas_torneio_atual') {
      console.log('📡 Torneio atualizado em outra aba');
      carregarEstadoSalvo();
      if (typeof atualizarDashboard === 'function') atualizarDashboard();
    }
  });
  
  mostrarToast('🔄 Sincronização ativada', 'info');
}

function processarMensagemSync(mensagem) {
  const { tipo, dados } = mensagem;
  
  switch (tipo) {
    case 'luta_finalizada':
      console.log('Luta finalizada em outra aba:', dados);
      carregarEstadoSalvo();
      break;
    case 'rodada_avancada':
      console.log('Rodada avançada em outra aba:', dados);
      carregarEstadoSalvo();
      break;
    case 'competicao_iniciada':
      console.log('Competição iniciada em outra aba:', dados);
      carregarEstadoSalvo();
      break;
    case 'competicao_finalizada':
      console.log('Competição finalizada em outra aba:', dados);
      carregarEstadoSalvo();
      break;
  }
}

function enviarMensagemSync(tipo, dados) {
  const mensagem = { tipo, dados, timestamp: Date.now() };
  
  if (broadcastChannel) {
    broadcastChannel.postMessage(mensagem);
  }
  
  localStorage.setItem(`gaditas_sync_${tipo}`, JSON.stringify(mensagem));
}

function sincronizarLutaFinalizada(chaveCategoria, lutaId, vencedorId) {
  enviarMensagemSync('luta_finalizada', {
    chaveCategoria,
    lutaId,
    vencedorId,
    timestamp: new Date().toISOString()
  });
}

function sincronizarRodadaAvancada(chaveCategoria) {
  enviarMensagemSync('rodada_avancada', {
    chaveCategoria,
    timestamp: new Date().toISOString()
  });
}

function sincronizarCompeticaoIniciada(nomeCompeticao) {
  enviarMensagemSync('competicao_iniciada', {
    nomeCompeticao,
    timestamp: new Date().toISOString()
  });
}

function sincronizarCompeticaoFinalizada() {
  enviarMensagemSync('competicao_finalizada', {
    timestamp: new Date().toISOString()
  });
}

window.inicializarSincronizacao = inicializarSincronizacao;
window.sincronizarLutaFinalizada = sincronizarLutaFinalizada;
window.sincronizarRodadaAvancada = sincronizarRodadaAvancada;
window.sincronizarCompeticaoIniciada = sincronizarCompeticaoIniciada;
window.sincronizarCompeticaoFinalizada = sincronizarCompeticaoFinalizada;

console.log('✅ sincronizacao.js carregado');