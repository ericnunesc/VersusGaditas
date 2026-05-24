// ==================== INTERFACE E RELATÓRIOS ====================
// abrirModalAtleta e fecharModalAtleta continuam no seu atletas.js/base

function atualizarHistoricoCompeticoes() {
    const container = document.getElementById('historico-competicoes');
    if (!container || !window.appState) return;
    
    if (!appState.competicoesFinalizadas || appState.competicoesFinalizadas.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhuma competição finalizada</div>';
        return;
    }
    
    container.innerHTML = appState.competicoesFinalizadas.map(comp => `
        <div class="historico-card">
            <div class="historico-header">
                <span class="historico-data">📅 ${comp.data}</span>
                <span class="historico-categoria-badge">${comp.nome}</span>
            </div>
            <div class="ranking-mini-item gold">🥇 ${comp.ranking?.[0]?.nome || '-'} - ${comp.ranking?.[0]?.pontos || 0} pts</div>
            ${comp.ranking?.[1] ? `<div class="ranking-mini-item silver">🥈 ${comp.ranking[1].nome} - ${comp.ranking[1].pontos} pts</div>` : ''}
            ${comp.ranking?.[2] ? `<div class="ranking-mini-item bronze">🥉 ${comp.ranking[2].nome} - ${comp.ranking[2].pontos} pts</div>` : ''}
        </div>
    `).join('');
}

function exportarRankingCSV() {
    if (!window.appState) return;
    
    const ranking = Array.from(appState.rankingAnual.entries())
        .map(([nome, pontos]) => ({ nome, pontos }))
        .sort((a, b) => b.pontos - a.pontos);
    
    if (ranking.length === 0) {
        if (typeof mostrarToast === 'function') mostrarToast('Nenhuma pontuação para exportar!', 'erro');
        return;
    }
    
    const csv = 'Posição,Equipe,Pontos\n' + ranking.map((eq, idx) => `${idx + 1},${eq.nome},${eq.pontos}`).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ranking_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    if (typeof mostrarToast === 'function') mostrarToast('Ranking exportado!', 'sucesso');
}

window.atualizarHistoricoCompeticoes = atualizarHistoricoCompeticoes;
window.exportarRankingCSV = exportarRankingCSV;

console.log('✅ ui.js carregado (sem conflito de dashboard)');