// ==================== torneio.js - LÓGICA CORRETA COM PRELIMINAR ====================

var torneioAtual = {
    categorias: [],
    competicaoAtiva: false,
    nomeCompeticao: '',
    pontuacaoEquipes: new Map()
};

var lutasAtivasPorArea = JSON.parse(localStorage.getItem('gaditas_lutas_ativas') || '{}');
var duracaoEstimadaPorFaixa = { Branca: 5, Azul: 6, Roxa: 7, Marrom: 8, Preta: 10 };

function getDuracaoEstimada(luta) {
    if (!luta || !luta.atletaA) return 5;
    var fA = luta.atletaA.faixa || 'Branca';
    var fB = (luta.atletaB && luta.atletaB.faixa) || 'Branca';
    return Math.max(duracaoEstimadaPorFaixa[fA] || 5, duracaoEstimadaPorFaixa[fB] || 5);
}

// ===== SALVAR / CARREGAR =====
function salvarEstadoCompleto() {
    var estado = {
        categorias: torneioAtual.categorias,
        competicaoAtiva: torneioAtual.competicaoAtiva,
        nomeCompeticao: torneioAtual.nomeCompeticao,
        pontuacaoEquipes: Array.from(torneioAtual.pontuacaoEquipes.entries()),
        data: new Date().toISOString()
    };
    localStorage.setItem('gaditas_torneio_atual', JSON.stringify(estado));
    localStorage.setItem('gaditas_competicao_ativa', torneioAtual.competicaoAtiva ? 'true' : 'false');
    localStorage.setItem('gaditas_competicao_nome', torneioAtual.nomeCompeticao);
    localStorage.setItem('gaditas_lutas_ativas', JSON.stringify(lutasAtivasPorArea));
}

function carregarEstadoSalvo() {
    var salvo = localStorage.getItem('gaditas_torneio_atual');
    if (!salvo) return false;
    try {
        var estado = JSON.parse(salvo);
        torneioAtual.categorias      = estado.categorias || [];
        torneioAtual.competicaoAtiva = estado.competicaoAtiva === true;
        torneioAtual.nomeCompeticao  = estado.nomeCompeticao || '';
        torneioAtual.pontuacaoEquipes = Array.isArray(estado.pontuacaoEquipes)
            ? new Map(estado.pontuacaoEquipes) : new Map();

        torneioAtual.categorias.forEach(function(cat) {
            (cat.lutas || []).forEach(function(l) {
                if (l.inicioMs) l.inicioMs = Number(l.inicioMs);
                if (l.fimMs)    l.fimMs    = Number(l.fimMs);
            });
            // Reconstruir vencedoresRodada se perdido
            if (!cat.vencedoresRodada) cat.vencedoresRodada = [];
        });

        console.log('📂 Carregado:', torneioAtual.categorias.length, 'categorias');
        return true;
    } catch(e) {
        console.error('❌ Erro ao carregar:', e);
        localStorage.removeItem('gaditas_torneio_atual');
        mostrarToast('⚠️ Dados corrompidos foram resetados.', 'erro');
    }
    return false;
}

// ===== COMPETIÇÃO =====
function iniciarNovaCompeticao() {
    var nome = prompt('Nome da competição:', 'Competição ' + new Date().getFullYear());
    if (!nome) return;

    // ✅ Mutar o objeto em vez de reassinar — mantém referência window.torneioAtual
    torneioAtual.categorias      = [];
    torneioAtual.competicaoAtiva = true;
    torneioAtual.nomeCompeticao  = nome;
    torneioAtual.pontuacaoEquipes = new Map();
    lutasAtivasPorArea = {};

    salvarEstadoCompleto();

    var statusDiv = document.getElementById('status-competicao');
    if (statusDiv) {
        statusDiv.innerHTML =
            '<div class="status-competicao-ativa">' +
            '<span>🏆 COMPETIÇÃO ATIVA: ' + nome + '</span>' +
            '<button onclick="finalizarCompeticao()" class="btn-small">🏁 Finalizar</button>' +
            '</div>';
    }
    document.getElementById('categorias-container').innerHTML = '';
    document.getElementById('chaveamento-container').innerHTML = '';
    mostrarToast('✅ Competição "' + nome + '" iniciada!', 'sucesso');
}

function finalizarCompeticao() {
    if (!torneioAtual.competicaoAtiva) { mostrarToast('Nenhuma competição ativa!', 'erro'); return; }
    torneioAtual.competicaoAtiva = false;
    salvarEstadoCompleto();
    var statusDiv = document.getElementById('status-competicao');
    if (statusDiv) {
        statusDiv.innerHTML =
            '<div class="status-competicao-inativa">' +
            '<span>⏸️ Nenhuma competição ativa</span>' +
            '<button onclick="iniciarNovaCompeticao()" class="btn-primary">➕ Nova Competição</button>' +
            '</div>';
    }
    mostrarToast('Competição finalizada!', 'sucesso');
}

// ===== GERAR CHAVEAMENTO =====
function gerarChaveamento() { gerarChaveamentoCompleto(); }

function gerarChaveamentoCompleto() {
    if (!torneioAtual.competicaoAtiva) { mostrarToast('Inicie uma competição primeiro!', 'erro'); return; }

    var atletas = JSON.parse(localStorage.getItem('gaditas_atletas') || '[]');
    if (atletas.length < 2) { mostrarToast('Cadastre pelo menos 2 atletas!', 'erro'); return; }

    var grupos = new Map();
    for (var i = 0; i < atletas.length; i++) {
        var a = atletas[i];
        var idade   = calcularIdade(a.dataNascimento);
        var catIdade = determinarCategoriaIdade(idade);
        var catPeso  = determinarCategoriaPeso(a.sexo, idade, a.peso, a.faixa);
        if (!faixaPermitida(a.faixa, catIdade)) continue;
        var chave = a.sexo + '_' + catIdade.nome + '_' + a.faixa + '_' + catPeso.nome;
        var nome  = (a.sexo === 'M' ? 'Masculino' : 'Feminino') + ' | ' + catIdade.nome + ' | ' + a.faixa + ' | ' + catPeso.nome;
        if (!grupos.has(chave)) grupos.set(chave, { atletas: [], nome: nome, chave: chave });
        grupos.get(chave).atletas.push(a);
    }

    if (grupos.size === 0) { mostrarToast('Nenhuma categoria válida!', 'erro'); return; }

    torneioAtual.categorias = [];
    lutasAtivasPorArea = {};

    var areas   = window.areasLuta || ['Tatame 1', 'Tatame 2', 'Tatame 3'];
    var areaIdx = 0;

    var resumoContainer = document.getElementById('categorias-container');
    var container       = document.getElementById('chaveamento-container');

    var resumoHtml = '<div class="categorias-resumo"><h3>📋 ' + grupos.size + ' Categorias</h3><div class="categorias-grid">';
    grupos.forEach(function(g) {
        resumoHtml += '<div class="categoria-resumo-card"><h4>' + g.nome + '</h4><p>👥 ' + g.atletas.length + ' atletas</p></div>';
    });
    resumoHtml += '</div></div>';
    resumoContainer.innerHTML = resumoHtml;
    container.innerHTML = '<h3>🏆 CHAVEAMENTO</h3>';

    grupos.forEach(function(grupo, chave) {
        var resultado = gerarLutas(grupo.atletas);
        var area = areas[areaIdx % areas.length];
        areaIdx++;

        var campeaoAuto = grupo.atletas.length === 1 ? grupo.atletas[0] : null;

        var categoria = {
            nome: grupo.nome,
            chave: chave,
            atletas: grupo.atletas,
            lutas: resultado.lutas,
            atletasEspera: resultado.atletasEspera, // ✅ Atletas diretos aguardando fase principal
            vencedoresRodada: campeaoAuto ? [campeaoAuto] : [],
            campeao: campeaoAuto,
            vice: null,
            rodada: 1,
            area: area,
            fase: resultado.faseInicial
        };
        torneioAtual.categorias.push(categoria);

        var safeId = chave.replace(/[^a-zA-Z0-9]/g, '_');
        container.innerHTML +=
            '<div class="categoria-chave" data-categoria="' + chave + '" id="cat-' + safeId + '">' +
            '<div class="categoria-header">' +
            '<h4>🏅 ' + grupo.nome + '</h4>' +
            '<span class="area-badge">📍 ' + area + '</span>' +
            '<span>' + grupo.atletas.length + ' atletas</span>' +
            '<span class="fase-badge">' + resultado.faseInicial + '</span>' +
            '</div>' +
            '<div class="lutas-container" id="lutas-' + safeId + '">' +
            resultado.lutas.map(function(l) { return renderLuta(l, chave, safeId); }).join('') +
            '</div>' +
            (resultado.atletasEspera.length > 0 ?
                '<div class="atletas-espera-info" style="padding:8px;color:#8A9CB0;font-size:0.8rem">⏳ Aguardando fase principal: ' +
                resultado.atletasEspera.map(function(a){ return a.nome; }).join(', ') +
                '</div>' : '') +
            '<div class="categoria-actions">' +
            '<button onclick="avancarRodadaCategoria(\'' + chave + '\')" class="btn-secondary">➡️ Avançar Rodada</button>' +
            '</div>' +
            '</div>';
    });

    salvarEstadoCompleto();
    mostrarToast('Chaveamento gerado com ' + grupos.size + ' categorias!', 'sucesso');
}

// ===== GERAR LUTAS (LÓGICA PRINCIPAL) =====
//
// REGRA:
// - Potência de 2 exata (2,4,8,16): bracket normal, sem preliminar
// - 3 atletas: lógica especial (semifinal → repescagem → final)
// - Qualquer outro N:
//     prevPow2 = maior potência de 2 menor que N
//     numPrelim = N - prevPow2
//     numPrelim pares lutam na fase preliminar
//     os outros (prevPow2 - numPrelim) entram direto na fase principal
//     vencedores do preliminar + diretos = bracket de prevPow2 atletas
//
// Exemplos:
//   5 atletas → prevPow2=4, numPrelim=1 → 1 luta preliminar, 3 entram direto → semifinal (4)
//   6 atletas → prevPow2=4, numPrelim=2 → 2 lutas preliminares, 2 entram direto → semifinal (4)
//   9 atletas → prevPow2=8, numPrelim=1 → 1 luta preliminar, 7 entram direto → quartas (8)
//  17 atletas → prevPow2=16, numPrelim=1 → 1 luta preliminar, 15 entram direto → oitavas (16)

function gerarLutas(atletas) {
    var n = atletas.length;

    if (n === 0) return { lutas: [], atletasEspera: [], faseInicial: '' };

    // 1 atleta — campeão automático
    if (n === 1) {
        return {
            lutas: [],
            atletasEspera: [],
            faseInicial: 'Campeão'
        };
    }

    // 2 atletas — 1 luta direta
    if (n === 2) {
        return {
            lutas: [criarLuta(1, atletas[0], atletas[1], 1, 'Final')],
            atletasEspera: [],
            faseInicial: 'Final'
        };
    }

    // 3 atletas — lógica especial existente
    if (n === 3) {
        var emb3 = embaralharEvitandoMesmaAcademia(atletas.slice());
        return {
            lutas: [
                criarLuta(1, emb3[0], emb3[1], 1, 'Semifinal'),
                criarLuta(2, null, emb3[2], 1, 'Repescagem', 1),
                criarLuta(3, null, null, 1, 'Final', null, [1, 2])
            ],
            atletasEspera: [],
            faseInicial: 'Semifinal'
        };
    }

    // Potência de 2 exata — bracket normal sem preliminar
    var prevPow2 = Math.pow(2, Math.floor(Math.log2(n)));
    if (n === prevPow2) {
        var emb = embaralharEvitandoMesmaAcademia(atletas.slice());
        var lutas = [];
        for (var i = 0; i < n / 2; i++) {
            lutas.push(criarLuta(i + 1, emb[i * 2], emb[i * 2 + 1], 1, calcularFase(n, 1)));
        }
        return { lutas: lutas, atletasEspera: [], faseInicial: calcularFase(n, 1) };
    }

    // ✅ LÓGICA CORRETA: fase preliminar para números não-potência de 2
    var numPrelim = n - prevPow2;
    var emb = embaralharEvitandoMesmaAcademia(atletas.slice());

    // Primeiros numPrelim*2 atletas vão para o preliminar
    var prelimAtletas = emb.slice(0, numPrelim * 2);
    // Restantes entram direto na fase principal
    var atletasEspera = emb.slice(numPrelim * 2);

    var lutas = [];
    for (var i = 0; i < numPrelim; i++) {
        lutas.push(criarLuta(i + 1, prelimAtletas[i * 2], prelimAtletas[i * 2 + 1], 1, 'Preliminar'));
    }

    var fasePrincipal = calcularFase(prevPow2, 1);
    console.log('⚙️ ' + n + ' atletas → ' + numPrelim + ' lutas preliminares → ' + atletasEspera.length + ' diretos → ' + fasePrincipal);

    return {
        lutas: lutas,
        atletasEspera: atletasEspera,
        faseInicial: 'Preliminar → ' + fasePrincipal
    };
}

function criarLuta(id, atletaA, atletaB, rodada, fase, aguardaPerdedorDe, aguardaVencedorDe) {
    return {
        id: id,
        atletaA: atletaA || null,
        atletaB: atletaB || null,
        vencedor: null,
        finalizada: false,
        rodada: rodada,
        fase: fase || '',
        tipo: fase || '',
        aguardaPerdedorDe: aguardaPerdedorDe || null,
        aguardaVencedorDe: aguardaVencedorDe || null,
        inicioMs: null,
        fimMs: null,
        duracaoRealMin: null,
        temBye: false
    };
}

// ===== FASE =====
function calcularFase(totalAtletas, rodadaAtual) {
    if (totalAtletas === 3) {
        return ({1:'Semifinal', 2:'Repescagem', 3:'Final'})[rodadaAtual] || 'Final';
    }
    var pot = Math.pow(2, Math.ceil(Math.log2(Math.max(totalAtletas, 2))));
    var totalRodadas = Math.log2(pot);
    var restantes = totalRodadas - (rodadaAtual - 1);
    if (restantes <= 1) return 'Final';
    if (restantes <= 2) return 'Semifinal';
    if (restantes <= 3) return 'Quartas de Final';
    if (restantes <= 4) return 'Oitavas de Final';
    return 'Fase ' + rodadaAtual;
}

function getFaseCat(categoria) {
    if (!categoria) return '';
    return calcularFase(categoria.atletas ? categoria.atletas.length : 2, categoria.rodada || 1);
}

// ===== EMBARALHAR =====
function embaralharEvitandoMesmaAcademia(atletas) {
    for (var i = atletas.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = atletas[i]; atletas[i] = atletas[j]; atletas[j] = tmp;
    }
    var melhorou = true, max = 50;
    while (melhorou && max-- > 0) {
        melhorou = false;
        for (var i = 0; i < atletas.length - 1; i += 2) {
            var a = atletas[i], b = atletas[i + 1];
            if (!a || !b || a.academia !== b.academia) continue;
            for (var k = 0; k < atletas.length; k++) {
                if (k === i || k === i + 1) continue;
                var c = atletas[k];
                if (!c) continue;
                var par = k % 2 === 0 ? atletas[k + 1] : atletas[k - 1];
                if (c.academia !== a.academia && !(par && par.academia === b.academia)) {
                    atletas[i + 1] = c; atletas[k] = b;
                    melhorou = true; break;
                }
            }
            if (melhorou) break;
        }
    }
    return atletas;
}

// ===== RENDER LUTA =====
function renderLuta(luta, chave, safeId) {
    if (!luta.atletaA && !luta.atletaB) return ''; // luta ainda não populada

    var finalizada = luta.finalizada;
    var aoVivo     = !finalizada && luta.inicioMs && !luta.fimMs;

    var cardClass   = 'luta-card' + (finalizada ? ' finalizada' : '') + (aoVivo ? ' ao-vivo' : '');
    var statusLabel = finalizada ? '✓ FINALIZADA' : (aoVivo ? '🔴 AO VIVO' : '⏳ PENDENTE');
    var statusClass = finalizada ? 'status-finalizada' : (aoVivo ? 'status-ao-vivo' : 'status-pendente');
    var faseLabel   = luta.fase ? '<span class="fase-mini">' + luta.fase + '</span>' : '';

    var btnVitoriaA = '', btnVitoriaB = '';
    if (!finalizada) {
        if (aoVivo || luta.atletaA) {
            btnVitoriaA = '<button onclick="declararVencedor(\'' + chave + '\',' + luta.id + ',\'A\')" class="btn-vitoria">🏆 Vencedor</button>';
        }
        if ((aoVivo || luta.atletaB) && luta.atletaB) {
            btnVitoriaB = '<button onclick="declararVencedor(\'' + chave + '\',' + luta.id + ',\'B\')" class="btn-vitoria">🏆 Vencedor</button>';
        }
    }

    var btnIniciar = '';
    if (!finalizada && !aoVivo && luta.atletaA && luta.atletaB) {
        btnIniciar =
            '<div style="text-align:center;margin-top:10px;">' +
            '<button onclick="iniciarLuta(\'' + chave + '\',' + luta.id + ')" class="btn-iniciar-luta">🥋 Iniciar Luta</button>' +
            '</div>';
    }

    var vencedorA = luta.vencedor && luta.atletaA && String(luta.vencedor.id) === String(luta.atletaA.id);
    var vencedorB = luta.vencedor && luta.atletaB && String(luta.vencedor.id) === String(luta.atletaB.id);

    var duracaoInfo = '';
    if (finalizada && luta.duracaoRealMin != null) {
        duracaoInfo = '<div style="text-align:center;font-size:0.65rem;color:#8A9CB0;margin-top:6px;">⏱️ ' + luta.duracaoRealMin + ' min</div>';
    }

    return '<div class="' + cardClass + '">' +
        '<div class="luta-header">' +
        '<span>🥋 Luta ' + luta.id + ' ' + faseLabel + '</span>' +
        '<span class="luta-status ' + statusClass + '">' + statusLabel + '</span>' +
        '</div>' +
        '<div class="luta-atletas">' +
        '<div class="luta-atleta ' + (vencedorA ? 'vencedor' : '') + '">' +
        '<div class="atleta-nome">' + (luta.atletaA ? luta.atletaA.nome : '⏳ Aguardando') + '</div>' +
        '<div class="atleta-academia">' + (luta.atletaA ? luta.atletaA.academia : '') + '</div>' +
        (luta.atletaA ? btnVitoriaA : '') +
        '</div>' +
        '<div class="luta-vs">VS</div>' +
        '<div class="luta-atleta ' + (vencedorB ? 'vencedor' : '') + '">' +
        '<div class="atleta-nome">' + (luta.atletaB ? luta.atletaB.nome : '⏳ Aguardando') + '</div>' +
        '<div class="atleta-academia">' + (luta.atletaB ? luta.atletaB.academia : '') + '</div>' +
        (luta.atletaB ? btnVitoriaB : '') +
        '</div>' +
        '</div>' +
        btnIniciar +
        duracaoInfo +
        '</div>';
}

// ===== INICIAR LUTA =====
function iniciarLuta(chave, lutaId) {
    var categoria = torneioAtual.categorias.find(function(c) { return c.chave === chave; });
    if (!categoria) return;
    var luta = categoria.lutas.find(function(l) { return l.id === lutaId; });
    if (!luta || luta.finalizada || luta.inicioMs) { mostrarToast('Luta já iniciada ou finalizada!', 'erro'); return; }
    if (!luta.atletaA || !luta.atletaB) { mostrarToast('Aguardando atletas para essa luta!', 'erro'); return; }

    var area = categoria.area;
    if (lutasAtivasPorArea[area] && lutasAtivasPorArea[area].lutaId !== lutaId) {
        mostrarToast('⚠️ Já há uma luta ativa no ' + area + '!', 'erro'); return;
    }

    torneioAtual.categorias.forEach(function(c) {
        if (c.area !== area) return;
        (c.lutas || []).forEach(function(x) {
            if (x.id !== luta.id && x.inicioMs && !x.fimMs && !x.finalizada) x.inicioMs = null;
        });
    });

    luta.inicioMs = Date.now();
    lutasAtivasPorArea[area] = { chave: chave, lutaId: lutaId, ativo: true, inicioMs: luta.inicioMs };

    var safeId = chave.replace(/[^a-zA-Z0-9]/g, '_');
    var container = document.getElementById('lutas-' + safeId);
    if (container) container.innerHTML = categoria.lutas.map(function(l) { return renderLuta(l, chave, safeId); }).join('');

    salvarEstadoCompleto();
    mostrarToast('🥋 Luta iniciada no ' + area + '!', 'sucesso');
}

// ===== DECLARAR VENCEDOR =====
function declararVencedor(chave, lutaId, lado) {
    var categoria = torneioAtual.categorias.find(function(c) { return c.chave === chave; });
    if (!categoria) return;
    var luta = categoria.lutas.find(function(l) { return l.id === lutaId; });
    if (!luta || luta.finalizada) return;

    var vencedor = lado === 'A' ? luta.atletaA : luta.atletaB;
    if (!vencedor) { mostrarToast('Atleta não disponível!', 'erro'); return; }

    var fimMs = Date.now();
    luta.fimMs = fimMs;
    luta.vencedor = vencedor;
    luta.finalizada = true;
    luta.duracaoRealMin = luta.inicioMs ? Math.ceil((fimMs - luta.inicioMs) / 60000) : getDuracaoEstimada(luta);

    var atraso = luta.duracaoRealMin - getDuracaoEstimada(luta);
    if (atraso > 0) {
        var atrasos = JSON.parse(localStorage.getItem('gaditas_atrasos_area') || '{}');
        atrasos[categoria.area] = (atrasos[categoria.area] || 0) + atraso;
        localStorage.setItem('gaditas_atrasos_area', JSON.stringify(atrasos));
    }

    if (lutasAtivasPorArea[categoria.area] && lutasAtivasPorArea[categoria.area].lutaId === lutaId) {
        delete lutasAtivasPorArea[categoria.area];
    }

    if (!categoria.vencedoresRodada) categoria.vencedoresRodada = [];
    if (!categoria.vencedoresRodada.some(function(v){ return String(v.id) === String(vencedor.id); }))
        categoria.vencedoresRodada.push(vencedor);

    // Propagar para chave de 3 atletas
    propagarResultado3Atletas(categoria, luta, vencedor, lado);

    var safeId = chave.replace(/[^a-zA-Z0-9]/g, '_');
    var container = document.getElementById('lutas-' + safeId);
    if (container) container.innerHTML = categoria.lutas.map(function(l) { return renderLuta(l, chave, safeId); }).join('');

    mostrarToast('🏆 ' + vencedor.nome + ' venceu!', 'sucesso');
    salvarEstadoCompleto();

    // Verificar se todas as lutas da rodada atual terminaram
    var todasFinalizadas = categoria.lutas.every(function(l) { return l.finalizada; });
    if (!todasFinalizadas) return;

    var vencedores = categoria.vencedoresRodada || [];

    // ✅ Se há atletas em espera, avançar para fase principal automaticamente
    if (categoria.atletasEspera && categoria.atletasEspera.length > 0) {
        avancarRodadaCategoria(chave);
        return;
    }

    if (vencedores.length === 1 && !categoria.campeao) {
        finalizarCategoria(chave);
    } else if (vencedores.length >= 2 && !categoria.campeao) {
        avancarRodadaCategoria(chave);
    }
}

function definirVencedorLuta(chave, lutaId, lado) { declararVencedor(chave, lutaId, lado); }

// ===== AVANÇAR RODADA =====
function avancarRodadaCategoria(chave) {
    var categoria = torneioAtual.categorias.find(function(c) { return c.chave === chave; });
    if (!categoria || categoria.campeao) return;

    var todasFinalizadas = categoria.lutas.every(function(l) { return l.finalizada; });
    if (!todasFinalizadas) { mostrarToast('Finalize todas as lutas primeiro!', 'erro'); return; }

    var vencedores = categoria.vencedoresRodada || [];
    var espera     = categoria.atletasEspera   || [];

    // ✅ LÓGICA PRINCIPAL: combinar vencedores do preliminar com atletas em espera
    var atletasProximaFase = espera.concat(vencedores);

    console.log('➡️ Avançar | vencedores preliminar: ' + vencedores.length + ' | em espera: ' + espera.length + ' | total: ' + atletasProximaFase.length);

    if (atletasProximaFase.length === 1) { finalizarCategoria(chave); return; }
    if (atletasProximaFase.length < 2) { mostrarToast('Atletas insuficientes para avançar!', 'erro'); return; }

    // Salvar histórico
    if (!categoria.historicoRodadas) categoria.historicoRodadas = [];
    categoria.historicoRodadas.push({
        rodada: categoria.rodada || 1,
        fase: categoria.fase,
        lutas: categoria.lutas.map(function(l) { return JSON.parse(JSON.stringify(l)); })
    });

    // ✅ Limpar espera — já foram combinados
    categoria.atletasEspera   = [];
    categoria.vencedoresRodada = [];
    categoria.rodada = (categoria.rodada || 1) + 1;

    // Gerar próxima fase com TODOS os atletas combinados
    var resultado = gerarLutas(atletasProximaFase);
    categoria.lutas         = resultado.lutas;
    categoria.atletasEspera = resultado.atletasEspera;
    categoria.fase          = resultado.faseInicial;

    var safeId = chave.replace(/[^a-zA-Z0-9]/g, '_');
    var container = document.getElementById('lutas-' + safeId);
    if (container) container.innerHTML = categoria.lutas.map(function(l) { return renderLuta(l, chave, safeId); }).join('');

    // Mostrar espera
    var espInfo = document.getElementById('espera-' + safeId);
    if (espInfo && resultado.atletasEspera.length > 0) {
        espInfo.innerHTML = '⏳ Diretos para próxima fase: ' + resultado.atletasEspera.map(function(a){ return a.nome; }).join(', ');
    }

    salvarEstadoCompleto();
    mostrarToast('✅ ' + resultado.faseInicial + ' iniciada com ' + atletasProximaFase.length + ' atletas!', 'sucesso');
}

// ===== FINALIZAR CATEGORIA =====
function finalizarCategoria(chave) {
    var categoria = torneioAtual.categorias.find(function(c) { return c.chave === chave; });
    if (!categoria || categoria.campeao) return;

    var vencedores = categoria.vencedoresRodada || [];
    categoria.campeao = vencedores[0];
    categoria.vice    = vencedores[1] || null;

    var safeId = chave.replace(/[^a-zA-Z0-9]/g, '_');
    var el = document.getElementById('cat-' + safeId);
    if (el) {
        el.innerHTML =
            '<div class="categoria-finalizada">' +
            '<h4>🏆 CATEGORIA FINALIZADA</h4>' +
            '<div class="campeao-info">🥇 ' + categoria.campeao.nome + '</div>' +
            '<p>' + categoria.campeao.academia + '</p>' +
            '</div>';
    }

    salvarEstadoCompleto();
    mostrarToast('🏆 ' + categoria.campeao.nome + ' campeão!', 'sucesso');
}

function forcarSalvamentoTV() {
    salvarEstadoCompleto();
    mostrarToast('✅ Sincronizado!', 'sucesso');
}

// ===== 3 ATLETAS =====
function propagarResultado3Atletas(categoria, lutaFinalizada, vencedor, lado) {
    var lutas = categoria.lutas;
    if (!lutas || lutas.length !== 3) return;
    var perdedor = lado === 'A' ? lutaFinalizada.atletaB : lutaFinalizada.atletaA;
    if (lutaFinalizada.id === 1) {
        var l2 = lutas.find(function(l){ return l.id === 2; });
        if (l2 && !l2.atletaA) l2.atletaA = perdedor;
    }
    if (lutaFinalizada.id === 2) {
        var l3 = lutas.find(function(l){ return l.id === 3; });
        var l1 = lutas.find(function(l){ return l.id === 1; });
        if (l3) {
            l3.atletaB = vencedor;
            if (l1 && l1.vencedor) l3.atletaA = l1.vencedor;
        }
    }
}

// ===== EXPORTS =====
window.torneioAtual            = torneioAtual;
window.calcularFase            = calcularFase;
window.getFaseCat              = getFaseCat;
window.iniciarNovaCompeticao   = iniciarNovaCompeticao;
window.finalizarCompeticao     = finalizarCompeticao;
window.gerarChaveamento        = gerarChaveamento;
window.gerarChaveamentoCompleto = gerarChaveamentoCompleto;
window.iniciarLuta             = iniciarLuta;
window.declararVencedor        = declararVencedor;
window.definirVencedorLuta     = definirVencedorLuta;
window.avancarRodadaCategoria  = avancarRodadaCategoria;
window.finalizarCategoria      = finalizarCategoria;
window.forcarSalvamentoTV      = forcarSalvamentoTV;
window.carregarEstadoSalvo     = carregarEstadoSalvo;
window.renderLuta              = renderLuta;

console.log('✅ torneio.js - LÓGICA PRELIMINAR CORRETA');