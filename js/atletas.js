// ==================== CRUD DE ATLETAS ====================

// Equipes padrão do sistema
const EQUIPES_PADRAO = [
    'Gaditas', 'Alliance', 'Checkmat', 'GFTeam', 'Gracie Barra',
    'Atos', 'Dream Art', 'Nova União', 'BTT', 'Outro'
];

function popularSelectAcademia() {
    const select = document.getElementById('atleta-academia');
    if (!select) return;
    const atletasSalvos = JSON.parse(localStorage.getItem('gaditas_atletas') || '[]');
    const equipesExistentes = [...new Set(atletasSalvos.map(a => a.academia))];
    const todasEquipes = [...new Set([...equipesExistentes, ...EQUIPES_PADRAO])].sort();
    select.innerHTML = '<option value="">Selecione a equipe</option>' +
        todasEquipes.map(e => `<option value="${e}">${e}</option>`).join('');
}

function abrirModalAtleta() {
    console.log('🔧 abrirModalAtleta chamada');
    const modal = document.getElementById('modal-atleta');
    if (modal) {
        modal.style.display = 'flex';
        popularSelectAcademia();
        document.getElementById('atleta-nome').focus();
        
        const updatePreview = () => {
            const sexo = document.getElementById('atleta-sexo').value;
            const data = document.getElementById('atleta-data-nascimento').value;
            const faixa = document.getElementById('atleta-faixa').value;
            const peso = parseFloat(document.getElementById('atleta-peso').value);
            const previewDiv = document.getElementById('categoria-resultado');
            
            if (data && sexo && faixa && peso) {
                const idade = calcularIdade(data);
                const catIdade = determinarCategoriaIdade(idade);
                const catPeso = determinarCategoriaPeso(sexo, idade, peso, faixa);
                const faixaOk = faixaPermitida(faixa, catIdade);
                previewDiv.innerHTML = `<div class="preview-info"><p>📅 ${idade} anos → ${catIdade.nome}</p><p>⚖️ ${peso} kg → ${catPeso.nome}</p><p>${faixaOk ? '✅ Faixa permitida' : '⚠️ Faixa não permitida'}</p></div>`;
            }
        };
        
        document.getElementById('atleta-peso').oninput = updatePreview;
        document.getElementById('atleta-data-nascimento').onchange = updatePreview;
        document.getElementById('atleta-sexo').onchange = updatePreview;
        document.getElementById('atleta-faixa').onchange = updatePreview;
    }
}

function fecharModalAtleta() {
    const modal = document.getElementById('modal-atleta');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('atleta-nome').value = '';
        document.getElementById('atleta-sexo').value = '';
        document.getElementById('atleta-data-nascimento').value = '';
        document.getElementById('atleta-faixa').value = '';
        document.getElementById('atleta-peso').value = '';
        document.getElementById('atleta-academia').value = '';
        document.getElementById('categoria-resultado').innerHTML = '';
    }
}

function salvarAtleta() {
    console.log('🔧 salvarAtleta chamada');
    const nome = document.getElementById('atleta-nome').value.trim();
    const sexo = document.getElementById('atleta-sexo').value;
    const dataNascimento = document.getElementById('atleta-data-nascimento').value;
    const faixa = document.getElementById('atleta-faixa').value;
    const peso = parseFloat(document.getElementById('atleta-peso').value);
    const academia = document.getElementById('atleta-academia').value;
    
    if (!nome || !sexo || !dataNascimento || !faixa || !peso || !academia) {
        mostrarToast('Preencha todos os campos!', 'erro');
        return;
    }
    
    const idade = calcularIdade(dataNascimento);
    const categoriaIdade = determinarCategoriaIdade(idade);
    
    if (!faixaPermitida(faixa, categoriaIdade)) {
        mostrarToast(`Faixa ${faixa} não permitida para ${categoriaIdade.nome}`, 'erro');
        return;
    }
    
    const novoAtleta = {
        id: Date.now(),
        nome: nome,
        sexo: sexo,
        dataNascimento: dataNascimento,
        faixa: faixa,
        peso: peso,
        academia: academia,
        dataCadastro: new Date().toISOString()
    };
    
    // Carregar atletas existentes
    let atletas = JSON.parse(localStorage.getItem('gaditas_atletas') || '[]');
    atletas.push(novoAtleta);
    localStorage.setItem('gaditas_atletas', JSON.stringify(atletas));
    
    if (typeof appState !== 'undefined') {
        appState.atletas = atletas;
    }
    
    fecharModalAtleta();
    atualizarListaAtletas();
    if (typeof atualizarDashboard === 'function') atualizarDashboard();
    mostrarToast(`Atleta ${nome} cadastrado!`, 'sucesso');
}

function removerAtleta(id) {
    if (confirm('Remover este atleta?')) {
        let atletas = JSON.parse(localStorage.getItem('gaditas_atletas') || '[]');
        atletas = atletas.filter(a => a.id !== id);
        localStorage.setItem('gaditas_atletas', JSON.stringify(atletas));
        if (typeof appState !== 'undefined') appState.atletas = atletas;
        atualizarListaAtletas();
        if (typeof atualizarDashboard === 'function') atualizarDashboard();
        mostrarToast('Atleta removido!', 'sucesso');
    }
}

function editarAtleta(id) {
    let atletas = JSON.parse(localStorage.getItem('gaditas_atletas') || '[]');
    const atleta = atletas.find(a => a.id === id);
    if (!atleta) return;

    // Reutiliza o modal existente, preenchendo com os dados do atleta
    const modal = document.getElementById('modal-atleta');
    if (!modal) return;
    modal.style.display = 'flex';
    popularSelectAcademia();

    document.getElementById('atleta-nome').value = atleta.nome;

    // Mostrar foto existente
    if (typeof _fotoAtletaBase64 !== 'undefined') _fotoAtletaBase64 = null;
    const prev = document.getElementById('foto-atleta-preview');
    if (prev) {
        prev.innerHTML = atleta.foto
            ? `<img src="${atleta.foto}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`
            : '📷';
    }
    document.getElementById('atleta-sexo').value = atleta.sexo;
    document.getElementById('atleta-data-nascimento').value = atleta.dataNascimento;
    document.getElementById('atleta-faixa').value = atleta.faixa;
    document.getElementById('atleta-peso').value = atleta.peso;
    document.getElementById('atleta-academia').value = atleta.academia;

    // Marca o modal como modo edição
    modal.dataset.editandoId = id;

    // Override temporário do botão salvar para atualizar em vez de criar
    const btnSalvar = modal.querySelector('[onclick="salvarAtleta()"]') ||
                      modal.querySelector('button[class*="btn-primary"]');
    if (btnSalvar) {
        btnSalvar.setAttribute('onclick', `salvarEdicaoAtleta(${id})`);
        btnSalvar.textContent = '💾 Salvar Alterações';
    }
}

function salvarEdicaoAtleta(id) {
    const nome = document.getElementById('atleta-nome').value.trim();
    const sexo = document.getElementById('atleta-sexo').value;
    const dataNascimento = document.getElementById('atleta-data-nascimento').value;
    const faixa = document.getElementById('atleta-faixa').value;
    const peso = parseFloat(document.getElementById('atleta-peso').value);
    const academia = document.getElementById('atleta-academia').value;

    if (!nome || !sexo || !dataNascimento || !faixa || !peso || !academia) {
        mostrarToast('Preencha todos os campos!', 'erro'); return;
    }

    let atletas = JSON.parse(localStorage.getItem('gaditas_atletas') || '[]');
    const idx = atletas.findIndex(a => a.id === id);
    if (idx === -1) { mostrarToast('Atleta não encontrado!', 'erro'); return; }

    atletas[idx] = { ...atletas[idx], nome, sexo, dataNascimento, faixa, peso, academia,
        foto: (typeof _fotoAtletaBase64 !== 'undefined' && _fotoAtletaBase64) ? _fotoAtletaBase64 : atletas[idx].foto
    };
    localStorage.setItem('gaditas_atletas', JSON.stringify(atletas));
    if (typeof appState !== 'undefined') appState.atletas = atletas;

    // Restaura o botão para modo cadastro
    const modal = document.getElementById('modal-atleta');
    if (modal) {
        delete modal.dataset.editandoId;
        const btnSalvar = modal.querySelector('[onclick*="salvarEdicaoAtleta"]');
        if (btnSalvar) {
            btnSalvar.setAttribute('onclick', 'salvarAtleta()');
            btnSalvar.textContent = '✅ Salvar Atleta';
        }
    }

    fecharModalAtleta();
    atualizarListaAtletas();
    if (typeof atualizarDashboard === 'function') atualizarDashboard();
    mostrarToast(`Atleta ${nome} atualizado!`, 'sucesso');
}

function atualizarListaAtletas() {
    console.log('🔧 atualizarListaAtletas chamada');
    const container = document.getElementById('lista-atletas-container');
    const badge = document.getElementById('tab-badge-atletas');
    const totalAtletasDash = document.getElementById('total-atletas-dash');
    
    if (!container) return;
    
    let atletas = JSON.parse(localStorage.getItem('gaditas_atletas') || '[]');
    
    const filtroNome = document.getElementById('filtro-nome')?.value.toLowerCase() || '';
    const filtroSexo = document.getElementById('filtro-sexo')?.value || '';
    const filtroFaixa = document.getElementById('filtro-faixa')?.value || '';
    const filtroEquipe = document.getElementById('filtro-equipe')?.value || '';
    
    let atletasFiltrados = atletas.filter(a => {
        const matchNome = a.nome.toLowerCase().includes(filtroNome);
        const matchSexo = !filtroSexo || a.sexo === filtroSexo;
        const matchFaixa = !filtroFaixa || a.faixa === filtroFaixa;
        const matchEquipe = !filtroEquipe || a.academia === filtroEquipe;
        return matchNome && matchSexo && matchFaixa && matchEquipe;
    });
    
    if (badge) badge.textContent = atletas.length;
    if (totalAtletasDash) totalAtletasDash.textContent = atletas.length;
    
    const selectEquipe = document.getElementById('filtro-equipe');
    if (selectEquipe) {
        const equipesUnicas = [...new Set(atletas.map(a => a.academia))];
        selectEquipe.innerHTML = '<option value="">Todas as equipes</option>' +
            equipesUnicas.map(e => `<option value="${e}">${e}</option>`).join('');
    }
    
    if (atletasFiltrados.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhum atleta encontrado</div>';
        return;
    }
    
    container.innerHTML = atletasFiltrados.map(atleta => {
        const idade = calcularIdade(atleta.dataNascimento);
        const catIdade = determinarCategoriaIdade(idade);
        const catPeso = determinarCategoriaPeso(atleta.sexo, idade, atleta.peso, atleta.faixa);
        
        const fotoHtml = atleta.foto
            ? `<img src="${atleta.foto}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid #C9A03D;flex-shrink:0" />`
            : `<div style="width:48px;height:48px;border-radius:50%;background:#1A2C3E;border:1px solid #2A3F55;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0">🥋</div>`;

        return `
            <div class="atleta-card" style="display:flex;align-items:center;gap:10px">
                ${fotoHtml}
                <div class="atleta-info" style="flex:1">
                    <h4>${atleta.nome}</h4>
                    <p>🏢 ${atleta.academia}</p>
                    <p>🎂 ${idade} anos | ${catIdade.nome}</p>
                    <p>🥋 ${atleta.faixa} | ⚖️ ${atleta.peso} kg</p>
                    <p>📊 ${catPeso.nome}</p>
                </div>
                <div class="atleta-actions">
                    <button onclick="editarAtleta(${atleta.id})" class="btn-icon-small">✏️</button>
                    <button onclick="removerAtleta(${atleta.id})" class="btn-icon-small">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function resetarDadosExemplo() {
    console.log('🔧 resetarDadosExemplo chamada');
    const atletas = [
        { id: 1, nome: "João Silva", sexo: "M", dataNascimento: "1995-03-15", faixa: "Azul", peso: 75.5, academia: "Gaditas", dataCadastro: new Date().toISOString() },
        { id: 2, nome: "Carlos Souza", sexo: "M", dataNascimento: "1992-07-22", faixa: "Roxa", peso: 82.0, academia: "Checkmat", dataCadastro: new Date().toISOString() },
        { id: 3, nome: "Lucas Lima", sexo: "M", dataNascimento: "1998-01-10", faixa: "Azul", peso: 68.5, academia: "Gaditas", dataCadastro: new Date().toISOString() },
        { id: 4, nome: "Eric Lotta", sexo: "M", dataNascimento: "1988-05-18", faixa: "Preta", peso: 77.0, academia: "Gaditas", dataCadastro: new Date().toISOString() },
        { id: 5, nome: "Ana Beatriz", sexo: "F", dataNascimento: "1997-09-05", faixa: "Azul", peso: 58.0, academia: "Alliance", dataCadastro: new Date().toISOString() }
    ];
    localStorage.setItem('gaditas_atletas', JSON.stringify(atletas));
    if (typeof appState !== 'undefined') appState.atletas = atletas;
    atualizarListaAtletas();
    if (typeof atualizarDashboard === 'function') atualizarDashboard();
    mostrarToast('Dados de exemplo carregados!', 'sucesso');
}

function exportarAtletasCSV() {
    const atletas = JSON.parse(localStorage.getItem('gaditas_atletas') || '[]');
    if (atletas.length === 0) {
        mostrarToast('Nenhum atleta para exportar!', 'erro');
        return;
    }
    
    const cabecalho = ['ID', 'Nome', 'Sexo', 'Data Nascimento', 'Faixa', 'Peso', 'Academia'];
    const linhas = atletas.map(a => [a.id, a.nome, a.sexo, a.dataNascimento, a.faixa, a.peso, a.academia]);
    const csvContent = [cabecalho, ...linhas].map(row => row.join(',')).join('\n');
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `atletas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    mostrarToast('CSV exportado!', 'sucesso');
}

// Parser CSV compatível com RFC 4180 — suporta campos entre aspas com vírgulas internas
function parsearLinhaCSV(linha) {
    const cols = [];
    let atual = '';
    let dentroAspas = false;
    for (let i = 0; i < linha.length; i++) {
        const ch = linha[i];
        if (ch === '"') {
            if (dentroAspas && linha[i + 1] === '"') { atual += '"'; i++; }
            else { dentroAspas = !dentroAspas; }
        } else if (ch === ',' && !dentroAspas) {
            cols.push(atual.trim()); atual = '';
        } else {
            atual += ch;
        }
    }
    cols.push(atual.trim());
    return cols;
}

function importarAtletasCSV() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const texto = event.target.result;
            const linhas = texto.split('\n').slice(1);
            let atletas = JSON.parse(localStorage.getItem('gaditas_atletas') || '[]');
            let importados = 0;
            let erros = 0;
            
            for (const linha of linhas) {
                if (!linha.trim()) continue;
                const cols = parsearLinhaCSV(linha);
                if (cols.length >= 6) {
                    const peso = parseFloat(cols[5]);
                    if (!cols[1] && !cols[0]) { erros++; continue; }
                    atletas.push({
                        id: Date.now() + importados,
                        nome: (cols[1] || cols[0]).trim(),
                        sexo: (cols[2] || 'M').trim(),
                        dataNascimento: (cols[3] || '2000-01-01').trim(),
                        faixa: (cols[4] || 'Branca').trim(),
                        peso: isNaN(peso) ? 70 : peso,
                        academia: (cols[6] || 'Equipe').trim(),
                        dataCadastro: new Date().toISOString()
                    });
                    importados++;
                } else {
                    erros++;
                }
            }
            
            if (importados > 0) {
                localStorage.setItem('gaditas_atletas', JSON.stringify(atletas));
                if (typeof appState !== 'undefined') appState.atletas = atletas;
                atualizarListaAtletas();
                const msg = erros > 0 ? `${importados} atletas importados (${erros} linha(s) ignorada(s))` : `${importados} atletas importados!`;
                mostrarToast(msg, erros > 0 ? 'info' : 'sucesso');
            } else {
                mostrarToast('Nenhum atleta importado. Verifique o formato do CSV.', 'erro');
            }
        };
        reader.readAsText(file, 'UTF-8');
    };
    input.click();
}

// Função para carregar 19 atletas de teste
function carregarAtletasTeste() {
    const atletas = [
        { id: 1, nome: "João Silva", sexo: "M", dataNascimento: "1995-03-15", faixa: "Azul", peso: 72.5, academia: "Gaditas" },
        { id: 2, nome: "Carlos Souza", sexo: "M", dataNascimento: "1994-07-22", faixa: "Azul", peso: 71.0, academia: "Checkmat" },
        { id: 3, nome: "Lucas Lima", sexo: "M", dataNascimento: "1996-01-10", faixa: "Azul", peso: 73.5, academia: "Gaditas" },
        { id: 4, nome: "Rafael Mendes", sexo: "M", dataNascimento: "1995-11-05", faixa: "Azul", peso: 70.0, academia: "Alliance" },
        { id: 5, nome: "Thiago Santos", sexo: "M", dataNascimento: "1993-09-18", faixa: "Azul", peso: 74.0, academia: "GFTeam" },
        { id: 6, nome: "Bruno Alves", sexo: "M", dataNascimento: "1997-12-12", faixa: "Azul", peso: 71.5, academia: "Gaditas" },
        { id: 7, nome: "André Costa", sexo: "M", dataNascimento: "1992-04-03", faixa: "Roxa", peso: 84.0, academia: "Gaditas" },
        { id: 8, nome: "Felipe Rocha", sexo: "M", dataNascimento: "1993-06-15", faixa: "Roxa", peso: 86.5, academia: "Checkmat" },
        { id: 9, nome: "Gustavo Lima", sexo: "M", dataNascimento: "1991-08-22", faixa: "Roxa", peso: 83.0, academia: "Alliance" },
        { id: 10, nome: "Rodrigo Santos", sexo: "M", dataNascimento: "1994-10-30", faixa: "Roxa", peso: 85.5, academia: "Gaditas" },
        { id: 11, nome: "Eric Lotta", sexo: "M", dataNascimento: "1988-05-18", faixa: "Preta", peso: 67.0, academia: "Gaditas" },
        { id: 12, nome: "Marcelo Garcia", sexo: "M", dataNascimento: "1985-12-01", faixa: "Preta", peso: 66.5, academia: "Alliance" },
        { id: 13, nome: "Leandro Lo", sexo: "M", dataNascimento: "1989-08-10", faixa: "Preta", peso: 68.0, academia: "GFTeam" },
        { id: 14, nome: "Ana Beatriz", sexo: "F", dataNascimento: "1996-03-25", faixa: "Azul", peso: 62.0, academia: "Gaditas" },
        { id: 15, nome: "Carla Souza", sexo: "F", dataNascimento: "1995-07-14", faixa: "Azul", peso: 63.5, academia: "Checkmat" },
        { id: 16, nome: "Fernanda Rocha", sexo: "F", dataNascimento: "1997-09-05", faixa: "Azul", peso: 61.0, academia: "Gaditas" },
        { id: 17, nome: "Mariana Lima", sexo: "F", dataNascimento: "1994-11-28", faixa: "Azul", peso: 64.0, academia: "Alliance" },
        { id: 18, nome: "Patrícia Silva", sexo: "F", dataNascimento: "1989-02-20", faixa: "Roxa", peso: 58.0, academia: "Gaditas" },
        { id: 19, nome: "Juliana Costa", sexo: "F", dataNascimento: "1990-05-12", faixa: "Roxa", peso: 59.0, academia: "Checkmat" }
    ];
    localStorage.setItem('gaditas_atletas', JSON.stringify(atletas));
    if (typeof appState !== 'undefined') appState.atletas = atletas;
    atualizarListaAtletas();
    if (typeof atualizarDashboard === 'function') atualizarDashboard();
    const badge = document.getElementById('tab-badge-atletas');
    if (badge) badge.textContent = atletas.length;
    alert(`✅ ${atletas.length} atletas carregados!`);
}

// Exportar funções globalmente
window.abrirModalAtleta = abrirModalAtleta;
window.fecharModalAtleta = fecharModalAtleta;
window.salvarAtleta = salvarAtleta;
window.removerAtleta = removerAtleta;
window.editarAtleta = editarAtleta;
window.salvarEdicaoAtleta = salvarEdicaoAtleta;
window.atualizarListaAtletas = atualizarListaAtletas;
window.resetarDadosExemplo = resetarDadosExemplo;
window.exportarAtletasCSV = exportarAtletasCSV;
window.importarAtletasCSV = importarAtletasCSV;
window.carregarAtletasTeste = carregarAtletasTeste;

console.log('✅ atletas.js carregado - funções disponíveis');