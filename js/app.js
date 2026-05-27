// ==================== TABS ====================

function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const panes = document.querySelectorAll('.tab-pane');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            panes.forEach(p => p.classList.remove('active'));
            const activePane = document.getElementById(`tab-${tabId}`);
            if (activePane) activePane.classList.add('active');
            
            if (tabId === 'atletas' && typeof atualizarListaAtletas === 'function') atualizarListaAtletas();
            if (tabId === 'ranking' && typeof atualizarRankingFull === 'function') atualizarRankingFull();
            if (tabId === 'historico' && typeof atualizarHistoricoCompeticoes === 'function') atualizarHistoricoCompeticoes();
            
            // Corrigido: a aba é "torneio"
            if (tabId === 'torneio' && typeof renderizarChaveamento === 'function') renderizarChaveamento();
        });
    });
}

function initModal() {
    const modal = document.getElementById('modal-atleta');
    if (!modal) return;
    modal.addEventListener('click', (e) => {
        if (e.target === modal && typeof fecharModalAtleta === 'function') fecharModalAtleta();
    });
}

// ==================== RANKING ====================

function atualizarRankingFull() {
    if (!window.appState) return;

    // ===== RANKING ANUAL DE EQUIPES =====
    const rankingEquipes = Array.from(appState.rankingAnual.entries())
        .map(([nome, pontos]) => ({ nome, pontos }))
        .sort((a, b) => b.pontos - a.pontos);

    const containerEquipes = document.getElementById('ranking-full-list');
    if (containerEquipes) {
        if (rankingEquipes.length === 0) {
            containerEquipes.innerHTML = '<div class="empty-state">Nenhuma competição finalizada ainda</div>';
        } else {
            containerEquipes.innerHTML = `
                <div class="ranking-header"><span>POS</span><span>EQUIPE</span><span>PONTOS</span></div>
                ${rankingEquipes.map((eq, idx) => `
                    <div class="ranking-row">
                        <div class="ranking-pos ${idx===0?'top-1':idx===1?'top-2':idx===2?'top-3':''}">
                            ${idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':`${idx+1}º`}
                        </div>
                        <div class="ranking-nome"><strong>${eq.nome}</strong></div>
                        <div class="ranking-pontos">${eq.pontos} pts</div>
                    </div>
                `).join('')}
            `;
        }
    }

    // ===== RANKING ANUAL DE ATLETAS =====
    const rankingAtletas = Array.from((appState.rankingAnualAtletas || new Map()).entries())
        .map(([id, v]) => ({ id, ...v }))
        .sort((a, b) => b.pontos - a.pontos);

    const containerAtletas = document.getElementById('ranking-atletas-list');
    if (containerAtletas) {
        if (rankingAtletas.length === 0) {
            containerAtletas.innerHTML = '<div class="empty-state">Nenhum atleta pontuou ainda</div>';
        } else {
            containerAtletas.innerHTML = `
                <div class="ranking-header"><span>POS</span><span>ATLETA</span><span>EQUIPE</span><span>PTS</span></div>
                ${rankingAtletas.map((a, idx) => `
                    <div class="ranking-row">
                        <div class="ranking-pos ${idx===0?'top-1':idx===1?'top-2':idx===2?'top-3':''}">
                            ${idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':`${idx+1}º`}
                        </div>
                        <div class="ranking-nome"><strong>${a.nome}</strong></div>
                        <div class="ranking-nome" style="font-size:0.75rem;color:#8A9CB0">${a.academia||''}</div>
                        <div class="ranking-pontos">${a.pontos} pts</div>
                    </div>
                `).join('')}
            `;
        }
    }

    // ===== HISTÓRICO POR COMPETIÇÃO =====
    const containerHistComp = document.getElementById('historico-competicoes-ranking');
    if (containerHistComp) {
        const comps = (appState.competicoesFinalizadas || []).slice().reverse();
        if (comps.length === 0) {
            containerHistComp.innerHTML = '<div class="empty-state">Nenhuma competição finalizada</div>';
        } else {
            containerHistComp.innerHTML = comps.map(comp => `
                <div class="historico-card">
                    <div class="historico-header">
                        <span class="historico-data">📅 ${comp.data || ''}</span>
                        <span class="historico-categoria-badge">${comp.nome}</span>
                    </div>
                    <p style="font-size:0.75rem;color:#8A9CB0;margin:6px 0 8px">🏆 Ranking de Equipes</p>
                    ${(comp.rankingEquipes || []).slice(0,5).map((eq, i) => `
                        <div class="ranking-mini-item ${i===0?'gold':i===1?'silver':i===2?'bronze':''}">
                            ${i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}º`} ${eq.nome} — ${eq.pontos} pts
                        </div>
                    `).join('')}
                </div>
            `).join('');
        }
    }
}

// ==================== NOVA COMPETIÇÃO ====================

// abrirModalNovaCompeticao é definida em index.html e não deve ser sobrescrita aqui

// ==================== DASHBOARD ====================

function atualizarDashboard() {
    if (!window.appState) return;
    
    const atletas = JSON.parse(localStorage.getItem('gaditas_atletas') || '[]');
    const torneio = window.torneioAtual || {
        competicaoAtiva: false,
        nomeCompeticao: '',
        pontuacaoEquipes: new Map()
    };
    
    const totalAtletas = document.getElementById('total-atletas-dash');
    const totalCompeticoes = document.getElementById('total-competicoes-dash');
    const totalEquipes = document.getElementById('total-equipes-dash');
    const totalPontos = document.getElementById('total-pontos-dash');
    
    if (totalAtletas) totalAtletas.textContent = atletas.length;
    if (totalCompeticoes) totalCompeticoes.textContent = appState.competicoesFinalizadas.length;
    if (totalEquipes) totalEquipes.textContent = new Set(atletas.map(a => a.academia)).size;
    if (totalPontos) totalPontos.textContent = Array.from(appState.rankingAnual.values()).reduce((s, v) => s + v, 0);
    
    const statusDiv = document.getElementById('status-competicao');
    if (statusDiv) {
        statusDiv.innerHTML = torneio.competicaoAtiva ?
            `
                <div class="status-competicao-ativa">
                    <span>🏆 COMPETIÇÃO ATIVA: ${torneio.nomeCompeticao}</span>
                    <button onclick="finalizarCompeticao()" class="btn-small">🏁 Finalizar</button>
                </div>
              ` :
            `
                <div class="status-competicao-inativa">
                    <span>⏸️ Nenhuma competição ativa</span>
                    <button onclick="abrirModalNovaCompeticao()" class="btn-primary">➕ Nova Competição</button>
                </div>
              `;
    }
    
    const rankingContainer = document.getElementById('ranking-competicao-atual');
    const nomeComp = document.getElementById('competicao-nome');
    if (rankingContainer) {
        if (!torneio.competicaoAtiva) {
            if (nomeComp) nomeComp.textContent = 'Nenhuma competição ativa';
            rankingContainer.innerHTML = '<div class="empty-state">Inicie uma nova competição</div>';
        } else {
            if (nomeComp) nomeComp.textContent = torneio.nomeCompeticao;
            const ranking = Array.from(torneio.pontuacaoEquipes.entries())
                .map(([nome, pontos]) => ({ nome, pontos }))
                .sort((a, b) => b.pontos - a.pontos);
            
            rankingContainer.innerHTML = ranking.length === 0 ?
                '<div class="empty-state">Aguardando resultados</div>' :
                `
                    <div class="ranking-header"><span>POS</span><span>EQUIPE</span><span>PONTOS</span></div>
                    ${ranking.map((eq, idx) => `
                        <div class="ranking-row">
                            <div class="ranking-pos ${idx === 0 ? 'top-1' : idx === 1 ? 'top-2' : idx === 2 ? 'top-3' : ''}">
                                ${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`}
                            </div>
                            <div>${eq.nome}</div>
                            <div class="ranking-pontos">${eq.pontos}</div>
                        </div>
                    `).join('')}
                  `;
        }
    }
    
    const rankingAnualContainer = document.getElementById('ranking-anual');
    if (rankingAnualContainer) {
        const rankingAnual = Array.from(appState.rankingAnual.entries())
            .map(([nome, pontos]) => ({ nome, pontos }))
            .sort((a, b) => b.pontos - a.pontos);
        
        rankingAnualContainer.innerHTML = rankingAnual.length === 0 ?
            '<div class="empty-state">Nenhuma pontuação anual</div>' :
            `
                <div class="ranking-header"><span>POS</span><span>EQUIPE</span><span>PONTOS</span></div>
                ${rankingAnual.map((eq, idx) => `
                    <div class="ranking-row">
                        <div class="ranking-pos ${idx === 0 ? 'top-1' : idx === 1 ? 'top-2' : idx === 2 ? 'top-3' : ''}">
                            ${idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`}
                        </div>
                        <div>${eq.nome}</div>
                        <div class="ranking-pontos">${eq.pontos}</div>
                    </div>
                `).join('')}
              `;
    }
}

// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Competição BJJ v3.0.0 iniciando...');
    
    try { if (typeof carregarDados === 'function') carregarDados(); } catch (e) { console.error(e); }
    try { if (typeof carregarTabelasReferencia === 'function') carregarTabelasReferencia(); } catch (e) { console.error(e); }
    try { if (typeof carregarDuracaoFaixas === 'function') carregarDuracaoFaixas(); } catch (e) { console.error(e); }
    try { if (typeof carregarEstadoSalvo === 'function') carregarEstadoSalvo(); } catch (e) { console.error(e); }
    
    if (typeof inicializarSincronizacao === 'function') {
        try { inicializarSincronizacao(); } catch (e) { console.error(e); }
    }
    
    const areasSalvas = localStorage.getItem('gaditas_areas_luta');
    if (areasSalvas) {
        try { window.areasLuta = JSON.parse(areasSalvas); } catch (_) {}
    }
    
    const listaAreas = document.getElementById('lista-areas');
    if (listaAreas && window.areasLuta) {
        listaAreas.innerHTML = `<div>📋 Áreas: ${window.areasLuta.join(' | ')}</div>`;
    }
    
    if (typeof atualizarListaAtletas === 'function') atualizarListaAtletas();
    atualizarDashboard();
    if (typeof atualizarHistoricoCompeticoes === 'function') atualizarHistoricoCompeticoes();
    
    if (window.torneioAtual?.competicaoAtiva && (window.torneioAtual?.categorias?.length || 0) > 0) {
        renderizarChaveamento();
    }
    
    initTabs();
    initModal();
    
    const temaCheckbox = document.getElementById('tema-escuro');
    if (temaCheckbox) {
        temaCheckbox.addEventListener('change', (e) => {
            document.body.style.background = e.target.checked ? '#1A1A2E' : '#F5F7FA';
            document.body.style.color = e.target.checked ? '#FFFFFF' : '#1A2C3E';
        });
    }
    
    if (typeof mostrarToast === 'function') mostrarToast('✅ Competição BJJ v3.0.0', 'sucesso');
});

// ==================== EXPORTAR ====================

window.initTabs = initTabs;
window.atualizarRankingFull = atualizarRankingFull;
window.atualizarDashboard = atualizarDashboard;

console.log('✅ app.js carregado - v3.0.0 (corrigido)');