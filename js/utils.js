// ==================== FUNÇÕES AUXILIARES ====================

function calcularIdade(dataNascimento) {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade;
}

function mostrarToast(mensagem, tipo = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerHTML = `<span>${mensagem}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastFadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function salvarDados() {
    localStorage.setItem('gaditas_atletas', JSON.stringify(appState.atletas));
    localStorage.setItem('gaditas_ranking_anual', JSON.stringify(Array.from(appState.rankingAnual.entries())));
    localStorage.setItem('gaditas_competicoes', JSON.stringify(appState.competicoesFinalizadas));
    localStorage.setItem('gaditas_configs', JSON.stringify(appState.configs));
}

function carregarDados() {
    const atletasSalvos = localStorage.getItem('gaditas_atletas');
    if (atletasSalvos) {
        appState.atletas = JSON.parse(atletasSalvos);
        proximoId = Math.max(...appState.atletas.map(a => a.id), 0) + 1;
    }
    const rankingSalvo = localStorage.getItem('gaditas_ranking_anual');
    if (rankingSalvo) appState.rankingAnual = new Map(JSON.parse(rankingSalvo));

    const competicoesSalvas = localStorage.getItem('gaditas_competicoes');
    if (competicoesSalvas) appState.competicoesFinalizadas = JSON.parse(competicoesSalvas);

    const configsSalvas = localStorage.getItem('gaditas_configs');
    if (configsSalvas) appState.configs = { ...appState.configs, ...JSON.parse(configsSalvas) };
}

function embaralharArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

function exportarDados() {
    const dados = {
        atletas: appState.atletas,
        competicoes: appState.competicoesFinalizadas,
        rankingAnual: Array.from(appState.rankingAnual.entries()),
        data: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `gaditas_backup_${Date.now()}.json`;
    link.click();
    mostrarToast('Backup exportado!', 'sucesso');
}

function importarDados() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const dados = JSON.parse(event.target.result);
                if (dados.atletas) appState.atletas = dados.atletas;
                if (dados.competicoes) appState.competicoesFinalizadas = dados.competicoes;
                if (dados.rankingAnual) appState.rankingAnual = new Map(dados.rankingAnual);
                proximoId = Math.max(...appState.atletas.map(a => a.id), 0) + 1;
                salvarDados();
                atualizarListaAtletas();
                atualizarDashboard();
                atualizarHistoricoCompeticoes();
                mostrarToast('Dados importados com sucesso!', 'sucesso');
            } catch (err) {
                mostrarToast('Erro ao importar dados!', 'erro');
            }
        };
        reader.readAsText(input.files[0]);
    };
    input.click();
}

function limparHistorico() {
    if (confirm('Limpar todo o histórico de competições?')) {
        appState.competicoesFinalizadas = [];
        appState.rankingAnual.clear();
        salvarDados();
        if (typeof atualizarDashboard === 'function') atualizarDashboard();
        if (typeof atualizarHistoricoCompeticoes === 'function') atualizarHistoricoCompeticoes();
        mostrarToast('Histórico limpo!', 'sucesso');
    }
}

function resetarAno() {
    if (confirm('⚠️ Isso irá ZERAR todo o ranking anual e histórico. Continuar?')) {
        appState.rankingAnual.clear();
        appState.competicoesFinalizadas = [];
        salvarDados();
        if (typeof atualizarDashboard === 'function') atualizarDashboard();
        if (typeof atualizarHistoricoCompeticoes === 'function') atualizarHistoricoCompeticoes();
        mostrarToast('Ano resetado! Ranking zerado.', 'sucesso');
    }
}

// Expor globalmente
window.calcularIdade = calcularIdade;
window.mostrarToast = mostrarToast;
window.salvarDados = salvarDados;
window.carregarDados = carregarDados;
window.exportarDados = exportarDados;
window.importarDados = importarDados;
window.limparHistorico = limparHistorico;
window.resetarAno = resetarAno;

console.log('✅ utils.js carregado');
